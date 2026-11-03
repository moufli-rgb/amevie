/**
 * /api/payments — abonnement payé en cryptomonnaie (NOWPayments)
 *  GET ?scope=tarif     : public → { actif, prix, devise }
 *  GET                  : visiteur → ses paiements ; administrateur → tous les paiements
 *  POST ?action=creer   : visiteur → crée la facture et renvoie le lien de paiement
 *  POST ?action=ipn     : appelé par NOWPayments (signature HMAC vérifiée) → active l'abonnement
 *  POST ?action=manuel  : visiteur → { wallet_id, tx_hash } déclare un envoi direct (à valider par l'admin)
 *  POST ?action=valider&id=  : administrateur → valide un paiement manuel (abonnement activé / prolongé)
 *  POST ?action=refuser&id=  : administrateur → refuse un paiement manuel { note? }
 *  POST ?action=portefeuilles : administrateur → { wallets: [{ label, adresse, note? }] }
 */
import { randomBytes } from 'node:crypto';
import { route, query, send, type Req } from './_lib/http.js';
import { ApiError } from './_lib/errors.js';
import { db, check } from './_lib/supabase.js';
import { requireRole, getActor, type Actor } from './_lib/auth.js';
import { logActivite } from './_lib/activity.js';
import { configPaiement, creerFacture, crediterAbonnement, signatureValide, statutPaiement, lirePortefeuilles, validerPortefeuilles, validerTx } from './_lib/paiement.js';
import { body, requireUuid, text } from './_lib/validate.js';
import { lireTarifs, trouverFormule, validerTarifs, type Tarifs } from './_lib/formules.js';
import { resume } from './_lib/abonnement.js';

/** Adresse publique du site (pour les retours de NOWPayments). */
function origine(req: Req): string {
  const fixe = (process.env.SITE_URL ?? '').trim().replace(/\/+$/, '');
  if (/^https:\/\/[a-z0-9.-]+$/i.test(fixe)) return fixe;
  const h = String(req.headers['x-forwarded-host'] ?? req.headers.host ?? '').split(',')[0].trim();
  if (!/^[a-z0-9.-]+(:\d+)?$/i.test(h)) throw new ApiError(400, 'Adresse du site inconnue.');
  const proto = h.startsWith('localhost') || h.startsWith('127.0.0.1') ? 'http' : 'https';
  return `${proto}://${h}`;
}

/** Document vendu à l'unité que ce visiteur peut acheter (publié, payant, pas encore acheté). */
async function documentAchetable(v: Actor, contentId: unknown): Promise<{ id: string; title: string; price: number | null } | null> {
  if (contentId === undefined || contentId === null || contentId === '') return null;
  const id = requireUuid(contentId, 'Document');
  const { data, error } = await db().from('contents').select('id, title, access, is_published, price').eq('id', id).maybeSingle();
  check(error, 'contents');
  if (!data || !data.is_published) throw new ApiError(404, 'Document introuvable.');
  if (data.access !== 'payant') throw new ApiError(400, 'Ce contenu ne se vend pas à l’unité.');
  if (v.achats?.has(id)) throw new ApiError(409, 'Vous avez déjà acheté ce document : il est téléchargeable sur sa page.', 'DEJA_ACHETE');
  return { id: data.id as string, title: data.title as string, price: data.price == null ? null : Number(data.price) };
}

/** Ce que le visiteur paie : un produit (document, programme, pack) ou une formule d'abonnement. */
async function cibleAchat(v: Actor, b: Record<string, unknown>, t: Tarifs) {
  const doc = await documentAchetable(v, b.content_id);
  if (doc) {
    return { prix: doc.price ?? t.prix_produit, ligne: { content_id: doc.id }, doc, formule: null,
      description: `Ame & Vie — « ${doc.title.slice(0, 80)} » (${v.email})`, retour: `#contenu/${doc.id}` };
  }
  const f = trouverFormule(t, b.formule ?? 'premium');
  return { prix: f.prix, ligne: { formule: f.nom }, doc: null, formule: f,
    description: `Ame & Vie — formule ${f.nom}, 1 mois (${v.email})`, retour: undefined };
}

