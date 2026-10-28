import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Bitcoin, Check, CheckCircle2, Clock, ExternalLink, Plus, Save, Trash2, Wallet, X, XCircle, Zap } from 'lucide-react';
import { api } from '@/lib/api';
import { depuis, formatDate } from '@/lib/format';
import { STATUTS_PAIEMENT } from '@/lib/paiements';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Alert, type AlertMsg } from '@/components/ui/Alert';
import { Skeleton } from '@/components/ui/Empty';
import { rechargerTarif, type Portefeuille } from '@/components/Premium';
import { PageHeader } from '@/dashboard/Shell';
import { Card, LoadError, StatGrid, Tabs } from '@/dashboard/Widgets';
import { useData } from '@/dashboard/useData';

interface Paiement {
  id: string; order_id: string; provider: string; price_amount: number; price_currency: string; pay_currency: string | null; pay_amount: number | null;
  wallet_label: string | null; tx_hash: string | null; admin_note: string | null; reviewed_by: string | null; reviewed_at: string | null;
  months: number; status: string; credited: boolean; created_at: string; users: { nom: string; prenom: string; email: string } | null;
}
interface Donnees { payments: Paiement[]; config: { actif: boolean; prix: number; devise: string }; portefeuilles: Portefeuille[] }

/** Lien vers l'explorateur de la blockchain, d'après le réseau indiqué dans le nom de l'adresse. */
function lienExplorateur(label: string | null, tx: string | null): string | null {
  if (!tx) return null;
  const l = (label ?? '').toLowerCase();
  if (/trc|tron|trx/.test(l)) return `https://tronscan.org/#/transaction/${tx}`;
  if (/bep|bsc|bnb/.test(l)) return `https://bscscan.com/tx/${tx}`;
  if (/polygon|matic/.test(l)) return `https://polygonscan.com/tx/${tx}`;
  if (/erc|eth/.test(l)) return `https://etherscan.io/tx/${tx}`;
  if (/sol/.test(l)) return `https://solscan.io/tx/${tx}`;
  if (/ton/.test(l)) return `https://tonviewer.com/transaction/${tx}`;
  if (/ltc|litecoin/.test(l)) return `https://blockchair.com/litecoin/transaction/${tx}`;
  if (/btc|bitcoin/.test(l)) return `https://mempool.space/tx/${tx}`;
  return null;
}

