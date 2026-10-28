/**
 * Paiement de l'abonnement en cryptomonnaie via NOWPayments (https://nowpayments.io).
 *  - Le visiteur clique sur « Payer en crypto » : le serveur crée une facture NOWPayments
 *    au prix fixé ici (jamais envoyé par le navigateur) et renvoie le lien de paiement.
 *  - Sur la page NOWPayments, le visiteur choisit la cryptomonnaie qu'il veut (BTC, ETH, USDT, …).
 *  - NOWPayments prévient le serveur (IPN signé HMAC-SHA512). Paiement « finished » →
 *    abonnement activé ou prolongé automatiquement, une seule fois par paiement.
 *
 * Variables Vercel :
 *  NOWPAYMENTS_API_KEY     clé API (tableau de bord NOWPayments → Settings → API keys)
 *  NOWPAYMENTS_IPN_SECRET  clé secrète IPN (Settings → Payments → Instant payment notifications)
 *  PRIX_ABONNEMENT         prix d'un mois (ex. 10)            — facultatif, 10 par défaut
 *  DEVISE_ABONNEMENT       devise du prix (usd, eur…)         — facultatif, usd par défaut
 *  NOWPAYMENTS_SANDBOX     « 1 » pour utiliser le bac à sable — facultatif
 */
import { createHmac, timingSafeEqual } from 'node:crypto';
import { db, check } from './supabase.js';
import { ApiError } from './errors.js';
import { abonnementCourant, ajouterMois, statutReel, type SubscriptionRow } from './abonnement.js';

export function configPaiement() {
  const lire = (n: string) => (process.env[n] ?? '').trim();
  const prix = Number(lire('PRIX_ABONNEMENT').replace(',', '.')) || 10;
  const devise = (lire('DEVISE_ABONNEMENT') || 'usd').toLowerCase();
  const apiKey = lire('NOWPAYMENTS_API_KEY');
  const ipnSecret = lire('NOWPAYMENTS_IPN_SECRET');
  const base = lire('NOWPAYMENTS_API_URL').replace(/\/+$/, '')
    || (lire('NOWPAYMENTS_SANDBOX') === '1' ? 'https://api-sandbox.nowpayments.io/v1' : 'https://api.nowpayments.io/v1');
  return { prix: Math.round(prix * 100) / 100, devise, apiKey, ipnSecret, base, actif: !!apiKey && !!ipnSecret };
}

/** Tri récursif des clés (exigé par NOWPayments pour la signature). */
function trier(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(trier);
  if (v && typeof v === 'object') {
    return Object.keys(v as Record<string, unknown>).sort().reduce<Record<string, unknown>>((o, k) => {
      o[k] = trier((v as Record<string, unknown>)[k]);
      return o;
    }, {});
  }
  return v;
}

/** Vérifie la signature x-nowpayments-sig (HMAC-SHA512 du JSON trié). */
export function signatureValide(corps: unknown, signature: string | undefined, secret: string): boolean {
  if (!signature || !secret || !corps || typeof corps !== 'object') return false;
  const attendu = createHmac('sha512', secret).update(JSON.stringify(trier(corps))).digest('hex');
  const a = Buffer.from(attendu, 'utf8');
  const b = Buffer.from(signature.trim().toLowerCase(), 'utf8');
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Crée la facture NOWPayments. */
export async function creerFacture(p: { orderId: string; description: string; origine: string }) {
  const c = configPaiement();
  if (!c.actif) throw new ApiError(503, 'Le paiement en cryptomonnaie n’est pas encore activé sur le site. Réessayez plus tard.', 'PAIEMENT_INACTIF');
  let r: Response;
  try {
    r = await fetch(`${c.base}/invoice`, {
      method: 'POST',
      headers: { 'x-api-key': c.apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        price_amount: c.prix,
        price_currency: c.devise,
        order_id: p.orderId,
        order_description: p.description,
        ipn_callback_url: `${p.origine}/api/payments?action=ipn`,
        success_url: `${p.origine}/#espace/abonnement/merci`,
        cancel_url: `${p.origine}/#espace/abonnement`,
        is_fee_paid_by_user: false,
      }),
    });
  } catch {
    throw new ApiError(502, 'Le service de paiement ne répond pas. Réessayez dans un instant.', 'PAIEMENT_INDISPONIBLE');
  }
  const data = (await r.json().catch(() => ({}))) as { id?: string | number; invoice_url?: string; message?: string };
  if (!r.ok || !data.invoice_url) {
    console.error('[paiement] facture refusée', r.status, data.message);
    throw new ApiError(502, r.status === 401 || r.status === 403
      ? 'Le paiement crypto est mal configuré (clé NOWPAYMENTS_API_KEY refusée).'
      : 'Le service de paiement a refusé la demande. Réessayez dans un instant.', 'PAIEMENT_REFUSE');
  }
  return { invoiceId: String(data.id ?? ''), url: data.invoice_url, prix: c.prix, devise: c.devise };
}