/** Achat d'un document : journalise l'achat (le paiement crédité ouvre le téléchargement). */
async function crediterAchat(p: { user_id: string; content_id: string; price_amount: number; price_currency: string }, par: { role: 'admin' | 'visiteur'; id: string; nom: string }, details: Record<string, unknown>) {
  const { data: doc } = await db().from('contents').select('title').eq('id', p.content_id).maybeSingle();
  await logActivite({
    role: par.role, user_id: par.id, nom: par.nom, action: 'achat_document', cible_type: 'contenu', cible_id: p.content_id,
    cible_titre: doc?.title ?? 'Document', details: { prix: `${p.price_amount} ${String(p.price_currency).toUpperCase()}`, acheteur: p.user_id, ...details },
  });
  return doc?.title as string | undefined;
}

/** Le visiteur déclare un envoi direct vers une adresse de l'administrateur. */
async function manuel(req: Req) {
  const v = await requireRole(req, 'visiteur');
  const b = body(req.body);
  const portefeuilles = await lirePortefeuilles();
  const w = portefeuilles.find((x) => x.id === b.wallet_id);
  if (!w) throw new ApiError(400, 'Choisissez l’adresse vers laquelle vous avez envoyé le paiement.');
  const tx = validerTx(b.tx_hash);
  const tarifs = await lireTarifs();
  const cible = await cibleAchat(v, b, tarifs);
  const doc = cible.doc;
  const enCours = await db().from('payments').select('id', { count: 'exact', head: true }).eq('user_id', v.id).eq('status', 'a_valider');
  check(enCours.error, 'payments');
  if ((enCours.count ?? 0) >= 3) throw new ApiError(429, 'Vous avez déjà 3 paiements en attente de validation. Patientez la réponse de l’administration.');
  const motif = tx.replace(/[\\%_]/g, (m) => `\\${m}`); // échappe les jokers du LIKE
  const deja = await db().from('payments').select('id').ilike('tx_hash', motif).maybeSingle();
  check(deja.error, 'payments');
  if (deja.data) throw new ApiError(409, 'Cette transaction a déjà été déclarée.', 'DOUBLON');
  const c = configPaiement();
  const { data, error } = await db().from('payments').insert({
    user_id: v.id, order_id: `man-${Date.now().toString(36)}-${randomBytes(4).toString('hex')}`, provider: 'manuel',
    price_amount: cible.prix, price_currency: c.devise, months: 1, status: 'a_valider', wallet_label: w.label, tx_hash: tx,
    ...cible.ligne,
  }).select('id, status, created_at').single();
  if (error?.code === '23505') throw new ApiError(409, 'Cette transaction a déjà été déclarée.', 'DOUBLON');
  check(error, 'payments');
  await logActivite({ role: 'visiteur', user_id: v.id, nom: v.name, action: 'paiement_manuel_declare', details: { portefeuille: w.label, document: doc?.title ?? null } });
  return { payment: data, message: doc
    ? `Merci ! Votre paiement pour « ${doc.title} » est enregistré. Le téléchargement s’ouvre dès que l’administration l’a validé.`
    : `Merci ! Votre paiement est enregistré. L’administration le vérifie et active votre formule ${cible.formule?.nom ?? 'Premium'} dès validation.` };
}

/** L'administrateur valide (abonnement activé) ou refuse un paiement manuel. */
async function decider(req: Req, action: 'valider' | 'refuser') {
  const admin = await requireRole(req, 'admin');
  const id = requireUuid(query(req, 'id'));
  const note = text(body(req.body).note, 'Note', { max: 300 });
  const { data: p, error } = await db().from('payments').select('*').eq('id', id).maybeSingle();
  check(error, 'payments');
  if (!p) throw new ApiError(404, 'Paiement introuvable.');
  if (p.credited) throw new ApiError(409, 'Ce paiement a déjà été validé.');
  const maj = { reviewed_by: admin.name, reviewed_at: new Date().toISOString(), updated_at: new Date().toISOString(), admin_note: note };
  if (action === 'refuser') {
    const { error: e } = await db().from('payments').update({ ...maj, status: 'refuse' }).eq('id', id);
    check(e, 'payments');
    await logActivite({ role: 'admin', user_id: admin.id, nom: admin.name, action: 'paiement_refuse', cible_type: 'visiteur', cible_id: p.user_id, cible_titre: p.tx_hash ?? p.order_id });
    return { ok: true, message: 'Paiement refusé.' };
  }
  const verrou = await db().from('payments').update({ ...maj, credited: true, status: 'paye' }).eq('id', id).eq('credited', false).select('id');
  check(verrou.error, 'payments');
  if (!verrou.data?.length) throw new ApiError(409, 'Ce paiement a déjà été validé.');
  if (p.content_id) {
    const titre = await crediterAchat(p, { role: 'admin', id: admin.id, nom: admin.name }, { tx: p.tx_hash });
    return { ok: true, message: `Achat validé : le visiteur peut télécharger « ${titre ?? 'le document'} ».` };
  }
  const sub = await crediterAbonnement(p.user_id, p.months, p.formule ?? 'Premium');
  await db().from('payments').update({ subscription_id: sub.id }).eq('id', id);
  await logActivite({
    role: 'admin', user_id: admin.id, nom: admin.name, action: 'paiement_valide', cible_type: 'visiteur', cible_id: p.user_id,
    cible_titre: `${p.price_amount} ${String(p.price_currency).toUpperCase()}`, details: { fin: sub.end_date, tx: p.tx_hash },
  });
  return { ok: true, message: `Paiement validé : formule ${p.formule ?? 'Premium'} active jusqu’au ${new Date(sub.end_date).toLocaleDateString('fr-FR')}.`, abonnement: resume(sub) };
}

