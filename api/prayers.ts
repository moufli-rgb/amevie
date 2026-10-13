/**
 * /api/prayers — demandes de prière (fonctionnalité gratuite)
 *  GET          : visiteur → ses demandes ; pasteur / administrateur → toutes les demandes.
 *  POST         : visiteur → { subject, message, anonymous }.
 *  PATCH ?id=   : pasteur / administrateur → { status: nouvelle | en_priere | exaucee }.
 *  DELETE ?id=  : visiteur → sa demande ; administrateur → toute demande.
 */
import { route, query, send } from './_lib/http.js';
import { ApiError, MSG_INTERDIT } from './_lib/errors.js';
import { body, requiredText, requireUuid, oneOf } from './_lib/validate.js';
import { db, check } from './_lib/supabase.js';
import { requireRole } from './_lib/auth.js';
import { assertNotLimited, registerFailure } from './_lib/rateLimit.js';
import { logActivite } from './_lib/activity.js';

export default route({
  async GET(req) {
    const actor = await requireRole(req, 'visiteur', 'pasteur', 'admin');
    let q = db().from('prayer_requests').select('id, user_id, subject, message, anonymous, status, handled_by, created_at, users(prenom, nom)')
      .order('created_at', { ascending: false }).limit(1000);
    if (actor.role === 'visiteur') q = q.eq('user_id', actor.id);
    const { data, error } = await q;
    check(error, 'prayer_requests');
    // Demandes anonymes : le nom n'est jamais envoyé aux pasteurs
    const prayers = (data ?? []).map((p) => {
      const u = p.users as unknown as { prenom: string; nom: string } | null;
      const auteur = actor.role === 'visiteur' ? null : p.anonymous && actor.role === 'pasteur' ? 'Anonyme' : u ? `${u.prenom} ${u.nom}` : '—';
      const { users: _u, user_id: _id, ...rest } = p;
      return { ...rest, auteur };
    });
    return { prayers };
  },

  async POST(req, res) {
    const actor = await requireRole(req, 'visiteur');
    const limite = [{ key: `priere:${actor.id}`, max: 20 }]; // 20 demandes / 15 min au plus
    await assertNotLimited(limite);
    const b = body(req.body);
    const subject = requiredText(b.subject, 'Sujet', { min: 2, max: 120 });
    const message = requiredText(b.message, 'Message', { min: 2, max: 2000, multiline: true });
    const { data, error } = await db().from('prayer_requests').insert({ user_id: actor.id, subject, message, anonymous: b.anonymous === true })
      .select('id, subject, message, anonymous, status, handled_by, created_at').single();
    check(error, 'prayer_requests');
    await registerFailure(limite);
    await logActivite({ role: 'visiteur', user_id: actor.id, nom: actor.name, action: 'demande_priere', cible_type: 'priere', cible_id: data!.id, cible_titre: subject });
    send(res, 201, { prayer: { ...data, auteur: null } });
  },

  async PATCH(req) {
    const actor = await requireRole(req, 'pasteur', 'admin');
    const id = requireUuid(query(req, 'id'));
    const status = oneOf(body(req.body).status, 'Statut', ['nouvelle', 'en_priere', 'exaucee'] as const, true)!;
    const { data, error } = await db().from('prayer_requests').update({ status, handled_by: actor.name, updated_at: new Date().toISOString() }).eq('id', id).select('id, subject').maybeSingle();
    check(error, 'prayer_requests');
    if (!data) throw new ApiError(404, 'Demande introuvable.');
    await logActivite({ role: actor.role, user_id: actor.id, nom: actor.name, action: `priere_${status}`, cible_type: 'priere', cible_id: id, cible_titre: data.subject });
    return { ok: true, status, handled_by: actor.name };
  },

  async DELETE(req) {
    const actor = await requireRole(req, 'visiteur', 'admin');
    const id = requireUuid(query(req, 'id'));
    const { data, error } = await db().from('prayer_requests').select('user_id').eq('id', id).maybeSingle();
    check(error, 'prayer_requests');
    if (!data) throw new ApiError(404, 'Demande introuvable.');
    if (actor.role === 'visiteur' && data.user_id !== actor.id) throw new ApiError(403, MSG_INTERDIT);
    const del = await db().from('prayer_requests').delete().eq('id', id);
    check(del.error, 'prayer_requests');
    return { ok: true };
  },
});
