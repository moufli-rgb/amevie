import { BookOpen, FileText, GraduationCap, Sparkles, type LucideIcon } from 'lucide-react';

export type TypeContenu = 'parole' | 'enseignement' | 'document' | 'contenu';

export const TYPES: Record<TypeContenu, { label: string; pluriel: string; icon: LucideIcon; description: string }> = {
  parole: { label: 'Parole de Dieu', pluriel: 'Paroles de Dieu', icon: BookOpen, description: 'Un verset et sa méditation' },
  enseignement: { label: 'Enseignement', pluriel: 'Enseignements', icon: GraduationCap, description: 'Un message, une prédication, une étude' },
  document: { label: 'Document', pluriel: 'Documents', icon: FileText, description: 'PDF, livret, audio, présentation…' },
  contenu: { label: 'Contenu spirituel', pluriel: 'Contenus spirituels', icon: Sparkles, description: 'Méditation, prière, louange, témoignage' },
};
export const CATEGORIES = ['Méditation', 'Prière', 'Louange', 'Témoignage', 'Exhortation', 'Étude biblique', 'Famille', 'Jeunesse', 'Autre'];

/** Publication telle que renvoyée par /api/contents. */
export interface Contenu {
  id: string;
  pastor_id: string;
  type: TypeContenu;
  category: string | null;
  title: string;
  description: string | null;
  content?: string | null;
  bible_ref: string | null;
  video_url?: string | null;
  file_name: string | null;
  file_type: string | null;
  file_size: number | null;
  access: 'gratuit' | 'premium';
  is_published: boolean;
  views: number;
  created_at: string;
  updated_at: string;
  locked: boolean;
  has_file: boolean;
  has_video?: boolean;
  favorite?: boolean;
  pastors?: { prenom: string; nom: string; eglise: string | null } | null;
}

export function auteur(c: Pick<Contenu, 'pastors'>) {
  return c.pastors ? `Pst ${c.pastors.prenom} ${c.pastors.nom}` : 'Ame & Vie';
}

export function tailleFichier(n?: number | null) {
  if (!n) return '';
  if (n < 1024 * 1024) return `${Math.max(1, Math.round(n / 1024))} Ko`;
  return `${(n / 1024 / 1024).toFixed(1).replace('.', ',')} Mo`;
}

/** Lien d'intégration YouTube / Vimeo, sinon null. */
export function videoEmbed(url?: string | null): string | null {
  if (!url) return null;
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}`;
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return null;
}
