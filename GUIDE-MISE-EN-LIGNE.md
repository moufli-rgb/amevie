# Guide de mise en ligne — Ame & Vie

Ce guide part de zéro. Il couvre trois étapes : la base Supabase, la création du compte administrateur et la mise en ligne sur Vercel.
Durée : environ 20 minutes.

---

## 1. Configurer Supabase

### 1.1 Créer le projet
1. Allez sur <https://supabase.com>, connectez-vous et cliquez sur **New project**.
2. Choisissez un nom (ex. `ame-et-vie`), un mot de passe de base de données (gardez-le) et une région proche de vos utilisateurs (ex. *West EU (Paris)*).
3. Attendez la fin de la création (1 à 2 minutes).

### 1.2 Créer les tables, la sécurité et le stockage
1. Supabase → **SQL Editor** → **New query**.
2. Copiez **tout** le contenu de `supabase/schema.sql`, collez-le, puis cliquez sur **Run**.
3. Vérifiez dans **Table Editor** que ces tables existent : `users`, `subscriptions`, `pastors`, `admin_users`, `contents`, `favorites`, `prayer_requests`, `activity_logs`, `login_attempts` et `site_visits`.
4. Vérifiez dans **Storage** qu'un bucket **privé** nommé `documents` existe. Il contient les fichiers des pasteurs (50 Mo maximum par fichier).

> **Sécurité :** la Row Level Security est activée sur toutes les tables, sans aucune politique publique. Les clés `anon` et `authenticated` ne peuvent donc **rien** lire ni écrire. Seules les fonctions serveur Vercel, avec la clé `service_role`, accèdent aux données. Elles vérifient le rôle et l'abonnement à chaque requête.

### 1.3 (Conseillé) Bloquer les inscriptions Supabase Auth
Supabase → **Authentication** → **Providers** → **Email** : désactivez **Allow new users to sign up**.
Les visiteurs et les pasteurs n'utilisent pas Supabase Auth : seul l'administrateur l'utilise.

### 1.4 (Facultatif) Marquer les abonnements expirés chaque nuit
L'expiration est **déjà automatique** : à chaque requête, le serveur compare la date de fin à l'heure actuelle et coupe l'accès Premium dès qu'elle est dépassée.
Si vous souhaitez en plus que la colonne `status` passe à « expire » chaque nuit dans la base :

1. Supabase → **Database** → **Extensions** → activez **pg_cron**.
2. Exécutez dans le SQL Editor :
   ```sql
   select cron.schedule('expirer-abonnements', '5 0 * * *', $$select public.expire_subscriptions()$$);
   ```

---

## 2. Créer le compte administrateur

1. Supabase → **Authentication** → **Users** → **Add user** → **Create new user**.
2. Saisissez l'email et un mot de passe solide, cochez **Auto Confirm User**, puis validez.
3. **SQL Editor** : ouvrez `supabase/ajout-admin.sql`, remplacez `admin@exemple.com` par cet email, puis cliquez sur **Run**.
4. Une fois le site en ligne, connectez-vous à l'adresse **`https://votre-site/#admin`**.

Seuls les comptes listés dans `admin_users` peuvent entrer dans l'administration. Le lien `/#admin` n'apparaît nulle part sur le site public.
Pour ajouter un autre administrateur, répétez les étapes 1 à 3.

---

## 3. Récupérer les clés

Supabase → **Project Settings** → **API** :

| Variable                    | Où la trouver                                   |
|-----------------------------|--------------------------------------------------|
| `SUPABASE_URL`              | *Project URL*                                    |
| `SUPABASE_SERVICE_ROLE_KEY` | *Project API keys* → `service_role` (secret !)   |
| `SUPABASE_ANON_KEY`         | *Project API keys* → `anon` `public`             |

Générez ensuite le secret de session :

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Le résultat est votre `PDG_AUTH_SECRET` (32 caractères minimum).

> ⚠️ N'ajoutez **jamais** le préfixe `VITE_` à ces variables : elles seraient alors envoyées au navigateur.

---

## 4. Déployer sur Vercel

1. Envoyez le code sur GitHub :
   ```bash
   git add -A
   git commit -m "Ame & Vie : plateforme complète"
   git push
   ```
2. Sur <https://vercel.com>, cliquez sur **Add New… → Project**, puis importez le dépôt GitHub.
3. Vercel détecte **Vite** automatiquement : `vercel.json` fixe la commande `npm run build` et le dossier `dist`.
4. Avant de cliquer sur **Deploy**, ouvrez **Environment Variables** et ajoutez les 4 variables :
   `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY` et `PDG_AUTH_SECRET`. Cochez *Production*, *Preview* et *Development*.
5. Cliquez sur **Deploy**.

