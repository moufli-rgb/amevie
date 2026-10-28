import { useEffect, useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Check, CheckCircle2, Copy, Loader2, Send, ShieldCheck, Wallet, Zap } from 'lucide-react';
import QRCode from 'qrcode';
import { api } from '@/lib/api';
import { go } from '@/lib/router';
import { Modal } from './ui/Modal';
import { Field } from './ui/Field';
import { Button } from './ui/Button';
import { Alert, type AlertMsg } from './ui/Alert';
import { prixAffiche, type Tarif } from './Premium';

type Etape = 'choix' | 'manuel' | 'envoye' | 'aucun';

/** QR code de l'adresse (généré dans le navigateur, aucune requête externe). */
function QR({ texte }: { texte: string }) {
  const [src, setSrc] = useState('');
  useEffect(() => {
    QRCode.toDataURL(texte, { margin: 1, width: 360, errorCorrectionLevel: 'M' }).then(setSrc).catch(() => setSrc(''));
  }, [texte]);
  return src
    ? <img src={src} alt="QR code de l’adresse" className="h-40 w-40 rounded-2xl bg-white p-2 ring-1 ring-ligne" />
    : <div className="h-40 w-40 animate-pulse rounded-2xl bg-surface" />;
}

function BoutonCopier({ texte }: { texte: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button type="button" onClick={async () => { try { await navigator.clipboard.writeText(texte); setOk(true); setTimeout(() => setOk(false), 1800); } catch { /* ignoré */ } }}
      className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-ink px-3 text-[12.5px] font-semibold text-fond hover:opacity-90">
      {ok ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {ok ? 'Copiée' : 'Copier'}
    </button>
  );
}

/** Fenêtre de paiement : automatique (NOWPayments) ou envoi direct validé par l'administration. */
export default function PaiementModal({ tarif, onClose }: { tarif: Tarif | null; onClose: () => void }) {
  const auto = !!tarif?.auto;
  const manuel = tarif?.manuel.actif ? tarif.manuel.portefeuilles : [];
  const [etape, setEtape] = useState<Etape>(() => (auto ? 'choix' : manuel.length ? 'manuel' : 'aucun'));
  const [wid, setWid] = useState(manuel[0]?.id ?? '');
  const [tx, setTx] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<AlertMsg | null>(null);
  const w = manuel.find((x) => x.id === wid) ?? manuel[0];
  const prix = prixAffiche(tarif);

  useEffect(() => { if (tarif && etape === 'aucun' && (auto || manuel.length)) setEtape(auto ? 'choix' : 'manuel'); }, [tarif]); // eslint-disable-line react-hooks/exhaustive-deps

  async function payerAuto() {
    setBusy(true); setMsg(null);
    try {
      const r = await api<{ url: string }>('payments?action=creer', { method: 'POST', role: 'visiteur' });
      window.location.href = r.url;
    } catch (e) { setMsg({ kind: 'error', text: e instanceof Error ? e.message : 'Paiement impossible.' }); setBusy(false); }
  }

  async function declarer(e: FormEvent) {
    e.preventDefault();
    if (!w) return;
    setBusy(true); setMsg(null);
    try {
      await api('payments?action=manuel', { method: 'POST', role: 'visiteur', body: { wallet_id: w.id, tx_hash: tx.trim() } });
      setEtape('envoye');
    } catch (err) { setMsg({ kind: 'error', text: err instanceof Error ? err.message : 'Erreur.' }); }
    finally { setBusy(false); }
  }

  return (
    <Modal open onClose={onClose} title="Payer mon abonnement" wide>
      {!tarif ? (
        <div className="grid place-items-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : etape === 'aucun' ? (
        <p className="py-6 text-center text-[15px] text-ink/70">Le paiement en ligne n’est pas encore ouvert. Revenez dans quelques jours ou contactez l’administration.</p>
      ) : etape === 'choix' ? (
        <div className="space-y-4">
          <p className="text-[14.5px] text-ink/70">Abonnement Premium · 1 mois{prix ? <> · <strong className="text-ink">{prix}</strong></> : ''}. Choisissez comment payer :</p>
          <motion.button type="button" whileHover={{ y: -2 }} onClick={payerAuto} disabled={busy}
            className="flex w-full items-start gap-4 rounded-2xl bg-fond p-5 text-left ring-2 ring-primary/50 transition hover:ring-primary">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary text-on-primary">{busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Zap className="h-5 w-5" />}</span>
            <span>
              <span className="flex flex-wrap items-center gap-2 text-[16px] font-bold">Paiement automatique <span className="rounded-full bg-accent/20 px-2 py-0.5 text-mini font-bold">Recommandé</span></span>
              <span className="mt-1 block text-[14px] text-ink/65">Choisissez parmi plus de 300 cryptomonnaies. Le montant est calculé pour vous et votre accès s’ouvre tout seul en quelques minutes.</span>
            </span>
          </motion.button>
          {manuel.length > 0 && (
            <motion.button type="button" whileHover={{ y: -2 }} onClick={() => setEtape('manuel')}
              className="flex w-full items-start gap-4 rounded-2xl bg-fond p-5 text-left ring-1 ring-ligne transition hover:ring-primary/50">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-secondary text-white"><Wallet className="h-5 w-5" /></span>
              <span>
                <span className="block text-[16px] font-bold">Envoyer moi-même</span>
                <span className="mt-1 block text-[14px] text-ink/65">Envoyez la crypto à l’adresse de l’administration ({manuel.map((x) => x.label).join(', ')}), puis collez le numéro de transaction. Accès ouvert après vérification.</span>
              </span>
            </motion.button>
          )}
          <Alert msg={msg} />
          <p className="flex items-center gap-2 text-mini text-ink/50"><ShieldCheck className="h-4 w-4" /> Aucune donnée bancaire demandée.</p>
        </div>
      ) : etape === 'manuel' && w ? (
        <form onSubmit={declarer} className="space-y-5">
          {auto && <button type="button" onClick={() => setEtape('choix')} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink/60 hover:text-primary"><ArrowLeft className="h-4 w-4" /> Autres moyens</button>}
          {manuel.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {manuel.map((x) => (
                <button key={x.id} type="button" onClick={() => setWid(x.id)}
                  className={`rounded-full px-3.5 py-2 text-[13px] font-semibold ring-1 transition ${x.id === w.id ? 'bg-primary text-on-primary ring-primary' : 'bg-fond ring-ligne hover:ring-primary/50'}`}>{x.label}</button>
              ))}
            </div>
          )}
          <div className="flex flex-col items-center gap-5 rounded-2xl bg-surface/70 p-5 sm:flex-row sm:items-start">
            <QR texte={w.adresse} />
            <div className="min-w-0 flex-1 space-y-3">
              <p className="text-[14px]"><span className="font-semibold">1.</span> Envoyez l’équivalent de <strong>{prix || 'le prix de l’abonnement'}</strong> en <strong>{w.label}</strong> à cette adresse :</p>
              <div className="flex items-center gap-2 rounded-xl bg-fond p-2 pl-3 ring-1 ring-ligne">
                <code className="min-w-0 flex-1 break-all text-[12.5px]">{w.adresse}</code>
                <BoutonCopier texte={w.adresse} />
              </div>
              {w.note && <p className="text-mini text-ink/60">{w.note}</p>}
              <p className="text-mini font-semibold text-erreur">Vérifiez bien le réseau ({w.label}) : un envoi sur un autre réseau peut être perdu.</p>
            </div>
          </div>
          <Field label="2. Numéro de la transaction (TXID / hash)" value={tx} onChange={(e) => setTx(e.target.value)} required minLength={8} maxLength={200}
            placeholder="Ex. 0x5f2c… ou 9a1b…" hint="Vous le trouvez dans votre portefeuille ou votre plateforme d’échange, dans le détail de l’envoi." />
          <Alert msg={msg} />
          <Button type="submit" loading={busy} icon={<Send className="h-4 w-4" />} className="w-full">J’ai payé : envoyer pour vérification</Button>
        </form>
      ) : (
        <div className="py-4 text-center">
          <motion.span initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 14 }}
            className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[color-mix(in_oklab,var(--couleur-succes)_15%,var(--couleur-fond))] text-succes"><CheckCircle2 className="h-8 w-8" /></motion.span>
          <h3 className="mt-4 text-2xl">Merci !</h3>
          <p className="mx-auto mt-2 max-w-md text-[14.5px] text-ink/70">Votre paiement est enregistré. L’administration vérifie la transaction et active votre accès Premium dès validation. Vous pouvez suivre l’état dans « Mon abonnement ».</p>
          <Button className="mt-6" onClick={() => { onClose(); go('espace', 'abonnement'); }}>Voir mon abonnement</Button>
        </div>
      )}
    </Modal>
  );
}