async function ipn(req: Req) {
  const c = configPaiement();
  const sig = req.headers['x-nowpayments-sig'];
  if (!c.ipnSecret || !signatureValide(req.body, Array.isArray(sig) ? sig[0] : sig, c.ipnSecret)) {
    throw new ApiError(401, 'Signature invalide.', 'SIGNATURE');
  }
  const b = req.body as Record<string, unknown>;
  const orderId = typeof b.order_id === 'string' ? b.order_id : '';
  const statutNp = typeof b.payment_status === 'string' ? b.payment_status : '';
  const { data: p, error } = await db().from('payments').select('*').eq('order_id', orderId).maybeSingle();
  check(error, 'payments');
  if (!p) return { ok: true, ignore: 'commande inconnue' };

  const statut = statutPaiement(statutNp);
  await db().from('payments').update({
    status: statut,
    payment_id: b.payment_id != null ? String(b.payment_id) : p.payment_id,
    pay_currency: typeof b.pay_currency === 'string' ? b.pay_currency : p.pay_currency,
    pay_amount: typeof b.pay_amount === 'number' ? b.pay_amount : p.pay_amount,
    updated_at: new Date().toISOString(),
  }).eq('id', p.id);

  if (statut !== 'paye') return { ok: true };

  // Montant et devise contrôlés : la facture doit correspondre à la commande enregistrée.
  const montant = Number(b.price_amount);
  const devise = String(b.price_currency ?? '').toLowerCase();
  if (!(montant >= Number(p.price_amount) - 0.01) || devise !== String(p.price_currency).toLowerCase()) {
    console.error('[paiement] montant inattendu', orderId, montant, devise);
    await db().from('payments').update({ status: 'a_verifier' }).eq('id', p.id);
    return { ok: true };
  }

  // Crédit unique : seule la première notification « finished » passe ce verrou.
  const verrou = await db().from('payments').update({ credited: true }).eq('id', p.id).eq('credited', false).select('id');
  check(verrou.error, 'payments');
  if (!verrou.data?.length) return { ok: true, deja: true };

  if (p.content_id) {
    const { data: acheteur } = await db().from('users').select('prenom, nom').eq('id', p.user_id).maybeSingle();
    await crediterAchat(p, { role: 'visiteur', id: p.user_id, nom: acheteur ? `${acheteur.prenom} ${acheteur.nom}` : 'Visiteur' }, { crypto: b.pay_currency ?? null });
    return { ok: true };
  }
  const sub = await crediterAbonnement(p.user_id, p.months, p.formule ?? 'Premium');
  await db().from('payments').update({ subscription_id: sub.id }).eq('id', p.id);
  const { data: u } = await db().from('users').select('prenom, nom').eq('id', p.user_id).maybeSingle();
  await logActivite({
    role: 'visiteur', user_id: p.user_id, nom: u ? `${u.prenom} ${u.nom}` : 'Visiteur', action: 'paiement_crypto',
    cible_type: 'abonnement', cible_id: sub.id, cible_titre: `${p.price_amount} ${String(p.price_currency).toUpperCase()}`,
    details: { crypto: b.pay_currency ?? null, fin: sub.end_date },
  });
  return { ok: true };
}

