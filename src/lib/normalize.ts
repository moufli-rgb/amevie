/**
 * Normalise un nom : sans accents, minuscules, espaces réduits.
 * « Cité Akpakpa » === « cite akpakpa »
 * (Copie identique côté serveur : api/_lib/normalize.ts)
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
