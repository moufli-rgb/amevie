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

Le projet utilise **11 fonctions serveur** (la limite de l'offre gratuite Vercel est de 12) :

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
| `/api/payments` | paiement de l'abonnement en cryptomonnaie (NOWPayments) |

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

## Livres et contenus déjà fournis (automatique)

Vous n'avez **rien à faire** : dès que les tables existent (`supabase/schema.sql`), la première personne qui ouvre le site déclenche l'ajout de 26 publications au nom du pasteur « Équipe Ame & Vie ». Cela prend quelques secondes, une seule fois.
- 8 Paroles de Dieu ;
- 5 enseignements ;
- 7 contenus spirituels ;
- 6 livres et documents PDF à télécharger : plan de lecture de la Bible en un an, premiers pas dans la foi, carnet de méditation, guide de prière 21 jours, étude des Béatitudes, 30 versets à mémoriser.

Une partie est Gratuite, une partie est Premium. Les pasteurs ajoutent ensuite leurs propres publications à côté.
Vous pouvez modifier ou supprimer chaque contenu dans **Administration → Contenus**. S'ils sont supprimés, ils ne reviennent pas tout seuls ; le bouton **Ajouter les contenus d'exemple** (Base de données) permet de les remettre.
Les fichiers sources se trouvent dans `seed/` ; les scripts qui les génèrent sont `scripts/exemples_*.py`.

## Images

Les photos sont listées dans `src/config/images.json`. Avant chaque build, `scripts/download-images.mjs` télécharge celles d'Unsplash dans `public/images/site/`. Sans réseau, le site les charge directement depuis Unsplash.
Pour utiliser vos propres photos : enregistrez-les en WebP sous `public/images/site/<nom>-640.webp` et `<nom>-1376.webp`, puis retirez la ligne `"unsplash"` correspondante.

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
| **Couleurs** (principale, secondaire, accent, fond, texte, WhatsApp, couleur de chaque type de contenu) | `src/index.css`, bloc « À REMPLIR » en haut du fichier (palette chaleureuse active, version neutre proposée juste en dessous) |
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

---

## Paiement de l'abonnement en cryptomonnaie

Quand le visiteur clique sur **« Payer en crypto »**, il choisit entre deux moyens de paiement.

| | Paiement automatique | Envoi direct (manuel) |
|---|---|---|
| Comment | Page sécurisée NOWPayments, avec plus de 300 cryptos au choix | Votre adresse de portefeuille et son QR code, puis le visiteur colle le numéro de transaction |
| Accès Premium | Ouvert **tout seul** après confirmation | Ouvert quand **vous cliquez « Valider »** |
| À régler | Un compte NOWPayments et 2 variables Vercel | Vos adresses, dans **Administration → Paiements crypto → Mes adresses** |

Vous pouvez activer l'un, l'autre ou les deux. Le prix d'un mois se règle avec `PRIX_ABONNEMENT` : 10 par défaut, dans la devise `DEVISE_ABONNEMENT`, `usd` par défaut.

### Paiement manuel : valider un paiement
1. Le tableau de bord affiche **« 1 paiement à valider »**, et un badge apparaît sur **Paiements crypto**.
2. Ouvrez l'onglet **À valider**. Vous voyez le visiteur, l'adresse utilisée et le numéro de transaction.
3. Cliquez sur **« Vérifier sur la blockchain »** pour contrôler le montant et l'adresse de réception (Tronscan, Etherscan, BscScan, mempool…).
4. Cliquez sur **Valider · donner l'accès** : l'abonnement d'un mois est activé, ou prolongé à la suite s'il est encore en cours. Sinon, cliquez sur **Refuser**.
5. Le visiteur voit le résultat dans **Mon abonnement**.

Un même numéro de transaction ne peut être déclaré qu'une fois, et un paiement ne peut être validé qu'une fois.

### Paiement automatique : créer le compte NOWPayments

1. Créez un compte sur <https://nowpayments.io>, puis vérifiez votre email.
2. **Settings → Payment details** : ajoutez l'adresse de votre portefeuille, celle où vous recevrez l'argent (par exemple une adresse USDT TRC20 ou BTC).
3. **Settings → API keys** : cliquez sur **Add new key**, puis copiez la clé. C'est votre `NOWPAYMENTS_API_KEY`.
4. **Settings → Payments → Instant payment notifications** : générez la **IPN secret key**, puis copiez-la. C'est votre `NOWPAYMENTS_IPN_SECRET`.

#### Ajouter les variables dans Vercel
Dans PowerShell, dans le dossier du projet, ajoutez chaque variable (collez la valeur quand Vercel la demande) :
```powershell
vercel env add NOWPAYMENTS_API_KEY production
vercel env add NOWPAYMENTS_IPN_SECRET production
vercel env add PRIX_ABONNEMENT production
vercel env add DEVISE_ABONNEMENT production
```
- `PRIX_ABONNEMENT` : le prix d'un mois, par exemple `10`.
- `DEVISE_ABONNEMENT` : la devise du prix, par exemple `usd` ou `eur`.

Sans `PRIX_ABONNEMENT` et `DEVISE_ABONNEMENT`, le prix est de 10 USD.

Redéployez ensuite avec `vercel deploy --prod`.

#### Suivre les paiements
**Administration → Paiements crypto** montre chaque paiement : qui a payé, combien, en quelle crypto, et si l'abonnement a été activé.

### Sécurité
- Le prix est fixé par le serveur ; le navigateur ne peut pas le modifier.
- Chaque notification de NOWPayments est vérifiée avec la signature HMAC-SHA512 (`NOWPAYMENTS_IPN_SECRET`).
- Un paiement ne crédite qu'une seule fois.
- Un montant inférieur au prix n'active rien : le paiement passe « À vérifier ».

Vous pouvez toujours activer ou prolonger un abonnement à la main dans **Visiteurs**.

---

## Guide spirituel « Jean » et accès de l'administration

- Les « pasteurs » s'appellent désormais **guides spirituels**. Le guide de la plateforme, auteur des contenus d'exemple, s'appelle **Jean**.
- Pour agir dans l'espace d'un guide : **Administration → Guides spirituels → Ouvrir son espace**. Un bandeau rappelle que vous êtes en mode administration, et **« Revenir à l'administration »** vous ramène à votre espace. Chaque accès est noté dans le journal d'activité.
- Pour **ajouter un livre** : **Administration → Contenus → Ajouter un livre ou un document**. Cela ouvre directement le formulaire « Document » dans l'espace de Jean. Formats acceptés : PDF, EPUB, Word, PowerPoint, audio, vidéo MP4, image et texte, jusqu'à 50 Mo.

> ⚠️ Après cette mise à jour, **ré-exécutez tout le fichier `supabase/schema.sql`** dans le SQL Editor de Supabase. Vous pouvez le relancer sans risque. Il ajoute la table `payments`, le format EPUB et le nom de famille facultatif des guides.

---

## Religions : Christianisme, Islam, Spiritualité universelle

- Chaque publication a une **religion**, choisie dans le formulaire de publication. La bibliothèque propose un filtre : Toutes les traditions, Christianisme, Islam ou Spiritualité universelle. Liens directs : `/#bibliotheque/chretien`, `/#bibliotheque/musulman`, `/#bibliotheque/universel`.
- Contenus déjà fournis : 26 chrétiens (Jean), 14 musulmans (dont 3 livres PDF : prière pour débutants, 99 noms d'Allah, Ramadan) et 10 universels (dont 3 livres PDF : méditation 21 jours, carnet de gratitude, 40 sagesses).
- Les guides **« Guide Islam »** et **« Guide Sagesse »** ont des noms provisoires. Renommez-les dans **Administration → Guides spirituels → Modifier**.
- Les citations du Coran sont des **traductions du sens** rédigées pour la plateforme. Faites-les relire par une personne qualifiée.
- Les nouveaux contenus s'ajoutent tout seuls à la prochaine visite, même si le site est déjà en ligne. Ce que vous avez supprimé ne revient pas.
- Les illustrations Islam et Universel sont des dessins originaux (`scripts/illustrations_religions.py`). Les contenus et les PDF se régénèrent avec `scripts/exemples_religions.py`.
