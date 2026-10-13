-- ============================================================================
--  Ajouter un administrateur
--  1) Supabase → Authentication → Users → « Add user » → « Create new user »
--     (email + mot de passe, cochez « Auto Confirm User »).
--  2) Remplacez l'email ci-dessous puis exécutez ce script dans le SQL Editor.
--  Seuls les comptes présents dans admin_users peuvent ouvrir /#admin.
-- ============================================================================
insert into public.admin_users (user_id, email, display_name)
select id, email, 'Administrateur'
from auth.users
where lower(email) = lower('admin@exemple.com')   -- ← votre email
on conflict (user_id) do nothing;

-- Vérification
select * from public.admin_users;
