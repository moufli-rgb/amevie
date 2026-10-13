/**
 * /api/subscriptions — abonnements
 *  GET ?scope=me : visiteur → son abonnement courant + historique.
 *  GET           : administrateur → tous les abonnements (statut réel) + alertes d'expiration.
 *  POST          : administrateur → activer / renouveler { user_id, type, duration_months, note? }
 *                  (début aujourd'hui, fin = +N mois ; l'abonnement actif éventuel est clôturé).
 *  PATCH ?id=    : administrateur → { action, ... }
 *     prolonger  { duration_months }                       → +N mois (depuis la fin, ou depuis aujourd'hui si expiré)
 *     modifier   { type?, duration_months?, end_date? }    → type, durée ou date d'expiration
 *     desactiver                                           → coupe l'accès Premium immédiatement
 *     reactiver                                            → réactive (si la date de fin n'est pas dépassée)
 */
import { route, query, send } from './_lib/http.js';
import { ApiError } from './_lib/errors.js';
import { body, requireUuid, oneOf, int, text, date } from './_lib/validate.js';
import { db, check } from './_lib/supabase.js';
import { requireRole } from './_lib/auth.js';
import { logActivite } from './_lib/activity.js';
import { TYPES_ABONNEMENT, abonnementCourant, ajouterMois, marquerExpires, resume, statutReel, joursRestants, type SubscriptionRow } from './_lib/abonnement.js';

async function nomVisiteur(userId: string) {
  const { data, error } = await db().from('users').select('nom, prenom').eq('id', userId).maybeSingle();
  check(error, 'users');
  if (!data) throw new ApiError(404, 'Visiteur introuvable.');
  return `${data.prenom} ${data.nom}`;
}

export default route({
  async GET(req) {
    if (query(req, 'scope') === 'me') {
      const me = await requireRole(req, 'visiteur');
      const { data, error } = await db().from('subscriptions').select('id, type, duration_months, start_date, end_date, status, created_at')
        .eq('user_id', me.id).order('created_at', { ascending: false });
      check(error, 'subscriptions');
      return {
        abonnement: resume(me.abonnement ?? null),
        historique: ((data ?? []) as SubscriptionRow[]).map((s) => ({ ...s, statut_reel: statutReel(s) })),
      };
    }

    await requireRole(req, 'admin');
    await marquerExpires();
    const { data, error } = await db().from('subscriptions').select('*, users(nom, prenom, email, telephone)').order('created_at', { ascending: false }).limit(20000);
    check(error, 'subscriptions');
    const now = Date.now();
    const vus = new Set<string>();
    const lignes = ((data ?? []) as (SubscriptionRow & { users: { nom: string; prenom: string; email: string; telephone: string | null } | null })[]).map((s) => {
      const courant = !vus.has(s.user_id);
      vus.add(s.user_id);
      return { ...s, statut_reel: statutReel(s, now), jours_restants: joursRestants(s, now), courant };
    });
    const alertes = lignes
      .filter((s) => s.courant && s.statut_reel === 'actif' && s.jours_restants <= 7)
      .sort((a, b) => Date.parse(a.end_date) - Date.parse(b.end_date));
    return { types: TYPES_ABONNEMENT, subscriptions: lignes, alertes };
  },

  async POST(req, res) {
    const admin = await requireRole(req, 'admin');
    const b = body(req.body);
    const userId = requireUuid(b.user_id, 'Visiteur');
    const visiteur = await nomVisiteur(userId);
    const type = text(b.type, "Type d'abonnement", { min: 2, max: 40, required: true })!;
    const duree = int(b.duration_months ?? 1, 'Durée (mois)', 1, 36) || 1;
    const now = new Date();
    const courant = await abonnementCourant(userId);
    if (courant && statutReel(courant) === 'actif') {
      await db().from('subscriptions').update({ status: 'desactive', updated_at: now.toISOString(), note: 'Remplacé par un nouvel abonnement' }).eq('id', courant.id);
    }
    const { data, error } = await db().from('subscriptions').insert({
      user_id: userId, type, duration_months: duree, start_date: now.toISOString(), end_date: ajouterMois(now, duree).toISOString(),
      status: 'actif', note: text(b.note, 'Note', { max: 300 }), activated_by: admin.name,
    }).select('*').single();
    check(error, 'subscriptions');
    await logActivite({
      role: 'admin', user_id: admin.id, nom: admin.name, action: courant ? 'renouvellement_abonnement' : 'activation_abonnement',
      cible_type: 'visiteur', cible_id: userId, cible_titre: visiteur, details: { type, duree_mois: duree, fin: data!.end_date },
    });
    send(res, 201, { subscription: data, abonnement: resume(data as SubscriptionRow) });
  },

  async PATCH(req) {
    const admin = await requireRole(req, 'admin');
    const id = requireUuid(query(req, 'id'));
    const b = body(req.body);
    const action = oneOf(b.action, 'Action', ['prolonger', 'modifier', 'desactiver', 'reactiver'] as const, true)!;
    const { data: s, error } = await db().from('subscriptions').select('*').eq('id', id).maybeSingle();
    check(error, 'subscriptions');
    if (!s) throw new ApiError(404, 'Abonnement introuvable.');
    const sub = s as SubscriptionRow;
    const now = new Date();
    const maj: Record<string, unknown> = { updated_at: now.toISOString() };

    switch (action) {
      case 'prolonger': {
        const duree = int(b.duration_months ?? 1, 'Durée (mois)', 1, 36) || 1;
        const base = Math.max(Date.parse(sub.end_date), now.getTime());
        maj.end_date = ajouterMois(new Date(base), duree).toISOString();
        maj.duration_months = Math.min(36, sub.duration_months + duree);
        maj.status = 'actif';
        break;
      }
      case 'modifier': {
        if (b.type !== undefined) maj.type = text(b.type, "Type d'abonnement", { min: 2, max: 40, required: true });
        const fin = date(b.end_date, "Date d'expiration");
        if (fin) {
          const exp = new Date(`${fin}T23:59:59Z`);
          if (exp.getTime() <= Date.parse(sub.start_date)) throw new ApiError(400, "La date d'expiration doit être après la date de début.");
          maj.end_date = exp.toISOString();
        } else if (b.duration_months !== undefined) {
          const duree = int(b.duration_months, 'Durée (mois)', 1, 36);
          maj.duration_months = duree;
          maj.end_date = ajouterMois(new Date(sub.start_date), duree).toISOString();
        }
        if (b.note !== undefined) maj.note = text(b.note, 'Note', { max: 300 });
        // La nouvelle date décide du statut (sauf abonnement désactivé)
        if (sub.status !== 'desactive' && maj.end_date) maj.status = Date.parse(maj.end_date as string) > now.getTime() ? 'actif' : 'expire';
        break;
      }
      case 'desactiver': maj.status = 'desactive'; break;
      case 'reactiver':
        if (Date.parse(sub.end_date) <= now.getTime()) throw new ApiError(400, 'La date de fin est dépassée : prolongez ou renouvelez plutôt l’abonnement.');
        maj.status = 'actif';
        break;
    }
    const { data, error: e2 } = await db().from('subscriptions').update(maj).eq('id', id).select('*').single();
    check(e2, 'subscriptions');
    await logActivite({
      role: 'admin', user_id: admin.id, nom: admin.name, action: `abonnement_${action}`,
      cible_type: 'visiteur', cible_id: sub.user_id, cible_titre: await nomVisiteur(sub.user_id), details: maj,
    });
    return { subscription: { ...data, statut_reel: statutReel(data as SubscriptionRow) }, abonnement: resume(data as SubscriptionRow) };
  },
});
