-- ============================================================================
--  AME & VIE — Schéma Supabase (PostgreSQL)
--  À exécuter dans Supabase : SQL Editor → New query → coller → Run.
--  Ré-exécutable sans risque (IF NOT EXISTS / ON CONFLICT).
--
--  Sécurité : Row Level Security activée sur TOUTES les tables, sans aucune
--  politique → les clés « anon » et « authenticated » n'ont accès à rien.
--  Seules les fonctions serveur Vercel (/api), avec la clé service_role,
--  lisent et écrivent. Les droits (rôles, Premium) sont donc vérifiés côté serveur.
-- ============================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- users : visiteurs inscrits
-- ---------------------------------------------------------------------------
create table if not exists public.users (
  id              uuid primary key default gen_random_uuid(),
  nom             text not null check (char_length(nom) between 1 and 60),
  prenom          text not null check (char_length(prenom) between 1 and 60),
  email           text not null unique check (email = lower(email)),
  telephone       text,
  password_hash   text not null,
  role            text not null default 'visiteur' check (role = 'visiteur'),
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  last_login_at   timestamptz
);

-- ---------------------------------------------------------------------------
-- subscriptions : abonnements (historique ; l'abonnement courant est le plus récent)
--  status : actif | expire | desactive
--  Un abonnement « actif » dont end_date est dépassée est considéré comme expiré
--  immédiatement par le serveur, puis enregistré « expire ».
-- ---------------------------------------------------------------------------
create table if not exists public.subscriptions (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.users(id) on delete cascade,
  type              text not null check (char_length(type) between 2 and 40),
  duration_months   integer not null default 1 check (duration_months between 1 and 36),
  start_date        timestamptz not null default now(),
  end_date          timestamptz not null,
  status            text not null default 'actif' check (status in ('actif', 'expire', 'desactive')),
  note              text,
  activated_by      text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  check (end_date > start_date)
);
create index if not exists subscriptions_user_idx on public.subscriptions (user_id, created_at desc);
create index if not exists subscriptions_status_idx on public.subscriptions (status, end_date);

-- Passe à « expire » les abonnements arrivés à échéance (appelée par le serveur ;
-- peut aussi être planifiée avec pg_cron, voir le guide).
create or replace function public.expire_subscriptions()
returns integer language plpgsql security definer set search_path = public as $$
declare n integer;
begin
  update public.subscriptions set status = 'expire', updated_at = now()
  where status = 'actif' and end_date <= now();
  get diagnostics n = row_count;
  return n;
end $$;
revoke all on function public.expire_subscriptions() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- pastors : comptes pasteurs
--  is_active = false et reviewed_at vide → inscription en attente de validation
-- ---------------------------------------------------------------------------
create table if not exists public.pastors (
  id               uuid primary key default gen_random_uuid(),
  nom              text not null check (char_length(nom) between 1 and 60),
  prenom           text not null check (char_length(prenom) between 1 and 60),
  email            text not null unique check (email = lower(email)),
  telephone        text,
  password_hash    text not null,
  eglise           text,
  bio              text,
  is_active        boolean not null default false,
  created_by_admin boolean not null default false,
  reviewed_at      timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  last_login_at    timestamptz
);

-- Le nom de famille d'un guide peut rester vide (ex. « Jean »)
alter table public.pastors drop constraint if exists pastors_nom_check;
alter table public.pastors add constraint pastors_nom_check check (char_length(nom) <= 60);

-- ---------------------------------------------------------------------------
-- admin_users : administrateurs (liés aux comptes Supabase Auth)
-- ---------------------------------------------------------------------------
create table if not exists public.admin_users (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null unique references auth.users(id) on delete cascade,
  email         text not null,
  display_name  text,
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- contents : publications des pasteurs
--  type   : parole (Parole de Dieu) | enseignement | document | contenu (méditation, prière…)
--  access : gratuit | premium
--  file_url : chemin du fichier dans le bucket privé « documents »
-- ---------------------------------------------------------------------------
create table if not exists public.contents (
  id            uuid primary key default gen_random_uuid(),
  pastor_id     uuid not null references public.pastors(id) on delete cascade,
  title         text not null check (char_length(title) between 2 and 160),
  description   text,
  type          text not null check (type in ('parole', 'enseignement', 'document', 'contenu')),
  category      text,
  bible_ref     text,
  content       text,
  video_url     text,
  file_url      text,
  file_name     text,
  file_type     text,
  file_size     bigint,
  access        text not null default 'gratuit' check (access in ('gratuit', 'premium')),
  is_published  boolean not null default true,
  views         integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists contents_pub_idx on public.contents (is_published, created_at desc);
create index if not exists contents_pastor_idx on public.contents (pastor_id, created_at desc);
create index if not exists contents_type_idx on public.contents (type);

create or replace function public.increment_views(cid uuid)
returns void language sql security definer set search_path = public as $$
  update public.contents set views = views + 1 where id = cid;
$$;
revoke all on function public.increment_views(uuid) from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- favorites : « Ma bibliothèque » (fonctionnalité Premium)
-- ---------------------------------------------------------------------------
create table if not exists public.favorites (
  user_id     uuid not null references public.users(id) on delete cascade,
  content_id  uuid not null references public.contents(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, content_id)
);

-- ---------------------------------------------------------------------------
-- prayer_requests : demandes de prière (fonctionnalité gratuite)
-- ---------------------------------------------------------------------------
create table if not exists public.prayer_requests (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.users(id) on delete cascade,
  subject       text not null check (char_length(subject) between 2 and 120),
  message       text not null check (char_length(message) between 2 and 2000),
  anonymous     boolean not null default false,
  status        text not null default 'nouvelle' check (status in ('nouvelle', 'en_priere', 'exaucee')),
  handled_by    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists prayer_user_idx on public.prayer_requests (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- activity_logs : journal d'activité (suivi à distance par l'administrateur)
-- ---------------------------------------------------------------------------
create table if not exists public.activity_logs (
  id            bigint generated always as identity primary key,
  user_id       uuid,                     -- auteur de l'action (visiteur, pasteur ou admin)
  actor_role    text not null check (actor_role in ('admin', 'pasteur', 'visiteur', 'systeme')),
  actor_name    text,
  action        text not null,
  target_type   text,
  target_id     uuid,
  target_title  text,
  details       jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now()
);
create index if not exists activity_date_idx on public.activity_logs (created_at desc);
create index if not exists activity_user_idx on public.activity_logs (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- login_attempts : limitation des tentatives de connexion
-- ---------------------------------------------------------------------------
create table if not exists public.login_attempts (
  key               text primary key,
  attempts          integer not null default 0,
  first_attempt_at  timestamptz not null default now(),
  blocked_until     timestamptz
);

-- ---------------------------------------------------------------------------
-- site_visits : visiteurs du site (anonymes) — une ligne par visiteur et par jour.
-- Aucune donnée personnelle : seule une empreinte irréversible (IP + navigateur + jour) est gardée.
-- ---------------------------------------------------------------------------
create table if not exists public.site_visits (
  visit_day     date not null default current_date,
  visitor_hash  text not null check (char_length(visitor_hash) = 32),
  created_at    timestamptz not null default now(),
  primary key (visit_day, visitor_hash)
);

-- ---------------------------------------------------------------------------
-- payments : paiements en cryptomonnaie (NOWPayments)
--  Le visiteur choisit la cryptomonnaie qu'il veut sur la page de paiement.
--  Quand NOWPayments confirme le paiement (« finished »), le serveur active
--  ou prolonge automatiquement l'abonnement (credited = true, une seule fois).
-- ---------------------------------------------------------------------------
create table if not exists public.payments (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.users(id) on delete cascade,
  order_id        text not null unique,
  provider        text not null default 'nowpayments',
  invoice_id      text,
  payment_id      text,
  price_amount    numeric(12,2) not null check (price_amount > 0),
  price_currency  text not null,
  pay_currency    text,
  pay_amount      numeric(30,12),
  months          integer not null default 1 check (months between 1 and 36),
  status          text not null default 'en_attente',
  credited        boolean not null default false,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists payments_user_idx on public.payments (user_id, created_at desc);

-- Paiement manuel : le visiteur envoie lui-même la crypto à l'adresse affichée,
-- colle la preuve (numéro de transaction) et l'administrateur valide ou refuse.
alter table public.payments add column if not exists tx_hash      text;
alter table public.payments add column if not exists wallet_label text;
alter table public.payments add column if not exists admin_note   text;
alter table public.payments add column if not exists reviewed_by  text;
alter table public.payments add column if not exists reviewed_at  timestamptz;
create unique index if not exists payments_tx_hash_idx on public.payments (lower(tx_hash)) where tx_hash is not null;

-- ---------------------------------------------------------------------------
-- settings : réglages modifiables depuis l'administration
--  (adresses de portefeuille pour le paiement manuel, version des contenus d'exemple…)
-- ---------------------------------------------------------------------------
create table if not exists public.settings (
  key         text primary key,
  value       jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Religion de chaque publication (filtre de la bibliothèque)
-- ---------------------------------------------------------------------------
alter table public.contents add column if not exists religion text not null default 'chretien';
alter table public.contents drop constraint if exists contents_religion_check;
alter table public.contents add constraint contents_religion_check check (religion in ('chretien', 'musulman', 'universel'));
create index if not exists contents_religion_idx on public.contents (religion, is_published, created_at desc);

-- ---------------------------------------------------------------------------
-- Stockage des documents : bucket PRIVÉ (50 Mo max par fichier).
-- Liens de téléchargement signés par le serveur (2 min), seulement si l'accès est autorisé.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documents', 'documents', false, 52428800,
  array[
    'application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'audio/mpeg', 'audio/mp4', 'audio/x-m4a', 'audio/wav', 'video/mp4',
    'image/jpeg', 'image/png', 'image/webp', 'text/plain', 'application/epub+zip'
  ]
)
on conflict (id) do update
  set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

-- ---------------------------------------------------------------------------
-- ROW LEVEL SECURITY : activée partout, aucune politique = accès serveur uniquement
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'users', 'subscriptions', 'pastors', 'admin_users', 'contents',
    'favorites', 'prayer_requests', 'activity_logs', 'login_attempts', 'site_visits', 'payments', 'settings'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('alter table public.%I force row level security', t);
    execute format('revoke all on table public.%I from anon, authenticated', t);
  end loop;
end $$;
