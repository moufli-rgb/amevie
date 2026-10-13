/**
 * /api/profile — profil de l'utilisateur connecté (tous rôles)
 *  GET   : profil (+ abonnement pour un visiteur).
 *  PATCH : informations personnelles et/ou mot de passe (mot de passe actuel requis).
 */
import { route } from './_lib/http.js';
import { ApiError } from './_lib/errors.js';
import { body, text, phone, password } from './_lib/validate.js';
import { db, authClient, check } from './_lib/supabase.js';
import { getActor, publicUser } from './_lib/auth.js';
import { hashPassword, verifyPassword } from './_lib/crypto.js';
import { logActivite } from './_lib/activity.js';

export default route({
  async GET(req) {
    return { user: publicUser(await getActor(req)) };
  },

  async PATCH(req) {
    const actor = await getActor(req);
    const b = body(req.body);
    const nouveau = b.new_password !== undefined && b.new_password !== '' ? password(b.new_password, 'Nouveau mot de passe') : null;
    if (nouveau && b.new_password_confirm !== undefined && b.new_password_confirm !== nouveau) throw new ApiError(400, 'Les deux mots de passe ne correspondent pas.');

    if (actor.role === 'admin') {
      if ('display_name' in b) {
        const { error } = await db().from('admin_users').update({ display_name: text(b.display_name, 'Nom affiché', { min: 2, max: 80, required: true }) }).eq('user_id', actor.id);
        check(error, 'admin_users');
      }
      if (nouveau) {
        const verif = await authClient().auth.signInWithPassword({ email: actor.email, password: String(b.current_password ?? '') });
        if (verif.error) throw new ApiError(400, 'Le mot de passe actuel est incorrect.');
        const { error } = await db().auth.admin.updateUserById(actor.id, { password: nouveau });
        if (error) throw new ApiError(400, 'Impossible de modifier le mot de passe.');
      }
    } else {
      const table = actor.role === 'pasteur' ? 'pastors' : 'users';
      const maj: Record<string, unknown> = {};
      if ('nom' in b) maj.nom = text(b.nom, 'Nom', { min: 1, max: 60, required: true });
      if ('prenom' in b) maj.prenom = text(b.prenom, 'Prénom', { min: 1, max: 60, required: true });
      if ('telephone' in b) maj.telephone = phone(b.telephone);
      if (actor.role === 'pasteur') {
        if ('eglise' in b) maj.eglise = text(b.eglise, 'Église / ministère', { max: 120 });
        if ('bio' in b) maj.bio = text(b.bio, 'Présentation', { max: 1000, multiline: true });
      }
      if (nouveau) {
        const { data, error } = await db().from(table).select('password_hash').eq('id', actor.id).single();
        check(error, table);
        if (typeof b.current_password !== 'string' || !(await verifyPassword(b.current_password, data!.password_hash))) {
          throw new ApiError(400, 'Le mot de passe actuel est incorrect.');
        }
        maj.password_hash = await hashPassword(nouveau);
      }
      if (!Object.keys(maj).length) throw new ApiError(400, 'Aucune modification à enregistrer.');
      maj.updated_at = new Date().toISOString();
      const { error } = await db().from(table).update(maj).eq('id', actor.id);
      check(error, table);
      await logActivite({ role: actor.role, user_id: actor.id, nom: actor.name, action: nouveau ? 'mot_de_passe_modifie' : 'profil_modifie' });
    }
    return { user: publicUser(await getActor(req)) };
  },
});
