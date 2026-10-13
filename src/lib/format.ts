/** Formats d'affichage en français. */
const dateFmt = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
const dateCourte = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short' });
const nombre = new Intl.NumberFormat('fr-FR');

export function formatDate(v?: string | null) {
  if (!v) return '—';
  const d = new Date(v.length === 10 ? `${v}T12:00:00` : v);
  return Number.isNaN(d.getTime()) ? '—' : dateFmt.format(d);
}
export function formatDateCourte(v?: string | null) {
  if (!v) return '—';
  const d = new Date(v.length === 10 ? `${v}T12:00:00` : v);
  return Number.isNaN(d.getTime()) ? '—' : dateCourte.format(d);
}
export function formatNombre(n?: number | null) {
  return n === null || n === undefined ? '—' : nombre.format(n);
}
export function formatMontant(n?: number | string | null) {
  if (n === null || n === undefined || n === '') return '—';
  return `${nombre.format(Number(n))} FCFA`;
}
export function depuis(v?: string | null) {
  if (!v) return '';
  const diff = (Date.now() - new Date(v).getTime()) / 1000;
  if (diff < 60) return "à l'instant";
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
  if (diff < 86400 * 7) return `il y a ${Math.floor(diff / 86400)} j`;
  return formatDateCourte(v);
}
export function initiales(nom?: string) {
  if (!nom) return '?';
  return nom.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]!.toUpperCase()).join('');
}
export function aujourdhui() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}
