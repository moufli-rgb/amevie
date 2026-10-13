/**
 * /api/users — gestion des visiteurs (administrateur uniquement)
 *  GET          : tous les visiteurs + abonnement courant (statut réel : actif / expiré / désactivé / aucun).
 *  GET ?id=     : fiche complète : compte, historique des abonnements, activité récente.
 *  PATCH ?id=   : { is_active?, nom?, prenom?, email?, telephone? } — activer / désactiver le compte, corriger les informations.
 *  DELETE ?id=  : supprimer le compte.
 */
import { route, query } from './_lib/http.js';
import { ApiError } from './_lib/errors.js';
import { body, requireUuid, bool, text, phone, email } from './_lib/validate.js';
import { db, check } from './_lib/supabase.js';
import { requireRole } from './_lib/auth.js';
import { logActivite } from './_lib/activity.js';
import { marquerExpires, resume, statutReel, TYPES_ABONNEMENT, type SubscriptionRow } from './_lib/abonnement.js';

const COLS = 'id, nom, prenom, email, telephone, role, is_active, created_at, updated_at, last_login_at';

export default route({
  async GET(req) {
    await requireRole(req, 'admin');
    await marquerExpires();
    const id = query(req, 'id');
    if (id) {
      const uid = requireUuid(id);
      const [u, subs, act] = await Promise.all([
        db().from('users').select(COLS).eq('id', uid).maybeSingle(),
        db().from('subscriptions').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
        db().from('activity_logs').select('id, action, target_title, created_at').eq('user_id', uid).order('created_at', { ascending: false }).limit(30),
      ]);
      check(u.error, 'users'); check(subs.error, 'subscriptions');
      if (!u.data) throw new ApiError(404, 'Visiteur introuvable.');
      const historique = ((subs.data ?? []) as SubscriptionRow[]).map((s) => ({ ...s, statut_reel: statutReel(s) }));
      return { user: { ...u.data, abonnement: resume(historique[0] ?? null) }, historique, activites: act.data ?? [], types: TYPES_ABONNEMENT };
    }

    const [users, subs] = await Promise.all([
      db().from('users').select(COLS).order('created_at', { ascending: false }).limit(10000),
      db().from('subscriptions').select('*').order('created_at', { ascending: false }).limit(50000),
    ]);
    check(users.error, 'users'); check(subs.error, 'subscriptions');
    const courant = new Map<string, SubscriptionRow>();
    for (const s of (subs.data ?? []) as SubscriptionRow[]) if (!courant.has(s.user_id)) courant.set(s.user_id, s);
    return { types: TYPES_ABONNEMENT, users: (users.data ?? []).map((u) => ({ ...u, abonnement: resume(courant.get(u.id) ?? null) })) };
  },

  async PATCH(req) {
    const admin = await requireRole(req, 'admin');
    const id = requireUuid(query(req, 'id'));
    const b = body(req.body);
    const maj: Record<string, unknown> = {};
    if ('is_active' in b) maj.is_active = bool(b.is_active, 'Statut du compte');
    if ('nom' in b) maj.nom = text(b.nom, 'Nom', { min: 1, max: 60, required: true });
    if ('prenom' in b) maj.prenom = text(b.prenom, 'Prénom', { min: 1, max: 60, required: true });
    if ('email' in b) maj.email = email(b.email);
    if ('telephone' in b) maj.telephone = phone(b.telephone);
    if (!Object.keys(maj).length) throw new ApiError(400, 'Aucune modification à enregistrer.');
    maj.updated_at = new Date().toISOString();
    const { data, error } = await db().from('users').update(maj).eq('id', id).select(COLS).maybeSingle();
    if (error?.code === '23505') throw new ApiError(409, 'Cet email est déjà utilisé par un autre compte.');
    check(error, 'users');
    if (!data) throw new ApiError(404, 'Visiteur introuvable.');
    await logActivite({
      role: 'admin', user_id: admin.id, nom: admin.name,
      action: 'is_active' in b ? (maj.is_active ? 'activation_compte' : 'desactivation_compte') : 'modification_compte',
      cible_type: 'visiteur', cible_id: id, cible_titre: `${data.prenom} ${data.nom}`,
    });
    return { user: data };
  },

  async DELETE(req) {
    const admin = await requireRole(req, 'admin');
    const id = requireUuid(query(req, 'id'));
    const { data, error } = await db().from('users').delete().eq('id', id).select('nom, prenom').maybeSingle();
    check(error, 'users');
    if (!data) throw new ApiError(404, 'Visiteur introuvable.');
    await logActivite({ role: 'admin', user_id: admin.id, nom: admin.name, action: 'suppression_compte', cible_type: 'visiteur', cible_titre: `${data.prenom} ${data.nom}` });
    return { ok: true };
  },
});
