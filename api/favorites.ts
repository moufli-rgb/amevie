/**
 * /api/favorites — « Ma bibliothèque », fonctionnalité PREMIUM (vérifiée côté serveur)
 *  GET          : mes favoris.
 *  POST         : { content_id } ajoute.
 *  DELETE ?id=  : retire (id = content_id).
 */
import { route, query, send } from './_lib/http.js';
import { body, requireUuid } from './_lib/validate.js';
import { db, check } from './_lib/supabase.js';
import { requireRole, requirePremium } from './_lib/auth.js';
import { COLONNES_LISTE, proteger, type ContentRow } from './_lib/contenus.js';

export default route({
  async GET(req) {
    const actor = await requireRole(req, 'visiteur');
    requirePremium(actor);
    const { data, error } = await db().from('favorites').select(`created_at, contents(${COLONNES_LISTE})`).eq('user_id', actor.id).order('created_at', { ascending: false });
    check(error, 'favorites');
    const contents = (data ?? [])
      .map((f) => f.contents as unknown as ContentRow | null)
      .filter((c): c is ContentRow => !!c && c.is_published)
      .map((c) => proteger(actor, c));
    return { contents };
  },
  async POST(req, res) {
    const actor = await requireRole(req, 'visiteur');
    requirePremium(actor);
    const content_id = requireUuid(body(req.body).content_id, 'Contenu');
    const { error } = await db().from('favorites').upsert({ user_id: actor.id, content_id }, { onConflict: 'user_id,content_id', ignoreDuplicates: true });
    check(error, 'favorites');
    send(res, 201, { ok: true });
  },
  async DELETE(req) {
    const actor = await requireRole(req, 'visiteur');
    requirePremium(actor);
    const { error } = await db().from('favorites').delete().eq('user_id', actor.id).eq('content_id', requireUuid(query(req, 'id')));
    check(error, 'favorites');
    return { ok: true };
  },
});