/* ------------------------------------------------------------------ Adresses de paiement */
function Portefeuilles({ initial, onSaved }: { initial: Portefeuille[]; onSaved: () => void }) {
  const [liste, setListe] = useState<Portefeuille[]>(initial.length ? initial : []);
  const [msg, setMsg] = useState<AlertMsg | null>(null);
  const [busy, setBusy] = useState(false);
  const maj = (i: number, k: keyof Portefeuille, v: string) => setListe((l) => l.map((w, j) => (j === i ? { ...w, [k]: v } : w)));
  async function enregistrer() {
    setBusy(true); setMsg(null);
    try {
      const r = await api<{ portefeuilles: Portefeuille[] }>('payments?action=portefeuilles', { method: 'POST', role: 'admin', body: { wallets: liste } });
      setListe(r.portefeuilles); rechargerTarif(); onSaved();
      setMsg({ kind: 'success', text: r.portefeuilles.length ? 'Adresses enregistrées : le paiement manuel est proposé aux visiteurs.' : 'Aucune adresse : le paiement manuel est désactivé.' });
    } catch (e) { setMsg({ kind: 'error', text: e instanceof Error ? e.message : 'Erreur.' }); }
    finally { setBusy(false); }
  }
  return (
    <Card title="Mes adresses de paiement (paiement manuel)">
      <p className="text-[14px] text-ink/65">Les visiteurs peuvent envoyer la crypto directement à ces adresses, puis vous validez ici. Indiquez toujours la crypto <strong>et</strong> le réseau.</p>
      <div className="mt-4 space-y-3">
        <AnimatePresence initial={false}>
          {liste.map((w, i) => (
            <motion.div key={w.id || i} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
              className="grid gap-3 rounded-2xl bg-surface/60 p-4 sm:grid-cols-[200px_1fr_auto] sm:items-end">
              <Field label="Crypto · réseau" value={w.label} onChange={(e) => maj(i, 'label', e.target.value)} placeholder="USDT · TRC20" maxLength={40} />
              <Field label="Adresse du portefeuille" value={w.adresse} onChange={(e) => maj(i, 'adresse', e.target.value)} placeholder="TXy…" maxLength={130} />
              <button type="button" onClick={() => setListe((l) => l.filter((_, j) => j !== i))} aria-label="Retirer cette adresse"
                className="grid h-11 w-11 place-items-center rounded-xl text-ink/60 ring-1 ring-ligne hover:bg-fond hover:text-erreur"><Trash2 className="h-4 w-4" /></button>
              <Field label="Note pour le visiteur (facultatif)" value={w.note ?? ''} onChange={(e) => maj(i, 'note', e.target.value)} placeholder="Ex. Frais de réseau à votre charge" maxLength={160} className="sm:col-span-3" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {liste.length < 8 && <Button variant="secondary" icon={<Plus className="h-4 w-4" />} onClick={() => setListe((l) => [...l, { id: '', label: '', adresse: '' }])}>Ajouter une adresse</Button>}
        <Button icon={<Save className="h-4 w-4" />} loading={busy} onClick={enregistrer}>Enregistrer</Button>
      </div>
      <div className="mt-3"><Alert msg={msg} /></div>
    </Card>
  );
}

/* ------------------------------------------------------------------ Une ligne de paiement */
function Ligne({ p, onDecide }: { p: Paiement; onDecide?: (p: Paiement, action: 'valider' | 'refuser') => Promise<void> }) {
  const st = STATUTS_PAIEMENT[p.status] ?? { label: p.status, tone: 'neutre' as const };
  const lien = lienExplorateur(p.wallet_label ?? p.pay_currency, p.tx_hash);
  const [busy, setBusy] = useState<'valider' | 'refuser' | null>(null);
  const agir = async (a: 'valider' | 'refuser') => { setBusy(a); try { await onDecide?.(p, a); } finally { setBusy(null); } };
  return (
    <li className="flex flex-col gap-3 py-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${p.provider === 'manuel' ? 'bg-secondary text-white' : 'bg-primary text-on-primary'}`}>
          {p.provider === 'manuel' ? <Wallet className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
        </span>
        <div className="min-w-0">
          <p className="truncate text-[14px] font-semibold">{p.users ? `${p.users.prenom} ${p.users.nom}` : 'Compte supprimé'} <span className="font-normal text-ink/55">· {p.users?.email}</span></p>
          <p className="text-mini text-ink/55">
            {formatDate(p.created_at)} ({depuis(p.created_at)}) · {Number(p.price_amount)} {p.price_currency.toUpperCase()} · {p.provider === 'manuel' ? `envoi direct${p.wallet_label ? ` en ${p.wallet_label}` : ''}` : 'automatique'}
            {p.pay_currency ? ` · payé en ${p.pay_currency.toUpperCase()}${p.pay_amount ? ` (${Number(p.pay_amount)})` : ''}` : ''}
          </p>
          {p.tx_hash && (
            <p className="mt-1 flex flex-wrap items-center gap-2 text-mini">
              <code className="max-w-[16rem] truncate rounded bg-surface px-1.5 py-0.5 sm:max-w-md">{p.tx_hash}</code>
              {lien && <a href={lien} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-primary hover:underline">Vérifier sur la blockchain <ExternalLink className="h-3 w-3" /></a>}
            </p>
          )}
          {p.reviewed_by && <p className="mt-1 text-mini text-ink/50">{p.status === 'refuse' ? 'Refusé' : 'Validé'} par {p.reviewed_by}{p.admin_note ? ` · « ${p.admin_note} »` : ''}</p>}
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        {p.status === 'a_valider' && onDecide ? (
          <>
            <Button size="sm" icon={<Check className="h-3.5 w-3.5" />} loading={busy === 'valider'} onClick={() => agir('valider')}>Valider · donner l’accès</Button>
            <Button size="sm" variant="secondary" icon={<X className="h-3.5 w-3.5" />} loading={busy === 'refuser'} onClick={() => agir('refuser')}>Refuser</Button>
          </>
        ) : (
          <>
            {p.credited && <Badge tone="actif">Accès donné</Badge>}
            <Badge tone={st.tone}>{st.label}</Badge>
            {p.status === 'echoue' && <XCircle className="h-4 w-4 text-erreur" />}
          </>
        )}
      </div>
    </li>
  );
}

/** Paiements : automatiques (NOWPayments) et manuels (à valider par l'administration). */
export function PaymentsAdmin({ onChange }: { onChange?: () => void }) {
  const { data, setData, error, loading, reload } = useData<Donnees>('payments', 'admin');
  const [onglet, setOnglet] = useState<'a_valider' | 'tous' | 'adresses'>('a_valider');
  const [flash, setFlash] = useState<AlertMsg | null>(null);
  if (error) return <LoadError message={error} onRetry={reload} />;
  if (loading && !data) return <Skeleton className="h-96" />;
  const items = data?.payments ?? [];
  const c = data?.config;
  const payes = items.filter((p) => p.status === 'paye');
  const aValider = items.filter((p) => p.status === 'a_valider');
  const total = payes.reduce((n, p) => n + Number(p.price_amount), 0);
  const devise = (c?.devise ?? 'usd').toUpperCase();

  async function decider(p: Paiement, action: 'valider' | 'refuser') {
    setFlash(null);
    try {
      const r = await api<{ message: string }>(`payments?action=${action}&id=${p.id}`, { method: 'POST', role: 'admin', body: {} });
      setFlash({ kind: 'success', text: `${p.users ? `${p.users.prenom} ${p.users.nom} : ` : ''}${r.message}` });
      if (data) setData({ ...data, payments: items.map((x) => (x.id === p.id ? { ...x, status: action === 'valider' ? 'paye' : 'refuse', credited: action === 'valider' } : x)) });
      onChange?.();
      setTimeout(reload, 400);
    } catch (e) { setFlash({ kind: 'error', text: e instanceof Error ? e.message : 'Erreur.' }); }
  }

  return (
    <div className="space-y-6">
      <PageHeader titre="Paiements crypto" texte="Paiement automatique : l’accès s’ouvre tout seul. Envoi direct : vérifiez la transaction, puis cliquez « Valider » pour donner l’accès d’un mois." />
      {c && !c.actif && !data?.portefeuilles.length && (
        <div className="rounded-2xl bg-accent/15 px-4 py-3 text-[14px] ring-1 ring-accent/40">
          <strong>Aucun moyen de paiement actif.</strong> Ajoutez vos adresses dans l’onglet « Mes adresses » (paiement manuel) et/ou les variables <code>NOWPAYMENTS_API_KEY</code> et <code>NOWPAYMENTS_IPN_SECRET</code> dans Vercel (paiement automatique).
        </div>
      )}
      <StatGrid cols="sm:grid-cols-4" stats={[
        { label: 'À valider', value: aValider.length, icon: Clock, onClick: () => setOnglet('a_valider') },
        { label: 'Paiements confirmés', value: payes.length, icon: CheckCircle2, onClick: () => setOnglet('tous') },
        { label: `Total reçu (${devise})`, value: Math.round(total * 100) / 100, icon: Bitcoin },
        { label: `Prix d’un mois (${devise})`, value: c?.prix, icon: Bitcoin },
      ]} />
      <Tabs id="paiements" value={onglet} onChange={setOnglet} options={[
        { value: 'a_valider', label: `À valider${aValider.length ? ` (${aValider.length})` : ''}` },
        { value: 'tous', label: 'Historique' },
        { value: 'adresses', label: 'Mes adresses' },
      ]} />
      <Alert msg={flash} />
      {onglet === 'adresses' ? (
        <Portefeuilles initial={data?.portefeuilles ?? []} onSaved={reload} />
      ) : (
        <Card title={onglet === 'a_valider' ? 'Paiements à vérifier et valider' : `Historique (${items.length})`}>
          {(onglet === 'a_valider' ? aValider : items).length === 0 ? (
            <p className="text-[14px] text-ink/55">{onglet === 'a_valider' ? 'Aucun paiement en attente de validation.' : 'Aucun paiement pour le moment.'}</p>
          ) : (
            <ul className="divide-y divide-ligne">
              {(onglet === 'a_valider' ? aValider : items).map((p) => <Ligne key={p.id} p={p} onDecide={decider} />)}
            </ul>
          )}
        </Card>
      )}
    </div>
  );
}