/** Statuts NOWPayments → libellés du site. */
export function statutPaiement(s: string): string {
  switch (s) {
    case 'finished': return 'paye';
    case 'partially_paid': return 'partiel';
    case 'failed': case 'refunded': return 'echoue';
    case 'expired': return 'expire';
    case 'waiting': return 'en_attente';
    default: return 'en_cours'; // confirming, confirmed, sending…
  }
}

/**
 * Active ou prolonge l'abonnement après un paiement confirmé.
 * Abonnement en cours → prolongé à partir de sa date de fin ; sinon nouvel abonnement d'un mois.
 */
export async function crediterAbonnement(userId: string, mois: number): Promise<SubscriptionRow> {
  const now = new Date();
  const courant = await abonnementCourant(userId);
  if (courant && statutReel(courant) === 'actif') {
    const base = Math.max(Date.parse(courant.end_date), now.getTime());
    const { data, error } = await db().from('subscriptions').update({
      end_date: ajouterMois(new Date(base), mois).toISOString(),
      duration_months: Math.min(36, courant.duration_months + mois),
      updated_at: now.toISOString(),
    }).eq('id', courant.id).select('*').single();
    check(error, 'subscriptions');
    return data as SubscriptionRow;
  }
  const { data, error } = await db().from('subscriptions').insert({
    user_id: userId, type: 'Mensuel', duration_months: mois, start_date: now.toISOString(),
    end_date: ajouterMois(now, mois).toISOString(), status: 'actif', note: 'Payé en cryptomonnaie', activated_by: 'Paiement crypto',
  }).select('*').single();
  check(error, 'subscriptions');
  return data as SubscriptionRow;
}

/* ---------------------------------------------------------------------------
 * Paiement manuel : adresses de portefeuille réglées par l'administrateur
 * (table settings, clé « portefeuilles »). Le visiteur envoie la crypto,
 * colle le numéro de transaction, puis l'administrateur valide ou refuse.
 * ------------------------------------------------------------------------- */
export interface Portefeuille { id: string; label: string; adresse: string; note?: string }

export async function lirePortefeuilles(): Promise<Portefeuille[]> {
  const { data, error } = await db().from('settings').select('value').eq('key', 'portefeuilles').maybeSingle();
  if (error) return []; // table absente : paiement manuel simplement indisponible
  const v = (data?.value as { liste?: Portefeuille[] } | undefined)?.liste;
  return Array.isArray(v) ? v : [];
}

export function validerPortefeuilles(entree: unknown): Portefeuille[] {
  if (!Array.isArray(entree)) throw new ApiError(400, 'Liste de portefeuilles invalide.');
  if (entree.length > 8) throw new ApiError(400, '8 adresses au maximum.');
  return entree.map((w, i) => {
    const o = (w ?? {}) as Record<string, unknown>;
    const label = typeof o.label === 'string' ? o.label.trim() : '';
    const adresse = typeof o.adresse === 'string' ? o.adresse.trim() : '';
    const note = typeof o.note === 'string' ? o.note.trim().slice(0, 160) : '';
    if (label.length < 2 || label.length > 40) throw new ApiError(400, `Adresse ${i + 1} : indiquez la crypto et le réseau (ex. « USDT · TRC20 »).`);
    if (!/^[A-Za-z0-9:._-]{10,130}$/.test(adresse)) throw new ApiError(400, `Adresse ${i + 1} : l’adresse du portefeuille semble invalide (lettres et chiffres, sans espace).`);
    const id = typeof o.id === 'string' && /^[a-z0-9-]{4,40}$/.test(o.id) ? o.id : `w-${Date.now().toString(36)}-${i}`;
    return { id, label, adresse, ...(note ? { note } : {}) };
  });
}

/** Numéro de transaction (hash) : lettres, chiffres et quelques séparateurs, sans espace. */
export function validerTx(v: unknown): string {
  const s = typeof v === 'string' ? v.trim() : '';
  if (!/^[A-Za-z0-9:_-]{8,200}$/.test(s)) throw new ApiError(400, 'Collez le numéro (identifiant) de la transaction, tel qu’il apparaît dans votre portefeuille : lettres et chiffres, sans espace.');
  return s;
}