Le projet utilise **10 fonctions serveur** (la limite de l'offre gratuite Vercel est de 12) :

| Route | Rôle |
|---|---|
| `/api/auth` | inscription visiteur et pasteur, connexion, connexion admin, vérification de session, compteur de visites |
| `/api/profile` | profil et mot de passe de l'utilisateur connecté |
| `/api/contents` | bibliothèque, détail (Premium protégé), publications des pasteurs, gestion par l'administrateur |
| `/api/files` | envoi des documents (lien signé) et téléchargement (seulement si l'accès est autorisé) |
| `/api/subscriptions` | activation, renouvellement, prolongation, modification et désactivation des abonnements |
| `/api/users` | gestion des visiteurs (administrateur) |
| `/api/pastors` | gestion des pasteurs (administrateur) et liste publique |
| `/api/admin` | statistiques, journal d'activité, état de la base |
| `/api/favorites` | « Ma bibliothèque » (Premium) |
| `/api/prayers` | demandes de prière |

### Nom de domaine (facultatif)
Vercel → projet → **Settings → Domains** : ajoutez votre domaine et suivez les instructions DNS.

---

## 5. Vérifier après la mise en ligne

| Adresse | Attendu |
|---|---|
| `/` | page d'accueil |
| `/#apropos`, `/#pasteurs`, `/#bibliotheque` | pages publiques |
| `/#inscription` | création de compte visiteur |
| `/#pasteur` | connexion ou création de compte pasteur |
| `/#admin` | connexion administrateur |

Scénario complet :
1. Créez un compte visiteur sur `/#inscription`.
2. Créez un compte pasteur sur `/#pasteur`. Le message « en attente de validation » s'affiche.
3. Sur `/#admin`, ouvrez **Pasteurs** et cliquez sur **Activer**.
4. Côté pasteur, publiez un contenu **Premium**. Côté visiteur, ce contenu doit apparaître avec un cadenas et le message « Abonnement requis ».
5. Côté visiteur, cliquez sur **Faire mon abonnement** : WhatsApp s'ouvre vers le +225 07 59 39 95 66 avec le message déjà rempli.
6. Côté admin, ouvrez **Visiteurs** et cliquez sur **Activer 1 mois**. Le contenu Premium se débloque. L'expiration tombe le même jour le mois suivant.

Si une table manque, l'application l'indique clairement (« La table … n'existe pas encore… »).
La page **Administration → Base de données** montre l'état de chaque table et du stockage.

---

## Développement en local

```bash
npm install
cp .env.example .env.local      # puis remplissez les valeurs
npm i -g vercel                 # une seule fois
vercel link                     # relie le dossier au projet Vercel
vercel dev                      # front-end + fonctions /api sur http://localhost:3000
```

`npm run dev` lance uniquement le front-end, sans l'API.
`npm run lint` vérifie le TypeScript (`tsc --noEmit`). `npm run build` construit le site.

---

## Personnaliser

| Quoi | Où |
|---|---|
| **Couleurs** (principale, secondaire, accent, fond, texte, WhatsApp, succès, erreur) | `src/index.css`, bloc « À REMPLIR » en haut du fichier (une palette chaleureuse d'exemple y est proposée) |
| Nom, slogan, numéro WhatsApp, message automatique | `src/config/site.ts` |
| Types d'abonnement proposés à l'administrateur | `api/_lib/abonnement.ts` → `TYPES_ABONNEMENT` |
| Images du site | `public/images/site/` : remplacez les fichiers WebP en gardant le même nom |

---

## Sécurité en bref

- Mots de passe hachés avec **scrypt** et un sel aléatoire, comparés en temps constant. Ils ne sont jamais stockés en clair ni renvoyés par l'API.
- Sessions signées **HMAC-SHA256**, valables 7 jours, conservées en `sessionStorage`. Elles sont revérifiées toutes les 30 secondes : une session expirée, un compte désactivé ou supprimé entraîne une déconnexion automatique.
- Chaque route vérifie le rôle. Un visiteur ne voit que ses propres données. Un pasteur ne modifie que ses propres publications. Seul l'administrateur gère les utilisateurs, les pasteurs et les abonnements.
- **Premium protégé côté serveur** : le texte et les fichiers d'un contenu Premium ne sont jamais envoyés à un compte sans abonnement actif.
- Toutes les entrées sont validées côté serveur : types, longueurs, emails, uuid, dates, types de fichiers.
- Limitation des tentatives de connexion : 5 échecs par email et 20 par adresse IP en 15 minutes déclenchent un blocage de 15 minutes. Les messages d'erreur restent génériques.
- En-têtes de sécurité dans `vercel.json` : CSP, X-Frame-Options DENY, nosniff, Referrer-Policy, HSTS et Permissions-Policy.
