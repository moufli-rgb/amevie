import { BookOpen, CalendarDays, FileText, GraduationCap, Package, Sparkles, type LucideIcon } from 'lucide-react';

export type TypeContenu = 'parole' | 'enseignement' | 'document' | 'contenu' | 'programme' | 'pack';

export const TYPES: Record<TypeContenu, { label: string; pluriel: string; icon: LucideIcon; description: string }> = {
  parole: { label: 'Parole de Dieu', pluriel: 'Paroles de Dieu', icon: BookOpen, description: 'Un verset et sa méditation' },
  enseignement: { label: 'Enseignement', pluriel: 'Enseignements', icon: GraduationCap, description: 'Un message, une prédication, une étude' },
  document: { label: 'Document', pluriel: 'Documents', icon: FileText, description: 'PDF, livret, audio, présentation…' },
  contenu: { label: 'Contenu spirituel', pluriel: 'Contenus spirituels', icon: Sparkles, description: 'Méditation, prière, louange, témoignage' },
  programme: { label: 'Programme', pluriel: 'Programmes', icon: CalendarDays, description: 'Un parcours de 7, 14, 30 ou 40 jours' },
  pack: { label: 'Pack', pluriel: 'Packs', icon: Package, description: 'Prières sur un thème, pack de fête…' },
};
/** Couleurs par type (définies dans src/index.css : --couleur-parole, etc.). Classes écrites en entier pour Tailwind. */
export const TYPE_COULEURS: Record<TypeContenu, { bg: string; text: string; soft: string; ring: string }> = {
  parole: { bg: 'bg-parole', text: 'text-parole', soft: 'bg-parole/12', ring: 'ring-parole/30' },
  enseignement: { bg: 'bg-enseignement', text: 'text-enseignement', soft: 'bg-enseignement/12', ring: 'ring-enseignement/30' },
  document: { bg: 'bg-document', text: 'text-document', soft: 'bg-document/12', ring: 'ring-document/30' },
  contenu: { bg: 'bg-contenu', text: 'text-contenu', soft: 'bg-contenu/12', ring: 'ring-contenu/30' },
  programme: { bg: 'bg-primary', text: 'text-primary', soft: 'bg-primary/12', ring: 'ring-primary/30' },
  pack: { bg: 'bg-secondary', text: 'text-secondary', soft: 'bg-secondary/12', ring: 'ring-secondary/30' },
};

/** Images d'illustration par type (voir src/config/images.json). */
export const TYPE_IMAGES = {
  parole: ['af_priere_femme', 'af_bible', 'af_eglise_bleue', 'af_soleil_arbre', 'af_priere_mains'],
  enseignement: ['af_chorale', 'af_eglise_femmes', 'af_louange', 'af_homme_priere', 'af_ancienne'],
  document: ['af_bible', 'af_ancienne', 'af_famille_jeu', 'af_priere_mains'],
  contenu: ['af_priere_femme', 'af_louange', 'af_homme_fleurs', 'af_eglise_femmes', 'af_danse'],
  programme: ['af_savane_aube', 'af_homme_fleurs', 'af_soleil_arbre'],
  pack: ['af_priere_mains', 'af_famille_joie', 'af_louange'],
} as const;

export const CATEGORIES = ['Méditation', 'Prière', 'Doua', 'Rappel', 'Louange', 'Témoignage', 'Exhortation', 'Étude biblique', 'Étude coranique', 'Sagesse', 'Pleine conscience',
  'Développement personnel', 'Gratitude', 'Motivation', 'Paix intérieure', 'Fête religieuse', 'Famille', 'Jeunesse', 'Autre'];

/** Niveaux d'accès : gratuit, compris dans une formule, ou vendu à l'unité. */
export type Acces = 'gratuit' | 'essentiel' | 'premium' | 'premium_plus' | 'payant';
export const ACCES: Record<Acces, { label: string; court: string; niveau: number; description: string }> = {
  gratuit: { label: 'Gratuit', court: 'Gratuit', niveau: 0, description: 'Visible par tous' },
  essentiel: { label: 'Formule Essentiel', court: 'Essentiel', niveau: 1, description: 'Dès la formule Essentiel' },
  premium: { label: 'Formule Premium', court: 'Premium', niveau: 2, description: 'Dès la formule Premium' },
  premium_plus: { label: 'Formule Premium Plus', court: 'Premium Plus', niveau: 3, description: 'Formule Premium Plus' },
  payant: { label: 'Vendu à l’unité', court: 'À l’unité', niveau: 99, description: 'Acheté séparément' },
};

