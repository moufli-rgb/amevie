/**
 * /api/contents — publications
 *  GET                  : contenus publiés (filtres : type, access, pastor, q). Premium → verrouillé si pas abonné.
 *  GET ?id=             : détail (texte / vidéo seulement si l'utilisateur y a droit — contrôle serveur).
 *  GET ?scope=accueil   : Parole du jour, derniers contenus, documents, chiffres.
 *  GET ?scope=mine      : publications du pasteur connecté (publiées et brouillons).
 *  GET ?scope=admin     : toutes les publications (administrateur).
 *  POST                 : pasteur → nouvelle publication.
 *  PATCH ?id=           : pasteur → sa publication ; administrateur → toute publication.
 *  DELETE ?id=          : pasteur → sa publication ; administrateur → toute publication (fichier supprimé aussi).
 */
import { route, query, send } from './_lib/http.js';
import { ApiError, MSG_INTERDIT } from './_lib/errors.js';
import { body, requireUuid, oneOf } from './_lib/validate.js';
import { db, check, isMissingTable } from './_lib/supabase.js';
import { optionalActor, requireRole, type Actor } from './_lib/auth.js';
import { logActivite } from './_lib/activity.js';
import { importerSiPremiereFois } from './_lib/exemples.js';
import { COLONNES_LISTE, RELIGIONS, TYPES, proteger, valider, verifierType, type ContentRow, type TypeContenu } from './_lib/contenus.js';

const LIBELLES: Record<TypeContenu, string> = { parole: 'Parole de Dieu', enseignement: 'Enseignement', document: 'Document', contenu: 'Contenu spirituel' };

async function charger(id: string): Promise<ContentRow> {
  const { data, error } = await db().from('contents').select('*, pastors(prenom, nom, eglise)').eq('id', id).maybeSingle();
  check(error, 'contents');
  if (!data) throw new ApiError(404, 'Contenu introuvable.');
  return data as ContentRow;
}
const proprietaire = (a: Actor | null, c: ContentRow) => !!a && a.role === 'pasteur' && a.id === c.pastor_id;

