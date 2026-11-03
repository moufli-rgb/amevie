/**
 * Formules d'abonnement et prix (réglables dans l'administration → Paiements → Formules & prix).
 *  - Essentiel < Premium < Premium Plus : chaque formule ouvre les contenus de son niveau et des niveaux inférieurs.
 *  - Un membre ne repaie jamais un document compris dans sa formule.
 *  - Les programmes, packs et livres « payants » sont vendus à l'unité, à part (non inclus dans les formules).
 * Réglages stockés dans la table settings, clé « tarifs ».
 */
import { db } from './supabase.js';
import { ApiError } from './errors.js';

export type FormuleId = 'essentiel' | 'premium' | 'premium_plus';
export interface Formule { id: FormuleId; nom: string; prix: number; niveau: 1 | 2 | 3; description: string; avantages: string[] }
export interface Tarifs { formules: Formule[]; prix_produit: number; taux_fcfa: number }

export const FORMULES_DEFAUT: Formule[] = [
  { id: 'essentiel', nom: 'Essentiel', prix: 4, niveau: 1, description: 'Pour bien commencer, chaque jour.',
    avantages: ['Prières, Douas et méditations Essentiel', 'Documents Essentiel à télécharger', 'Mon carnet personnel et mes intentions'] },
  { id: 'premium', nom: 'Premium', prix: 9, niveau: 2, description: 'Le plus choisi : tout le contenu de votre communauté.',
    avantages: ['Tout Essentiel', 'Enseignements et documents Premium', 'Audios et vidéos', 'Ma bibliothèque de favoris'] },
  { id: 'premium_plus', nom: 'Premium Plus', prix: 18, niveau: 3, description: 'L’accompagnement le plus complet.',
    avantages: ['Tout Premium', 'Contenus et documents Premium Plus exclusifs', 'Les programmes spirituels exclusifs Premium Plus'] },
];

/** Niveau requis par un accès de contenu (« payant » : géré à part, par achat). */
export const NIVEAU_ACCES: Record<string, number> = { gratuit: 0, essentiel: 1, premium: 2, premium_plus: 3 };

/** Formule d'un abonnement d'après son type (les anciens types « Mensuel », « Offert »… valent Premium). */
export function formuleDe(type: string | null | undefined): Formule {
  const t = (type ?? '').toLowerCase().replace(/[\s_-]+/g, ' ').trim();
  const id: FormuleId = t === 'essentiel' ? 'essentiel' : t === 'premium plus' ? 'premium_plus' : 'premium';
  return FORMULES_DEFAUT.find((f) => f.id === id)!;
}

export async function lireTarifs(): Promise<Tarifs> {
  const prixDoc = Number((process.env.PRIX_DOCUMENT ?? '').replace(',', '.')) || 10;
  const base: Tarifs = { formules: FORMULES_DEFAUT.map((f) => ({ ...f })), prix_produit: prixDoc, taux_fcfa: 600 };
  const { data, error } = await db().from('settings').select('value').eq('key', 'tarifs').maybeSingle();
  if (error || !data) return base;
  const v = data.value as Partial<{ formules: Partial<Formule>[]; prix_produit: number; taux_fcfa: number }>;
  for (const f of base.formules) {
    const r = v.formules?.find((x) => x.id === f.id);
    if (r && typeof r.prix === 'number' && r.prix > 0) f.prix = r.prix;
    if (r && Array.isArray(r.avantages) && r.avantages.length) f.avantages = r.avantages.filter((a) => typeof a === 'string').slice(0, 8);
    if (r && typeof r.description === 'string') f.description = r.description.slice(0, 160);
  }
  if (typeof v.prix_produit === 'number' && v.prix_produit > 0) base.prix_produit = v.prix_produit;
  if (typeof v.taux_fcfa === 'number' && v.taux_fcfa > 0) base.taux_fcfa = v.taux_fcfa;
  return base;
}

const prix = (v: unknown, nom: string) => {
  const n = typeof v === 'number' ? v : Number(String(v ?? '').replace(',', '.'));
  if (!(n > 0 && n <= 10000)) throw new ApiError(400, `${nom} : indiquez un prix entre 0,01 et 10 000.`);
  return Math.round(n * 100) / 100;
};

/** Validation des réglages envoyés par l'administration. */
export function validerTarifs(b: Record<string, unknown>) {
  const formules = Array.isArray(b.formules) ? b.formules as Record<string, unknown>[] : [];
  return {
    formules: FORMULES_DEFAUT.map((f) => {
      const r = formules.find((x) => x.id === f.id) ?? {};
      const avantages = Array.isArray(r.avantages) ? (r.avantages as unknown[]).filter((a): a is string => typeof a === 'string' && a.trim().length > 0).map((a) => a.trim().slice(0, 120)).slice(0, 8) : f.avantages;
      return { id: f.id, prix: prix(r.prix ?? f.prix, f.nom), avantages, description: typeof r.description === 'string' ? r.description.trim().slice(0, 160) : f.description };
    }),
    prix_produit: prix(b.prix_produit ?? 10, 'Prix par défaut d’un produit'),
    taux_fcfa: Math.round(prix(b.taux_fcfa ?? 600, 'Taux F CFA')),
  };
}

export function trouverFormule(t: Tarifs, id: unknown): Formule {
  const f = t.formules.find((x) => x.id === id);
  if (!f) throw new ApiError(400, 'Choisissez une formule : Essentiel, Premium ou Premium Plus.');
  return f;
}