export default route({
  async GET(req) {
    if (query(req, 'scope') === 'tarif') {
      const c = configPaiement();
      const portefeuilles = await lirePortefeuilles();
      const t = await lireTarifs();
      const premium = t.formules.find((f) => f.id === 'premium')!;
      return {
        actif: c.actif || portefeuilles.length > 0, auto: c.actif, prix: premium.prix, prix_document: t.prix_produit, devise: c.devise,
        formules: t.formules, taux_fcfa: t.taux_fcfa, manuel: { actif: portefeuilles.length > 0, portefeuilles },
      };
    }
    const actor = await getActor(req);
    if (actor.role === 'visiteur') {
      const { data, error } = await db().from('payments')
        .select('id, provider, content_id, formule, price_amount, price_currency, pay_currency, wallet_label, tx_hash, admin_note, months, status, credited, created_at, contents(title)')
        .eq('user_id', actor.id).order('created_at', { ascending: false }).limit(20);
      check(error, 'payments');
      return { payments: data ?? [] };
    }
    if (actor.role !== 'admin') throw new ApiError(403, 'Accès refusé.');
    const { data, error } = await db().from('payments')
      .select('id, order_id, provider, content_id, formule, contents(title), price_amount, price_currency, pay_currency, pay_amount, wallet_label, tx_hash, admin_note, reviewed_by, reviewed_at, months, status, credited, created_at, users(nom, prenom, email)')
      .order('created_at', { ascending: false }).limit(300);
    check(error, 'payments');
    const c = configPaiement();
    const t = await lireTarifs();
    return { payments: data ?? [], config: { actif: c.actif, prix: t.formules.find((f) => f.id === 'premium')!.prix, prix_document: t.prix_produit, devise: c.devise }, tarifs: t, portefeuilles: await lirePortefeuilles() };
  },

  async POST(req, res) {
    const action = query(req, 'action');
    if (action === 'ipn') return ipn(req);
    if (action === 'manuel') return send(res, 201, await manuel(req));
    if (action === 'valider' || action === 'refuser') return decider(req, action);
    if (action === 'tarifs') {
      const admin = await requireRole(req, 'admin');
      const value = validerTarifs(body(req.body));
      const { error } = await db().from('settings').upsert({ key: 'tarifs', value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
      check(error, 'settings');
      await logActivite({ role: 'admin', user_id: admin.id, nom: admin.name, action: 'tarifs_modifies', details: value });
      return { tarifs: await lireTarifs() };
    }
    if (action === 'portefeuilles') {
      const admin = await requireRole(req, 'admin');
      const liste = validerPortefeuilles(body(req.body).wallets);
      const { error } = await db().from('settings').upsert({ key: 'portefeuilles', value: { liste }, updated_at: new Date().toISOString() }, { onConflict: 'key' });
      check(error, 'settings');
      await logActivite({ role: 'admin', user_id: admin.id, nom: admin.name, action: 'portefeuilles_modifies', details: { nombre: liste.length } });
      return { portefeuilles: liste };
    }
    if (action !== 'creer') throw new ApiError(400, 'Action inconnue.');

    const v = await requireRole(req, 'visiteur');
    const c = configPaiement();
    if (!c.actif) throw new ApiError(503, 'Le paiement en cryptomonnaie n’est pas encore activé sur le site. Réessayez plus tard.', 'PAIEMENT_INACTIF');

    // Pas plus de 5 factures ouvertes par heure et par compte (anti-abus)
    const depuis = new Date(Date.now() - 3600_000).toISOString();
    const recentes = await db().from('payments').select('id', { count: 'exact', head: true }).eq('user_id', v.id).gte('created_at', depuis);
    check(recentes.error, 'payments');
    if ((recentes.count ?? 0) >= 5) throw new ApiError(429, 'Trop de tentatives de paiement. Réessayez dans une heure.');

    const cible = await cibleAchat(v, body(req.body), await lireTarifs());
    const orderId = `av-${Date.now().toString(36)}-${randomBytes(6).toString('hex')}`;
    const { error } = await db().from('payments').insert({
      user_id: v.id, order_id: orderId, price_amount: cible.prix, price_currency: c.devise, months: 1, status: 'en_attente', ...cible.ligne,
    });
    check(error, 'payments');
    const f = await creerFacture({ orderId, description: cible.description, origine: origine(req), prix: cible.prix, retour: cible.retour });
    await db().from('payments').update({ invoice_id: f.invoiceId }).eq('order_id', orderId);
    await logActivite({ role: 'visiteur', user_id: v.id, nom: v.name, action: 'paiement_demande', details: { prix: f.prix, devise: f.devise } });
    send(res, 201, { url: f.url, prix: f.prix, devise: f.devise, abonnement: resume(v.abonnement ?? null) });
  },
});
