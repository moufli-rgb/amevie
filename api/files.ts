/**
 * /api/files — documents (bucket PRIVÉ « documents » de Supabase Storage)
 *  POST     : pasteur (ou admin pour un pasteur donné) → lien signé d'envoi direct.
 *             { name, type, size, pastor_id? } → { path, signedUrl }
 *  GET ?id= : lien signé de téléchargement (2 min) du fichier d'un contenu,
 *             SEULEMENT si l'utilisateur y a droit (Premium vérifié côté serveur).
 */
import { randomBytes } from 'node:crypto';
import { route, query } from './_lib/http.js';
import { ApiError } from './_lib/errors.js';
import { body, requiredText, requireUuid } from './_lib/validate.js';
import { db, check } from './_lib/supabase.js';
import { optionalActor, requireRole } from './_lib/auth.js';
import { MIME_AUTORISES, TAILLE_MAX, peutVoir, type ContentRow } from './_lib/contenus.js';
import { logActivite } from './_lib/activity.js';

export default route({
  async POST(req) {
    const actor = await requireRole(req, 'pasteur', 'admin');
    const b = body(req.body);
    const pastorId = actor.role === 'admin' ? requireUuid(b.pastor_id, 'Guide spirituel') : actor.id;
    const nom = requiredText(b.name, 'Nom du fichier', { max: 200 });
    const type = typeof b.type === 'string' ? b.type : '';
    if (!MIME_AUTORISES.includes(type)) throw new ApiError(400, 'Type de fichier non accepté (PDF, EPUB, Word, PowerPoint, audio, vidéo MP4, image ou texte).');
    const taille = typeof b.size === 'number' ? b.size : 0;
    if (taille <= 0 || taille > TAILLE_MAX) throw new ApiError(400, 'Le fichier doit faire moins de 50 Mo.');

    const propre = nom.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w.-]+/g, '-').replace(/-+/g, '-').slice(-80);
    const path = `${pastorId}/${Date.now()}-${randomBytes(4).toString('hex')}-${propre}`;
    const { data, error } = await db().storage.from('documents').createSignedUploadUrl(path);
    if (error || !data) {
      console.error('[files]', error?.message);
      throw new ApiError(503, 'Le stockage des documents n’est pas prêt : vérifiez que le bucket « documents » existe (script supabase/schema.sql).', 'STOCKAGE');
    }
    return { path: data.path, signedUrl: data.signedUrl };
  },

  async GET(req) {
    const id = requireUuid(query(req, 'id'));
    const actor = await optionalActor(req);
    const { data, error } = await db().from('contents').select('id, pastor_id, title, access, is_published, file_url, file_name').eq('id', id).maybeSingle();
    check(error, 'contents');
    const c = data as (ContentRow & { file_name: string | null }) | null;
    if (!c || !c.file_url) throw new ApiError(404, 'Fichier introuvable.');
    const proprio = actor?.role === 'pasteur' && actor.id === c.pastor_id;
    if (!c.is_published && !proprio && actor?.role !== 'admin') throw new ApiError(404, 'Fichier introuvable.');
    if (!peutVoir(actor, c)) {
      throw actor
        ? new ApiError(402, 'Ce document est réservé aux abonnés. Faites votre abonnement pour le télécharger.', 'ABONNEMENT_REQUIS')
        : new ApiError(401, 'Connectez-vous pour télécharger ce document.', 'CONNEXION_REQUISE');
    }
    const signed = await db().storage.from('documents').createSignedUrl(c.file_url, 120, { download: c.file_name ?? true });
    if (signed.error || !signed.data) throw new ApiError(404, 'Fichier introuvable dans le stockage.');
    if (actor?.role === 'visiteur') {
      await logActivite({ role: 'visiteur', user_id: actor.id, nom: actor.name, action: 'telechargement', cible_type: 'contenu', cible_id: c.id, cible_titre: c.title });
    }
    return { url: signed.data.signedUrl };
  },
});
