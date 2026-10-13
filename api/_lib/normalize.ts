/**
 * Normalise un nom pour les comparaisons :
 * sans accents, en minuscules, espaces multiples réduits.
 * « Cité  Akpakpa » → « cite akpakpa »
 * (Copie identique côté client : src/lib/normalize.ts)
 */
export function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[’'`]/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/** Nettoie l'affichage : espaces superflus retirés. */
export function tidy(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}