export default route({
  async GET(req) {
    const actor = await optionalActor(req);
    const id = query(req, 'id');
    const scope = query(req, 'scope');
    // Livres et contenus d'exemple ajoutés automatiquement la toute première fois
    if (!id && scope !== 'mine') await importerSiPremiereFois();

    // ---- Détail ---------------------------------------------------------------
    if (id) {
      const c = await charger(requireUuid(id));
      if (!c.is_published && !proprietaire(actor, c) && actor?.role !== 'admin') throw new ApiError(404, 'Contenu introuvable.');
      if (c.is_published && !proprietaire(actor, c) && actor?.role !== 'admin') await db().rpc('increment_views', { cid: c.id });
      let favorite = false;
      if (actor?.role === 'visiteur') {
        const f = await db().from('favorites').select('content_id').eq('user_id', actor.id).eq('content_id', c.id).maybeSingle();
        favorite = !!f.data;
      }
      return { content: { ...proteger(actor, c), favorite } };
    }

    // ---- Accueil public -------------------------------------------------------
    if (scope === 'accueil') {
      const [parole, derniers, documents, total, totalDocs] = await Promise.all([
        db().from('contents').select('id, title, content, bible_ref, pastors(prenom, nom)')
          .eq('is_published', true).eq('type', 'parole').eq('access', 'gratuit').order('created_at', { ascending: false }).limit(1).maybeSingle(),
        db().from('contents').select(COLONNES_LISTE).eq('is_published', true).neq('type', 'document').order('created_at', { ascending: false }).limit(6),
        db().from('contents').select(COLONNES_LISTE).eq('is_published', true).eq('type', 'document').order('created_at', { ascending: false }).limit(3),
        db().from('contents').select('*', { count: 'exact', head: true }).eq('is_published', true),
        db().from('contents').select('*', { count: 'exact', head: true }).eq('is_published', true).eq('type', 'document'),
      ]);
      if (isMissingTable(derniers.error)) return { parole: null, derniers: [], documents: [], total: 0, total_documents: 0 };
      check(derniers.error, 'contents');
      return {
        parole: parole.data ?? null,
        derniers: (derniers.data ?? []).map((c) => proteger(actor, c as unknown as ContentRow)),
        documents: (documents.data ?? []).map((c) => proteger(actor, c as unknown as ContentRow)),
        total: total.count ?? 0,
        total_documents: totalDocs.count ?? 0,
      };
    }

    // ---- Listes ---------------------------------------------------------------
    let q = db().from('contents').select(COLONNES_LISTE).order('created_at', { ascending: false }).limit(500);
    if (scope === 'mine') {
      const p = await requireRole(req, 'pasteur');
      q = q.eq('pastor_id', p.id);
    } else if (scope === 'admin') {
      await requireRole(req, 'admin');
    } else {
      q = q.eq('is_published', true);
    }
    const pastor = query(req, 'pastor');
    if (pastor) q = q.eq('pastor_id', requireUuid(pastor));
    const type = query(req, 'type');
    if (type) q = q.eq('type', oneOf(type, 'Type', TYPES, true)!);
    const religion = query(req, 'religion');
    if (religion) q = q.eq('religion', oneOf(religion, 'Religion', RELIGIONS, true)!);
    const access = query(req, 'access');
    if (access === 'gratuit' || access === 'premium') q = q.eq('access', access);
    const recherche = query(req, 'q')?.replace(/[%_,()"\\*:]/g, ' ').trim();
    if (recherche) q = q.or(`title.ilike.%${recherche}%,description.ilike.%${recherche}%,bible_ref.ilike.%${recherche}%`);
    const { data, error } = await q;
    check(error, 'contents');
    return { contents: (data ?? []).map((c) => proteger(actor, c as unknown as ContentRow)) };
  },

  async POST(req, res) {
    const actor = await requireRole(req, 'pasteur');
    const b = body(req.body);
    const type = oneOf(b.type, 'Type de publication', TYPES, true)!;
    const values = valider(b, { partiel: false, type, actor, pastorId: actor.id });
    verifierType(type, values);
    const { data, error } = await db().from('contents').insert({ ...values, type, pastor_id: actor.id }).select('*').single();
    check(error, 'contents');
    await logActivite({
      role: 'pasteur', user_id: actor.id, nom: actor.name, action: `publication_${type}`,
      cible_type: 'contenu', cible_id: data!.id, cible_titre: data!.title, details: { access: data!.access, publie: data!.is_published },
    });
    send(res, 201, { content: proteger(actor, data as ContentRow), message: `${LIBELLES[type]} ${data!.is_published ? 'publié(e)' : 'enregistré(e) en brouillon'}.` });
  },

  async PATCH(req) {
    const id = requireUuid(query(req, 'id'));
    const actor = await requireRole(req, 'pasteur', 'admin');
    const c = await charger(id);
    if (actor.role === 'pasteur' && c.pastor_id !== actor.id) throw new ApiError(403, MSG_INTERDIT);
    const values = valider(body(req.body), { partiel: true, type: c.type, actor, pastorId: c.pastor_id });
    if (!Object.keys(values).length) throw new ApiError(400, 'Aucune modification à enregistrer.');
    verifierType(c.type, { ...c, ...values });

    // Fichier remplacé → l'ancien est supprimé du stockage
    if ('file_url' in values && c.file_url && values.file_url !== c.file_url) await db().storage.from('documents').remove([c.file_url]);
    const { data, error } = await db().from('contents').update({ ...values, updated_at: new Date().toISOString() }).eq('id', id).select('*, pastors(prenom, nom, eglise)').single();
    check(error, 'contents');
    await logActivite({
      role: actor.role, user_id: actor.id, nom: actor.name,
      action: actor.role === 'admin' ? 'moderation_contenu' : `modification_${c.type}`,
      cible_type: 'contenu', cible_id: id, cible_titre: data!.title,
    });
    return { content: proteger(actor, data as ContentRow) };
  },

  async DELETE(req) {
    const id = requireUuid(query(req, 'id'));
    const actor = await requireRole(req, 'pasteur', 'admin');
    const c = await charger(id);
    if (actor.role === 'pasteur' && c.pastor_id !== actor.id) throw new ApiError(403, MSG_INTERDIT);
    const { error } = await db().from('contents').delete().eq('id', id);
    check(error, 'contents');
    if (c.file_url) await db().storage.from('documents').remove([c.file_url]);
    await logActivite({ role: actor.role, user_id: actor.id, nom: actor.name, action: `suppression_${c.type}`, cible_type: 'contenu', cible_id: id, cible_titre: c.title });
    return { ok: true };
  },
});