/** Religions / traditions (filtre simple de la bibliothèque). */
export type Religion = 'chretien' | 'musulman' | 'universel';
export const RELIGIONS: Record<Religion, { label: string; court: string; symbole: string; bg: string; text: string; soft: string; ring: string }> = {
  chretien: { label: 'Christianisme', court: 'Chrétien', symbole: '✝', bg: 'bg-chretien', text: 'text-chretien', soft: 'bg-chretien/10', ring: 'ring-chretien/40' },
  musulman: { label: 'Islam', court: 'Musulman', symbole: '☪', bg: 'bg-musulman', text: 'text-musulman', soft: 'bg-musulman/10', ring: 'ring-musulman/40' },
  universel: { label: 'Spiritualité universelle', court: 'Universel', symbole: '✦', bg: 'bg-universel', text: 'text-universel', soft: 'bg-universel/10', ring: 'ring-universel/40' },
};
/** Illustrations propres à chaque tradition (les photos chrétiennes ne sont utilisées que pour le Christianisme). */
export const RELIGION_IMAGES = {
  musulman: ['af_mosquee', 'af_hijab_groupe', 'af_coupole', 'af_sourire_foulard', 'af_mosquee_aube'],
  universel: ['af_savane_aube', 'af_meditation', 'af_soleil_arbre', 'af_meditation_maison', 'af_savane_or'],
} as const;
/** Rubriques de chaque communauté (Bibliothèque spirituelle de l'espace membre). */
export interface Theme { id: string; label: string; test: (c: Pick<Contenu, 'type' | 'category'>) => boolean }
const cat = (...l: string[]) => (c: Pick<Contenu, 'category'>) => !!c.category && l.includes(c.category);
const prog = (c: Pick<Contenu, 'type'>) => c.type === 'programme' || c.type === 'pack';
export const THEMES: Record<Religion, Theme[]> = {
  chretien: [
    { id: 'prieres', label: 'Prières', test: cat('Prière', 'Louange') },
    { id: 'bible', label: 'Bible', test: (c) => c.type === 'parole' || cat('Étude biblique')(c) },
    { id: 'meditations', label: 'Méditations', test: cat('Méditation', 'Exhortation', 'Témoignage') },
    { id: 'programmes', label: 'Programmes', test: prog },
  ],
  musulman: [
    { id: 'douas', label: 'Douas', test: cat('Doua', 'Prière') },
    { id: 'coran', label: 'Coran', test: (c) => c.type === 'parole' || cat('Étude coranique')(c) },
    { id: 'rappels', label: 'Rappels', test: cat('Rappel', 'Exhortation', 'Méditation') },
    { id: 'programmes', label: 'Programmes', test: prog },
  ],
  universel: [
    { id: 'developpement', label: 'Développement personnel', test: cat('Développement personnel', 'Sagesse') },
    { id: 'gratitude', label: 'Gratitude', test: cat('Gratitude') },
    { id: 'motivation', label: 'Motivation', test: cat('Motivation', 'Exhortation') },
    { id: 'paix', label: 'Paix intérieure', test: cat('Paix intérieure', 'Pleine conscience', 'Méditation') },
  ],
};
export const estReligion = (v: string): v is Religion => v in RELIGIONS;

/** Publication telle que renvoyée par /api/contents. */
export interface Contenu {
  id: string;
  pastor_id: string;
  type: TypeContenu;
  religion?: Religion;
  category: string | null;
  title: string;
  description: string | null;
  content?: string | null;
  bible_ref: string | null;
  video_url?: string | null;
  file_name: string | null;
  file_type: string | null;
  file_size: number | null;
  access: Acces;
  price?: number | null;
  duree_jours?: number | null;
  /** Document payant : déjà acheté par ce visiteur */
  achete?: boolean;
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
  return c.pastors ? `${c.pastors.prenom} ${c.pastors.nom}`.trim() : 'Ame & Vie';
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
