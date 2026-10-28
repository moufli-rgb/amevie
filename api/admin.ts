/**
 * GET /api/admin?scope=... (administrateur uniquement)
 *  overview  : statistiques générales, alertes d'expiration, activité récente.
 *  activites : journal complet (filtres : role, limit).
 *  database  : état des tables et du stockage Supabase.
 *
 * POST /api/admin?action=exemples : ajoute les contenus et documents d'exemple (ré-exécutable).
 */
import { route, query } from './_lib/http.js';
import { ApiError } from './_lib/errors.js';
import { requireRole } from './_lib/auth.js';
import { importerExemples } from './_lib/exemples.js';
import { logActivite } from './_lib/activity.js';
import { db, check, isMissingTable } from './_lib/supabase.js';
import { marquerExpires, statutReel, joursRestants, type SubscriptionRow } from './_lib/abonnement.js';

async function count(table: string, filters: [string, string | boolean][] = []): Promise<number | null> {
  let q = db().from(table).select('*', { count: 'exact', head: true });
  for (const [c, v] of filters) q = q.eq(c, v);
  const { count: n, error } = await q;
  if (error) { if (isMissingTable(error)) return null; check(error, table); }
  return n ?? 0;
}

const TABLES = ['users', 'subscriptions', 'pastors', 'admin_users', 'contents', 'favorites', 'prayer_requests', 'activity_logs', 'login_attempts', 'site_visits'];

export default route({
  async GET(req) {
    await requireRole(req, 'admin');
    const scope = query(req, 'scope');

    if (scope === 'overview') {
      await marquerExpires();
      const il30 = new Date(Date.now() - 30 * 86_400_000).toISOString().slice(0, 10);
      const [visitesTotal, visites30] = await Promise.all([
        count('site_visits'),
        (async () => {
          const { count: n, error } = await db().from('site_visits').select('*', { count: 'exact', head: true }).gte('visit_day', il30);
          return error ? null : n ?? 0;
        })(),
      ]);
      const [inscrits, actifs, pasteurs, pasteursActifs, publies, documents, paroles, enseignements, prieres, subs, act, aValider] = await Promise.all([
        count('users'), count('users', [['is_active', true]]),
        count('pastors'), count('pastors', [['is_active', true]]),
        count('contents', [['is_published', true]]), count('contents', [['type', 'document']]),
        count('contents', [['type', 'parole']]), count('contents', [['type', 'enseignement']]),
        count('prayer_requests', [['status', 'nouvelle']]),
        db().from('subscriptions').select('*, users(nom, prenom)').order('created_at', { ascending: false }).limit(50000),
        db().from('activity_logs').select('*').order('created_at', { ascending: false }).limit(12),
        count('payments', [['status', 'a_valider']]),
      ]);
      check(subs.error, 'subscriptions');
      const now = Date.now();
      const vus = new Set<string>();
      const courants: (SubscriptionRow & { users: { nom: string; prenom: string } | null })[] = [];
      for (const s of (subs.data ?? []) as typeof courants) if (!vus.has(s.user_id)) { vus.add(s.user_id); courants.push(s); }
      const statuts = courants.map((s) => statutReel(s, now));
      const enAttente = await db().from('pastors').select('id', { count: 'exact', head: true }).eq('is_active', false).is('reviewed_at', null);
      return {
        stats: {
          visiteurs_total: visitesTotal, visiteurs_30j: visites30,
          inscrits, comptes_actifs: actifs,
          abonnements_actifs: statuts.filter((s) => s === 'actif').length,
          abonnements_expires: statuts.filter((s) => s === 'expire').length,
          abonnements_desactives: statuts.filter((s) => s === 'desactive').length,
          pasteurs, pasteurs_actifs: pasteursActifs, pasteurs_en_attente: enAttente.count ?? 0,
          contenus_publies: publies, documents, paroles, enseignements, prieres_nouvelles: prieres, paiements_a_valider: aValider,
        },
        alertes: courants
          .filter((s) => statutReel(s, now) === 'actif' && joursRestants(s, now) <= 7)
          .sort((a, b) => Date.parse(a.end_date) - Date.parse(b.end_date))
          .map((s) => ({ id: s.id, user_id: s.user_id, nom: s.users ? `${s.users.prenom} ${s.users.nom}` : '—', type: s.type, end_date: s.end_date, jours_restants: joursRestants(s, now) })),
        activites: act.error ? [] : act.data ?? [],
      };
    }

    if (scope === 'activites') {
      let q = db().from('activity_logs').select('*').order('created_at', { ascending: false }).limit(Math.min(Number(query(req, 'limit')) || 300, 1000));
      const role = query(req, 'role');
      if (role && ['admin', 'pasteur', 'visiteur'].includes(role)) q = q.eq('actor_role', role);
      const { data, error } = await q;
      check(error, 'activity_logs');
      return { activites: data ?? [] };
    }

    if (scope === 'database') {
      const tables = await Promise.all(TABLES.map(async (t) => ({ table: t, lignes: await count(t) })));
      const bucket = await db().storage.getBucket('documents');
      return { tables: tables.map((t) => ({ ...t, existe: t.lignes !== null })), stockage: !bucket.error && !!bucket.data, stockage_public: bucket.data?.public ?? null };
    }

    throw new ApiError(400, 'Paramètre « scope » invalide.');
  },

  async POST(req) {
    const admin = await requireRole(req, 'admin');
    if (query(req, 'action') !== 'exemples') throw new ApiError(400, 'Action inconnue.');
    const r = await importerExemples();
    await logActivite({ role: 'admin', user_id: admin.id, nom: admin.name, action: 'import_exemples', details: r });
    return r;
  },
});
