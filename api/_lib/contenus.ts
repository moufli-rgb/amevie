import { ApiError } from './errors.js';
import * as v from './validate.js';
import type { Actor } from './auth.js';

export const TYPES = ['parole', 'enseignement', 'document', 'contenu'] as const;
export type TypeContenu = (typeof TYPES)[number];
export const CATEGORIES = ['Méditation', 'Prière', 'Louange', 'Témoignage', 'Exhortation', 'Étude biblique', 'Étude coranique', 'Sagesse', 'Pleine conscience', 'Famille', 'Jeunesse', 'Autre'] as const;
/** Religion / tradition de chaque publication (filtre de la bibliothèque). */
export const RELIGIONS = ['chretien', 'musulman', 'universel'] as const;
export type Religion = (typeof RELIGIONS)[number];

/** Types de fichiers acceptés (mêmes que le bucket Supabase). */
export const MIME_AUTORISES = [
  'application/pdf', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'audio/mpeg', 'audio/mp4', 'audio/x-m4a', 'audio/wav', 'video/mp4',
  'image/jpeg', 'image/png', 'image/webp', 'text/plain', 'application/epub+zip',
];
export const TAILLE_MAX = 50 * 1024 * 1024;

/** Colonnes d'une liste (sans le texte complet). */
export const COLONNES_LISTE =
  'id, pastor_id, type, religion, category, title, description, bible_ref, access, is_published, views, file_name, file_type, file_size, file_url, video_url, created_at, updated_at, pastors(prenom, nom, eglise)';

export interface ContentRow {
  id: string; pastor_id: string; type: TypeContenu; title: string; access: 'gratuit' | 'premium'; is_published: boolean;
  content?: string | null; video_url?: string | null; file_url?: string | null; [k: string]: unknown;
}

/** L'utilisateur a-t-il droit au contenu complet ? (contrôle serveur) */
export function peutVoir(actor: Actor | null, c: Pick<ContentRow, 'access'>): boolean {
  if (c.access === 'gratuit') return true;
  if (!actor) return false;
  if (actor.role === 'admin' || actor.role === 'pasteur') return true;
  return !!actor.premium;
}

/**
 * Prépare un contenu pour le client : le chemin du fichier n'est jamais exposé,
 * et le texte / la vidéo d'un contenu Premium sont retirés si l'utilisateur n'y a pas droit.
 */
export function proteger<T extends ContentRow>(actor: Actor | null, c: T) {
  const { file_url, ...rest } = c;
  const autorise = peutVoir(actor, c);
  const base = { ...rest, has_file: !!file_url, has_video: !!c.video_url };
  if (autorise) return { ...base, locked: false };
  return { ...base, content: null, video_url: null, locked: true };
}

/** Validation des champs d'un contenu (création ou modification partielle). */
export function valider(b: Record<string, unknown>, opts: { partiel: boolean; type: TypeContenu; actor: Actor; pastorId: string }) {
  const out: Record<string, unknown> = {};
  const has = (k: string) => !opts.partiel || k in b;

  if (has('title')) out.title = v.requiredText(b.title, 'Titre', { min: 2, max: 160 });
  if (has('description')) out.description = v.text(b.description, 'Description', { max: 500, multiline: true });
  if (has('content')) out.content = v.text(b.content, 'Texte', { max: 50000, multiline: true });
  if (has('bible_ref')) out.bible_ref = v.text(b.bible_ref, 'Référence', { max: 120 });
  if (has('category')) out.category = v.oneOf(b.category, 'Catégorie', CATEGORIES);
  if (has('religion')) out.religion = v.oneOf(b.religion ?? 'chretien', 'Religion', RELIGIONS, true);
  if (has('access')) out.access = v.oneOf(b.access, 'Accès', ['gratuit', 'premium'] as const, true);
  if (has('is_published')) out.is_published = b.is_published === undefined ? true : v.bool(b.is_published, 'Publication');
  if (has('video_url')) {
    const url = v.text(b.video_url, 'Lien vidéo', { max: 300 });
    if (url && !/^https:\/\/[^\s"'<>]+$/i.test(url)) throw new ApiError(400, 'Le lien vidéo doit commencer par https://');
    out.video_url = url;
  }
  if (has('file_url')) {
    const p = v.text(b.file_url, 'Fichier', { max: 300 });
    // Un fichier ne peut être rattaché qu'au dossier de son pasteur
    if (p && !p.startsWith(`${opts.pastorId}/`)) throw new ApiError(403, 'Fichier non autorisé.');
    if (p && !/^[0-9a-f-]{36}\/[\w.-]+$/i.test(p)) throw new ApiError(400, 'Fichier invalide.');
    out.file_url = p;
    out.file_name = p ? v.text(b.file_name, 'Nom du fichier', { max: 200 }) : null;
    out.file_type = p ? v.oneOf(b.file_type, 'Type de fichier', MIME_AUTORISES) : null;
    out.file_size = p && typeof b.file_size === 'number' && b.file_size > 0 && b.file_size <= TAILLE_MAX ? Math.round(b.file_size) : null;
  }
  return out;
}

/** Règles propres à chaque type (vérifiées sur l'état final). */
export function verifierType(type: TypeContenu, c: Record<string, unknown>) {
  if (type === 'parole' && (!c.content || !c.bible_ref)) {
    throw new ApiError(400, 'Une Parole de Dieu doit contenir le texte du verset et sa référence (ex. Jean 3:16).');
  }
  if (type === 'document' && !c.file_url) throw new ApiError(400, 'Ajoutez le fichier du document.');
  if (type === 'enseignement' && !c.content && !c.video_url) throw new ApiError(400, 'Un enseignement doit contenir un texte ou un lien vidéo.');
  if (type === 'contenu' && !c.content) throw new ApiError(400, 'Le texte du contenu est obligatoire.');
}
