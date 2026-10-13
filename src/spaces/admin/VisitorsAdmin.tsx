import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CalendarPlus, Mail, Phone, Power, Settings2, Trash2, Users, Zap } from 'lucide-react';
import { api } from '@/lib/api';
import type { Abonnement } from '@/lib/session';
import { depuis, formatDate, formatDateCourte } from '@/lib/format';
import { normalize } from '@/lib/normalize';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Alert, type AlertMsg } from '@/components/ui/Alert';
import { ConfirmDialog, Modal } from '@/components/ui/Modal';
import { EmptyState, Skeleton } from '@/components/ui/Empty';
import { PageHeader } from '@/dashboard/Shell';
import { Card, LoadError, SearchInput, Tabs } from '@/dashboard/Widgets';
import { useData } from '@/dashboard/useData';
import { StatutAboBadge, SubscriptionPanel, libelleAction, type StatutAbo } from './common';

export interface Visiteur {
  id: string; nom: string; prenom: string; email: string; telephone: string | null; is_active: boolean;
  created_at: string; last_login_at: string | null; abonnement: Abonnement;
}
type Filtre = 'tous' | 'actifs' | 'inactifs' | 'abo_actif' | 'abo_expire' | 'sans_abo';

/* ------------------------------------------------------------------ Fiche visiteur */
function FicheVisiteur({ v, types, onClose, onChange, onDelete }: {
  v: Visiteur; types: readonly string[]; onClose: () => void; onChange: (v: Visiteur) => void; onDelete: (v: Visiteur) => void;
}) {
  const [onglet, setOnglet] = useState<'abonnement' | 'compte' | 'historique'>('abonnement');
  const detail = useData<{ historique: { id: string; type: string; duration_months: number; start_date: string; end_date: string; statut_reel: StatutAbo; activated_by: string | null }[]; activites: { id: number; action: string; target_title: string | null; created_at: string }[] }>(`users?id=${v.id}`, 'admin');
  const [f, setF] = useState({ nom: v.nom, prenom: v.prenom, email: v.email, telephone: v.telephone ?? '' });
  const [msg, setMsg] = useState<AlertMsg | null>(null);
  const [busy, setBusy] = useState(false);

  async function majCompte(body: Record<string, unknown>, ok: string) {
    setBusy(true); setMsg(null);
    try {
      const r = await api<{ user: Omit<Visiteur, 'abonnement'> }>(`users?id=${v.id}`, { method: 'PATCH', role: 'admin', body });
      onChange({ ...v, ...r.user }); setMsg({ kind: 'success', text: ok });
    } catch (e) { setMsg({ kind: 'error', text: e instanceof Error ? e.message : 'Erreur.' }); }
    finally { setBusy(false); }
  }

  return (
    <Modal open onClose={onClose} title={`${v.prenom} ${v.nom}`} wide>
      <div className="space-y-5">
        <div className="flex flex-wrap gap-x-5 gap-y-1 text-[13.5px] text-ink/65">
          <span className="inline-flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{v.email}</span>
          {v.telephone && <a href={`tel:${v.telephone}`} className="inline-flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{v.telephone}</a>}
          <span>Inscrit le {formatDate(v.created_at)}</span>
          <span>Dernière connexion : {v.last_login_at ? depuis(v.last_login_at) : 'jamais'}</span>
          <Badge tone={v.is_active ? 'actif' : 'rejet'}>{v.is_active ? 'Compte actif' : 'Compte désactivé'}</Badge>
        </div>
        <Tabs id={`fv-${v.id}`} value={onglet} onChange={setOnglet} options={[{ value: 'abonnement', label: 'Abonnement' }, { value: 'compte', label: 'Compte' }, { value: 'historique', label: 'Historique' }]} />

        {onglet === 'abonnement' && (
          <SubscriptionPanel userId={v.id} abonnement={v.abonnement} types={types} onChange={(a) => { onChange({ ...v, abonnement: a }); detail.reload(); }} />
        )}

        {onglet === 'compte' && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Nom" value={f.nom} onChange={(e) => setF({ ...f, nom: e.target.value })} maxLength={60} />
              <Field label="Prénom" value={f.prenom} onChange={(e) => setF({ ...f, prenom: e.target.value })} maxLength={60} />
              <Field label="Email" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} maxLength={160} />
              <Field label="Téléphone" type="tel" value={f.telephone} onChange={(e) => setF({ ...f, telephone: e.target.value })} maxLength={30} />
            </div>
            <Alert msg={msg} />
            <div className="flex flex-wrap gap-2">
              <Button loading={busy} onClick={() => majCompte(f, 'Informations enregistrées.')}>Enregistrer</Button>
              <Button variant={v.is_active ? 'secondary' : 'primary'} loading={busy} icon={<Power className="h-4 w-4" />}
                onClick={() => majCompte({ is_active: !v.is_active }, v.is_active ? 'Compte désactivé : la personne est déconnectée.' : 'Compte réactivé.')}>
                {v.is_active ? 'Désactiver le compte' : 'Activer le compte'}
              </Button>
              <Button variant="ghost" icon={<Trash2 className="h-4 w-4" />} onClick={() => onDelete(v)}>Supprimer</Button>
            </div>
          </div>
        )}

        {onglet === 'historique' && (
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <p className="mb-2 text-[13px] font-bold text-ink/60">Abonnements</p>
              {!detail.data?.historique.length ? <p className="text-[14px] text-ink/55">Aucun.</p> : (
                <ul className="space-y-2">
                  {detail.data.historique.map((h) => (
                    <li key={h.id} className="rounded-xl bg-surface p-3 text-[13px]">
                      <div className="flex items-center justify-between gap-2"><strong>{h.type} · {h.duration_months} mois</strong><StatutAboBadge s={h.statut_reel} /></div>
                      <p className="text-ink/60">{formatDateCourte(h.start_date)} → {formatDateCourte(h.end_date)}{h.activated_by ? ` · par ${h.activated_by}` : ''}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <p className="mb-2 text-[13px] font-bold text-ink/60">Activité</p>
              {!detail.data?.activites.length ? <p className="text-[14px] text-ink/55">Aucune activité.</p> : (
                <ul className="space-y-2 text-[13px]">
                  {detail.data.activites.map((a) => (
                    <li key={a.id} className="flex justify-between gap-3 border-b border-ligne pb-2"><span>{libelleAction(a.action)}{a.target_title ? ` « ${a.target_title} »` : ''}</span><span className="shrink-0 text-ink/50">{depuis(a.created_at)}</span></li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ Liste */
export function VisitorsAdmin({ onChange }: { onChange: () => void }) {
  const { data, setData, error, loading, reload } = useData<{ users: Visiteur[]; types: string[] }>('users', 'admin');
  const [filtre, setFiltre] = useState<Filtre>('tous');
  const [q, setQ] = useState('');
  const [ouvert, setOuvert] = useState<Visiteur | null>(null);
  const [suppr, setSuppr] = useState<Visiteur | null>(null);
  const [flash, setFlash] = useState<AlertMsg | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const users = data?.users ?? [];
  const n = (f: Filtre) => users.filter((u) => match(u, f)).length;
  function match(u: Visiteur, f: Filtre) {
    switch (f) {
      case 'actifs': return u.is_active;
      case 'inactifs': return !u.is_active;
      case 'abo_actif': return u.abonnement.statut === 'actif';
      case 'abo_expire': return u.abonnement.statut === 'expire';
      case 'sans_abo': return u.abonnement.statut === 'aucun';
      default: return true;
    }
  }
  const liste = useMemo(() => {
    const nq = normalize(q);
    return users.filter((u) => match(u, filtre) && (!nq || normalize(`${u.nom} ${u.prenom} ${u.email} ${u.telephone ?? ''}`).includes(nq)));
  }, [users, filtre, q]);

  const remplacer = (v: Visiteur) => { setData({ ...data!, users: users.map((u) => (u.id === v.id ? v : u)) }); setOuvert((o) => (o?.id === v.id ? v : o)); onChange(); };

  async function rapide(u: Visiteur) {
    setBusyId(u.id); setFlash(null);
    try {
      const actif = u.abonnement.statut === 'actif';
      const r = actif
        ? await api<{ abonnement: Abonnement }>(`subscriptions?id=${u.abonnement.id}`, { method: 'PATCH', role: 'admin', body: { action: 'prolonger', duration_months: 1 } })
        : await api<{ abonnement: Abonnement }>('subscriptions', { method: 'POST', role: 'admin', body: { user_id: u.id, type: 'Mensuel', duration_months: 1 } });
      remplacer({ ...u, abonnement: r.abonnement });
      setFlash({ kind: 'success', text: `${u.prenom} ${u.nom} : Premium ${actif ? 'prolongé' : 'activé'} jusqu’au ${formatDate(r.abonnement.date_expiration)}.` });
    } catch (e) { setFlash({ kind: 'error', text: e instanceof Error ? e.message : 'Erreur.' }); }
    finally { setBusyId(null); }
  }

  async function supprimer() {
    if (!suppr) return;
    try {
      await api(`users?id=${suppr.id}`, { method: 'DELETE', role: 'admin' });
      setData({ ...data!, users: users.filter((u) => u.id !== suppr.id) });
      setOuvert(null); setFlash({ kind: 'success', text: 'Compte supprimé.' }); onChange();
    } catch (e) { setFlash({ kind: 'error', text: e instanceof Error ? e.message : 'Erreur.' }); }
    finally { setSuppr(null); }
  }

  const BoutonRapide = ({ u }: { u: Visiteur }) => (
    <Button size="sm" className="whitespace-nowrap" variant={u.abonnement.statut === 'actif' ? 'secondary' : 'primary'} loading={busyId === u.id}
      icon={u.abonnement.statut === 'actif' ? <CalendarPlus className="h-3.5 w-3.5" /> : <Zap className="h-3.5 w-3.5" />} onClick={() => rapide(u)}>
      {u.abonnement.statut === 'actif' ? '+1 mois' : 'Activer 1 mois'}
    </Button>
  );

  return (
    <div>
      <PageHeader titre="Visiteurs" texte="Comptes inscrits, statut et abonnement. Activez l’accès Premium après confirmation du paiement sur WhatsApp." />
      <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <Tabs id="filtre-visiteurs" value={filtre} onChange={setFiltre} options={[
          { value: 'tous', label: 'Tous', badge: n('tous') || undefined }, { value: 'actifs', label: 'Actifs' }, { value: 'inactifs', label: 'Inactifs', badge: n('inactifs') || undefined },
          { value: 'abo_actif', label: 'Abonnement actif', badge: n('abo_actif') || undefined }, { value: 'abo_expire', label: 'Abonnement expiré', badge: n('abo_expire') || undefined },
          { value: 'sans_abo', label: 'Sans abonnement' },
        ]} />
        <SearchInput value={q} onChange={setQ} placeholder="Nom, email, téléphone…" />
      </div>
      <div className="mb-4"><Alert msg={flash} /></div>

      {error ? <LoadError message={error} onRetry={reload} /> : loading && !data ? <Skeleton className="h-72" /> : liste.length === 0 ? (
        <EmptyState icon={<Users className="h-6 w-6" />} title="Aucun visiteur" text={users.length ? 'Modifiez les filtres ou la recherche.' : 'Les comptes créés sur le site apparaîtront ici.'} />
      ) : (
        <>
          {/* Tableau (grand écran) */}
          <Card className="hidden overflow-hidden !p-0 2xl:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead className="border-b border-ligne text-mini uppercase tracking-wide text-ink/50">
                  <tr>{['Nom', 'Prénom', 'Email', 'Téléphone', 'Inscription', 'Compte', 'Type', 'Début', 'Expiration', 'Abonnement', ''].map((h) => <th key={h} className="whitespace-nowrap px-2.5 py-3 font-bold first:pl-4">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {liste.map((u) => (
                    <tr key={u.id} className="border-b border-ligne/70 transition hover:bg-surface/60">
                      <td className="py-3 pl-4 pr-2.5 font-semibold">{u.nom}</td>
                      <td className="px-2.5 py-3">{u.prenom}</td>
                      <td className="max-w-[170px] truncate px-2.5 py-3 text-ink/70">{u.email}</td>
                      <td className="whitespace-nowrap px-2.5 py-3 text-ink/70">{u.telephone ?? '—'}</td>
                      <td className="whitespace-nowrap px-2.5 py-3 text-ink/70">{formatDateCourte(u.created_at)}</td>
                      <td className="px-2.5 py-3"><Badge tone={u.is_active ? 'actif' : 'rejet'}>{u.is_active ? 'Actif' : 'Inactif'}</Badge></td>
                      <td className="whitespace-nowrap px-2.5 py-3">{u.abonnement.type ?? '—'}</td>
                      <td className="whitespace-nowrap px-2.5 py-3 text-ink/70">{formatDateCourte(u.abonnement.date_debut)}</td>
                      <td className="whitespace-nowrap px-2.5 py-3 font-semibold">{formatDateCourte(u.abonnement.date_expiration)}</td>
                      <td className="px-2.5 py-3"><StatutAboBadge s={u.abonnement.statut} /></td>
                      <td className="px-2.5 py-3">
                        <div className="flex justify-end gap-1.5">
                          <BoutonRapide u={u} />
                          <Button size="sm" variant="ghost" className="!px-2.5" icon={<Settings2 className="h-3.5 w-3.5" />} onClick={() => setOuvert(u)} aria-label={`Gérer ${u.prenom} ${u.nom}`} title="Gérer : activer, modifier, prolonger, voir le compte">{''}</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Cartes (mobile / tablette) */}
          <motion.ul layout className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:hidden">
            <AnimatePresence initial={false}>
              {liste.map((u) => (
                <motion.li key={u.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="rounded-3xl bg-fond p-4 shadow-doux ring-1 ring-ligne">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-bold">{u.prenom} {u.nom}</p>
                      <p className="truncate text-[13px] text-ink/60">{u.email}</p>
                      {u.telephone && <p className="text-[13px] text-ink/60">{u.telephone}</p>}
                    </div>
                    <StatutAboBadge s={u.abonnement.statut} />
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-[12.5px]">
                    <dt className="text-ink/50">Inscription</dt><dd>{formatDateCourte(u.created_at)}</dd>
                    <dt className="text-ink/50">Compte</dt><dd>{u.is_active ? 'Actif' : 'Inactif'}</dd>
                    <dt className="text-ink/50">Type</dt><dd>{u.abonnement.type ?? '—'}</dd>
                    <dt className="text-ink/50">Expiration</dt><dd className="font-semibold">{formatDateCourte(u.abonnement.date_expiration)}</dd>
                  </dl>
                  <div className="mt-4 flex gap-2">
                    <BoutonRapide u={u} />
                    <Button size="sm" variant="secondary" icon={<Settings2 className="h-3.5 w-3.5" />} onClick={() => setOuvert(u)}>Gérer</Button>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        </>
      )}
      {ouvert && <FicheVisiteur v={ouvert} types={data?.types ?? []} onClose={() => setOuvert(null)} onChange={remplacer} onDelete={setSuppr} />}
      <ConfirmDialog open={!!suppr} onClose={() => setSuppr(null)} onConfirm={supprimer} danger title="Supprimer ce compte ?" confirmLabel="Supprimer"
        message={<>Le compte de <strong>{suppr?.prenom} {suppr?.nom}</strong>, ses abonnements et ses demandes de prière seront supprimés définitivement.</>} />
    </div>
  );
}
