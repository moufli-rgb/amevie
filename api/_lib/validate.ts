import { ApiError } from './errors.js';
import { tidy } from './normalize.js';

/** Validation stricte des entrées côté serveur. */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isUuid(v: unknown): v is string {
  return typeof v === 'string' && UUID_RE.test(v);
}

export function requireUuid(v: unknown, label = 'Identifiant'): string {
  if (!isUuid(v)) throw new ApiError(400, `${label} invalide.`);
  return v;
}

export function body(input: unknown): Record<string, unknown> {
  if (input && typeof input === 'object' && !Array.isArray(input)) return input as Record<string, unknown>;
  if (typeof input === 'string' && input.length < 100_000) {
    try {
      const parsed = JSON.parse(input);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
    } catch { /* ignoré */ }
  }
  return {};
}

interface TextOpts { min?: number; max: number; required?: boolean; multiline?: boolean }

export function text(v: unknown, label: string, o: TextOpts): string | null {
  if (v === undefined || v === null || v === '') {
    if (o.required) throw new ApiError(400, `Le champ « ${label} » est obligatoire.`);
    return null;
  }
  if (typeof v !== 'string') throw new ApiError(400, `Le champ « ${label} » est invalide.`);
  // Retire les caractères de contrôle (sauf retours à la ligne pour les textes longs)
  const cleaned = o.multiline
    ? v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim()
    : tidy(v.replace(/[\u0000-\u001F\u007F]/g, ' '));
  if (!cleaned) {
    if (o.required) throw new ApiError(400, `Le champ « ${label} » est obligatoire.`);
    return null;
  }
  if (o.min && cleaned.length < o.min) throw new ApiError(400, `« ${label} » doit contenir au moins ${o.min} caractères.`);
  if (cleaned.length > o.max) throw new ApiError(400, `« ${label} » ne doit pas dépasser ${o.max} caractères.`);
  return cleaned;
}

export function requiredText(v: unknown, label: string, o: Omit<TextOpts, 'required'>): string {
  return text(v, label, { ...o, required: true }) as string;
}

export function password(v: unknown, label = 'Mot de passe'): string {
  if (typeof v !== 'string' || v.length < 8) throw new ApiError(400, `Le ${label.toLowerCase()} doit contenir au moins 8 caractères.`);
  if (v.length > 128) throw new ApiError(400, `Le ${label.toLowerCase()} est trop long (128 caractères maximum).`);
  return v;
}

export function phone(v: unknown): string | null {
  const t = text(v, 'Téléphone', { max: 30 });
  if (t && !/^[+0-9 ().-]{6,30}$/.test(t)) throw new ApiError(400, 'Le numéro de téléphone est invalide.');
  return t;
}

export function int(v: unknown, label: string, min = 0, max = 1_000_000): number {
  const n = typeof v === 'string' && v.trim() !== '' ? Number(v) : v;
  if (n === undefined || n === null || n === '') return 0;
  if (typeof n !== 'number' || !Number.isFinite(n) || !Number.isInteger(n) || n < min || n > max) {
    throw new ApiError(400, `Le champ « ${label} » doit être un nombre entier entre ${min} et ${max}.`);
  }
  return n;
}

export function money(v: unknown, label: string): number {
  const n = typeof v === 'string' && v.trim() !== '' ? Number(v.replace(',', '.')) : v;
  if (n === undefined || n === null || n === '') return 0;
  if (typeof n !== 'number' || !Number.isFinite(n) || n < 0 || n > 1e12) {
    throw new ApiError(400, `Le champ « ${label} » est invalide.`);
  }
  return Math.round(n * 100) / 100;
}

export function date(v: unknown, label: string, required = false): string | null {
  if (v === undefined || v === null || v === '') {
    if (required) throw new ApiError(400, `Le champ « ${label} » est obligatoire.`);
    return null;
  }
  if (typeof v !== 'string' || !DATE_RE.test(v) || Number.isNaN(Date.parse(v))) {
    throw new ApiError(400, `La date « ${label} » est invalide.`);
  }
  return v;
}

export function oneOf<T extends string>(v: unknown, label: string, values: readonly T[], required = false): T | null {
  if (v === undefined || v === null || v === '') {
    if (required) throw new ApiError(400, `Le champ « ${label} » est obligatoire.`);
    return null;
  }
  if (typeof v !== 'string' || !values.includes(v as T)) throw new ApiError(400, `Le champ « ${label} » est invalide.`);
  return v as T;
}

export function bool(v: unknown, label: string): boolean {
  if (typeof v !== 'boolean') throw new ApiError(400, `Le champ « ${label} » est invalide.`);
  return v;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export function email(v: unknown): string {
  const e = requiredText(v, 'Email', { min: 5, max: 160 }).toLowerCase();
  if (!EMAIL_RE.test(e)) throw new ApiError(400, "L'adresse email est invalide.");
  return e;
}
