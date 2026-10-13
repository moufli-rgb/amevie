# Ame & Vie

Plateforme chrétienne avec trois espaces : **Visiteur**, **Pasteur** et **Administrateur**. Elle intègre un abonnement mensuel Premium géré manuellement : paiement sur WhatsApp, puis activation par l'administrateur, et expiration automatique au bout d'un mois.

**Technologies :** React 19 · TypeScript · Vite · Tailwind CSS 4 · Motion · lucide-react · Supabase (PostgreSQL, Auth, Storage) · fonctions serveur Vercel · polices auto-hébergées (@fontsource : Fraunces, Manrope, Caveat).

➡️ **Mise en ligne pas à pas (Supabase, Vercel, compte administrateur) : [GUIDE-MISE-EN-LIGNE.md](./GUIDE-MISE-EN-LIGNE.md)**

## Liens directs

| Page | Lien |
|---|---|
| Accueil | `/` |
| À propos · Pasteurs | `/#apropos` · `/#pasteurs` |
| Contenus · Paroles de Dieu · Documents | `/#bibliotheque` · `/#bibliotheque/parole` · `/#bibliotheque/document` |
| Un contenu | `/#contenu/<id>` |
| Abonnement | `/#abonnement` |
| Connexion · Créer un compte | `/#connexion` · `/#inscription` |
| Espace visiteur | `/#espace` |
| Espace pasteur | `/#pasteur` |
| Administration | `/#admin` *(jamais affiché publiquement)* |

## Gratuit / Premium

| Gratuit (avec un compte) | Premium (abonnement actif) |
|---|---|
| Parole du jour, Paroles de Dieu et contenus gratuits | Enseignements et contenus Premium (texte complet, vidéo) |
| Documents gratuits | Téléchargement des documents Premium |
| Demandes de prière | « Ma bibliothèque » (favoris) |

Les contenus Premium sont marqués d'une couronne ou d'un cadenas. Sans abonnement actif, le serveur n'envoie **jamais** leur texte ni leur fichier : l'utilisateur voit le message « Abonnement requis » et le bouton **Faire mon abonnement**. Ce bouton ouvre WhatsApp vers le +225 07 59 39 95 66 avec un message déjà rempli.

## Fichiers créés ou modifiés

```
api/                          10 fonctions serveur Vercel (limite gratuite : 12)
  auth.ts                     inscription, connexion (visiteur, pasteur, admin), session, visites
  profile.ts                  profil + mot de passe
  contents.ts                 bibliothèque, détail protégé, publications, gestion admin
  files.ts                    envoi signé / téléchargement signé (Supabase Storage privé)
  subscriptions.ts            activer, renouveler, prolonger, modifier, désactiver
  users.ts                    gestion des visiteurs
  pastors.ts                  gestion des pasteurs + liste publique
  admin.ts                    statistiques, alertes, journal d'activité, état de la base
  favorites.ts                « Ma bibliothèque » (Premium)
  prayers.ts                  demandes de prière
  _lib/                       code partagé (non compté comme fonction)
    auth.ts                   rôle + compte relus en base à chaque requête, contrôle Premium
    abonnement.ts             règles d'abonnement (1 mois, expiration automatique)
    contenus.ts               validation des publications, protection Premium
    crypto.ts                 scrypt, sessions HMAC-SHA256
    rateLimit.ts              limitation des tentatives
    validate.ts, http.ts, supabase.ts, env.ts, errors.ts, activity.ts, normalize.ts
supabase/
  schema.sql                  tables, RLS, fonctions, bucket privé « documents »
  ajout-admin.sql             création d'un administrateur
src/
  index.css                   THÈME : variables de couleur (bloc « À REMPLIR »)
  config/site.ts              nom, slogan, WhatsApp, message automatique
  App.tsx, main.tsx           routage, transitions, polices
  lib/                        api, session, routeur, session visiteur, formats, types de contenus
  components/                 Logo, Img, ContentCard, LibraryView, Premium (badges, paywall, WhatsApp),
                              SubscriptionStatus, écran de chargement, public/ (en-tête, pied de page), ui/
  pages/                      Accueil, À propos, Pasteurs, Bibliothèque, Contenu, Abonnement, Connexion/Inscription
  dashboard/                  coque des espaces (barre latérale, tiroir, barre du bas), éditeur de publication,
                              gestion des contenus, demandes de prière, profil, widgets
  spaces/                     VisitorSpace, PasteurSpace, AdminSpace
  spaces/admin/               Visiteurs, Abonnements, Pasteurs
public/images/site/           images (WebP 640 / 1376 px)
vercel.json                   build + en-têtes de sécurité (CSP, HSTS…)
.env.example                  variables d'environnement
GUIDE-MISE-EN-LIGNE.md        guide Supabase + Vercel + compte admin
_ancien-prototype/            ancien prototype (données fictives), conservé, non compilé
```

## Commandes

```bash
npm install
npm run dev      # front-end seul (http://localhost:3000)
vercel dev       # front-end + API (voir le guide)
npm run lint     # tsc --noEmit
npm run build    # tsc + vite build → dist/
```
