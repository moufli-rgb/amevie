import { useEffect, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  BookMarked, BookOpen, CreditCard, FileText, HandHeart, Library, LayoutDashboard, Bitcoin, PartyPopper, Send, Settings, Trash2,
} from 'lucide-react';
import { api } from '@/lib/api';
import { go, hrefOf } from '@/lib/router';
import { useVisitor } from '@/lib/visitor';
import type { SessionUser } from '@/lib/session';
import { formatDate, depuis } from '@/lib/format';
import { SITE } from '@/config/site';
import type { Contenu } from '@/lib/contenus';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ContentCard } from '@/components/ContentCard';
import { LibraryView } from '@/components/LibraryView';
import { CryptosAcceptees, Paywall, PayButton, prixAffiche, useTarif } from '@/components/Premium';
import { STATUTS_PAIEMENT } from '@/lib/paiements';
import { SubscriptionStatus } from '@/components/SubscriptionStatus';
import { Field, TextArea } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { Alert, type AlertMsg } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { EmptyState, Skeleton } from '@/components/ui/Empty';
import { ConfirmDialog } from '@/components/ui/Modal';
import { PageHeader, Shell, type NavSection, type QuickAction } from '@/dashboard/Shell';
import { useData } from '@/dashboard/useData';
import { Card, LoadError, WelcomeBanner } from '@/dashboard/Widgets';
import { PasswordCard, ProfileHeader, SimpleFieldsCard } from '@/dashboard/ProfileForms';
import { LoginPage } from '@/pages/VisitorAuthPages';

/* ---------------------------------------------------------------- Accueil */
function Accueil({ user }: { user: SessionUser }) {
  const { data, loading } = useData<{ parole: { id: string; content: string; bible_ref: string } | null; derniers: Contenu[] }>(`contents?scope=accueil&u=${user.id}`, 'visiteur');
  const raccourcis = [
    { label: 'Paroles de Dieu', icon: BookOpen, href: hrefOf('bibliotheque', 'parole') },
    { label: 'Documents', icon: FileText, href: hrefOf('bibliotheque', 'document') },
    { label: 'Demander une prière', icon: HandHeart, href: hrefOf('espace', 'prieres') },
    { label: 'Ma bibliothèque', icon: BookMarked, href: hrefOf('espace', 'favoris') },
  ];
  return (
    <div className="space-y-6">
      <WelcomeBanner photo="bible_mains" surtitre="Mon espace" titre={<>Bonjour, {user.prenom ?? user.name}</>}
        texte={data?.parole ? <>« {data.parole.content.slice(0, 160)}{data.parole.content.length > 160 ? '…' : ''} » — <strong>{data.parole.bible_ref}</strong></> : SITE.slogan} />
      <SubscriptionStatus a={user.abonnement} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {raccourcis.map((r, i) => (
          <motion.a key={r.label} href={r.href} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} whileHover={{ y: -3 }}
            className="flex flex-col gap-3 rounded-3xl bg-fond p-4 shadow-doux ring-1 ring-ligne sm:p-5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary"><r.icon className="h-[18px] w-[18px]" /></span>
            <span className="text-[14px] font-semibold">{r.label}</span>
          </motion.a>
        ))}
      </div>
      <Card title="Nouveautés" action={<a className="text-[13px] font-bold text-primary" href={hrefOf('espace', 'contenus')}>Tout voir</a>}>
        {loading && !data ? <Skeleton className="h-40" /> : data?.derniers.length ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{data.derniers.slice(0, 3).map((c, i) => <ContentCard key={c.id} c={c} i={i} />)}</div>
        ) : <p className="text-[14px] text-ink/55">Aucune publication pour le moment.</p>}
      </Card>
    </div>
  );
}

/* ---------------------------------------------------------------- Favoris (Premium) */
function Favoris({ user }: { user: SessionUser }) {
  const premium = !!user.premium;
  const { data, error, loading, reload } = useData<{ contents: Contenu[] }>(premium ? 'favorites' : null, 'visiteur');
  return (
    <div>
      <PageHeader titre="Ma bibliothèque" texte="Vos contenus favoris, toujours sous la main." />
      {!premium ? (
        <Paywall texte={<>« Ma bibliothèque » est une fonctionnalité <strong>Premium</strong>. Faites votre abonnement pour enregistrer vos contenus favoris.</>} />
      ) : error ? <LoadError message={error} onRetry={reload} /> : loading && !data ? <Skeleton className="h-48" /> : !data?.contents.length ? (
        <EmptyState icon={<BookMarked className="h-6 w-6" />} title="Aucun favori" text="Ouvrez un contenu et cliquez sur « Ajouter aux favoris »."
          action={<a href={hrefOf('espace', 'contenus')} className="text-[14px] font-semibold text-primary">Parcourir les contenus →</a>} />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{data.contents.map((c, i) => <ContentCard key={c.id} c={c} i={i} />)}</div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- Prières (gratuit) */
interface Priere { id: string; subject: string; message: string; anonymous: boolean; status: 'nouvelle' | 'en_priere' | 'exaucee'; handled_by: string | null; created_at: string }
export const STATUT_PRIERE = {
  nouvelle: { label: 'Reçue', tone: 'neutre' as const },
  en_priere: { label: 'En prière', tone: 'attente' as const },
  exaucee: { label: 'Exaucée', tone: 'actif' as const },
};

function Prieres() {
  const { data, setData, error, loading, reload } = useData<{ prayers: Priere[] }>('prayers', 'visiteur');
  const [f, setF] = useState({ subject: '', message: '', anonymous: false });
  const [msg, setMsg] = useState<AlertMsg | null>(null);
  const [busy, setBusy] = useState(false);
  const [suppr, setSuppr] = useState<Priere | null>(null);

  async function envoyer(e: FormEvent) {
    e.preventDefault();
    if (f.subject.trim().length < 2 || f.message.trim().length < 2) return setMsg({ kind: 'error', text: 'Indiquez un sujet et votre message.' });
    setBusy(true); setMsg(null);
    try {
      const r = await api<{ prayer: Priere }>('prayers', { method: 'POST', role: 'visiteur', body: f });
      setData({ prayers: [r.prayer, ...(data?.prayers ?? [])] });
      setF({ subject: '', message: '', anonymous: false });
      setMsg({ kind: 'success', text: 'Votre demande a été transmise aux guides spirituels. Nous prions avec vous.' });
    } catch (err) { setMsg({ kind: 'error', text: err instanceof Error ? err.message : 'Erreur.' }); }
    finally { setBusy(false); }
  }
  async function supprimer() {
    if (!suppr) return;
    try { await api(`prayers?id=${suppr.id}`, { method: 'DELETE', role: 'visiteur' }); setData({ prayers: (data?.prayers ?? []).filter((p) => p.id !== suppr.id) }); }
    finally { setSuppr(null); }
  }

  return (
    <div className="space-y-6">
      <PageHeader titre="Demandes de prière" texte="Gratuit. Vos demandes sont lues par les guides spirituels de la plateforme." />
      <Card title="Nouvelle demande">
        <form onSubmit={envoyer} className="space-y-4">
          <Field label="Sujet" value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} maxLength={120} placeholder="Ex. Santé de ma mère" />
          <TextArea label="Votre message" value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} maxLength={2000} />
          <label className="flex items-center gap-3 text-[14px]">
            <input type="checkbox" checked={f.anonymous} onChange={(e) => setF({ ...f, anonymous: e.target.checked })} className="h-5 w-5 accent-[var(--couleur-principale)]" />
            Rester anonyme auprès des guides spirituels
          </label>
          <Alert msg={msg} />
          <Button type="submit" loading={busy} icon={<Send className="h-4 w-4" />}>Envoyer ma demande</Button>
        </form>
      </Card>
      <Card title="Mes demandes">
        {error ? <LoadError message={error} onRetry={reload} /> : loading && !data ? <Skeleton className="h-24" /> : !data?.prayers.length ? (
          <p className="text-[14px] text-ink/55">Aucune demande pour le moment.</p>
        ) : (
          <ul className="space-y-3">
            <AnimatePresence initial={false}>
              {data.prayers.map((p) => (
                <motion.li key={p.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-2xl bg-surface p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold">{p.subject}</p>
                      <p className="text-mini text-ink/50">{depuis(p.created_at)}{p.anonymous ? ' · anonyme' : ''}{p.handled_by ? ` · suivie par ${p.handled_by}` : ''}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge tone={STATUT_PRIERE[p.status].tone}>{STATUT_PRIERE[p.status].label}</Badge>
                      <button onClick={() => setSuppr(p)} className="grid h-8 w-8 place-items-center rounded-lg text-ink/45 hover:bg-fond" aria-label="Supprimer"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                  <p className="mt-2 whitespace-pre-line text-[14px] text-ink/75">{p.message}</p>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </Card>
      <ConfirmDialog open={!!suppr} onClose={() => setSuppr(null)} onConfirm={supprimer} danger title="Supprimer cette demande ?" confirmLabel="Supprimer" message="Elle ne sera plus visible par les guides spirituels." />
    </div>
  );
}

/* ---------------------------------------------------------------- Abonnement */
interface Historique { id: string; type: string; duration_months: number; start_date: string; end_date: string; statut_reel: 'actif' | 'expire' | 'desactive' }
interface PaiementVisiteur { id: string; price_amount: number; price_currency: string; pay_currency: string | null; status: string; credited: boolean; created_at: string }
function Abonnement({ user, merci }: { user: SessionUser; merci: boolean }) {
  const { data } = useData<{ historique: Historique[] }>('subscriptions?scope=me', 'visiteur');
  const paiements = useData<{ payments: PaiementVisiteur[] }>('payments', 'visiteur');
  const tarif = useTarif();
  // Après le paiement : on relit les paiements toutes les 15 s jusqu'à la confirmation
  const enAttente = merci && !user.premium;
  useEffect(() => {
    if (!enAttente) return;
    const t = window.setInterval(() => paiements.reload(), 15_000);
    return () => window.clearInterval(t);
  }, [enAttente]); // eslint-disable-line react-hooks/exhaustive-deps
  const ton = { actif: 'actif', expire: 'rejet', desactive: 'neutre' } as const;
  const lib = { actif: 'Actif', expire: 'Expiré', desactive: 'Désactivé' } as const;
  return (
    <div className="space-y-6">
      <PageHeader titre="Mon abonnement" texte={`Durée : ${SITE.dureeAbonnement}${prixAffiche(tarif) ? ` · ${prixAffiche(tarif)}` : ''}, payé en cryptomonnaie et activé automatiquement.`} />
      {merci && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-4 rounded-2xl bg-[color-mix(in_oklab,var(--couleur-succes)_12%,var(--couleur-fond))] p-5 ring-1 ring-[color-mix(in_oklab,var(--couleur-succes)_35%,transparent)]">
          <PartyPopper className="h-6 w-6 shrink-0 text-succes" />
          <div className="text-[14.5px]">
            <p className="font-semibold">{user.premium ? 'Merci ! Votre accès Premium est actif.' : 'Merci pour votre paiement !'}</p>
            {!user.premium && <p className="mt-1 text-ink/70">Le réseau confirme la transaction : cela prend en général quelques minutes. Cette page se met à jour toute seule, inutile de payer une deuxième fois.</p>}
          </div>
        </motion.div>
      )}
      <SubscriptionStatus a={user.abonnement} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Comment s’abonner ou renouveler">
          <ol className="space-y-3 text-[14.5px] text-ink/75">
            <li><strong className="text-primary">1.</strong> Cliquez sur « Payer en crypto » : une page de paiement sécurisée s’ouvre.</li>
            <li><strong className="text-primary">2.</strong> Choisissez la cryptomonnaie que vous voulez, puis envoyez le montant affiché.</li>
            <li><strong className="text-primary">3.</strong> Dès la confirmation, votre Premium s’active tout seul. Payé avant la fin ? Le mois s’ajoute à la suite.</li>
          </ol>
          <div className="mt-5 flex flex-col items-start gap-4"><PayButton /><CryptosAcceptees className="!justify-start" /></div>
        </Card>
        <Card title="Historique">
          {!data?.historique.length ? <p className="text-[14px] text-ink/55">Aucun abonnement pour le moment.</p> : (
            <ul className="divide-y divide-ligne">
              {data.historique.map((h) => (
                <li key={h.id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <p className="text-[14px] font-semibold">{h.type} · {h.duration_months} mois</p>
                    <p className="text-mini text-ink/55">{formatDate(h.start_date)} → {formatDate(h.end_date)}</p>
                  </div>
                  <Badge tone={ton[h.statut_reel]}>{lib[h.statut_reel]}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card title="Mes paiements crypto" className="lg:col-span-2">
          {!paiements.data?.payments.length ? <p className="text-[14px] text-ink/55">Aucun paiement pour le moment.</p> : (
            <ul className="divide-y divide-ligne">
              {paiements.data.payments.map((p) => {
                const st = STATUTS_PAIEMENT[p.status] ?? { label: p.status, tone: 'neutre' as const };
                return (
                  <li key={p.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent/15 text-ink"><Bitcoin className="h-4 w-4" /></span>
                      <div>
                        <p className="text-[14px] font-semibold">{Number(p.price_amount)} {p.price_currency.toUpperCase()}{p.pay_currency ? ` · en ${p.pay_currency.toUpperCase()}` : ''}</p>
                        <p className="text-mini text-ink/55">{formatDate(p.created_at)}</p>
                      </div>
                    </div>
                    <Badge tone={st.tone}>{p.credited ? 'Payé · activé' : st.label}</Badge>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Paramètres */
function Parametres({ user, onUpdate }: { user: SessionUser; onUpdate: (u: Partial<SessionUser>) => void }) {
  return (
    <div className="space-y-6">
      <PageHeader titre="Paramètres" texte="Votre profil et votre mot de passe." />
      <ProfileHeader name={user.name} lignes={[
        { label: 'Email', value: user.email },
        { label: 'Téléphone', value: user.telephone },
        { label: 'Abonnement', value: user.premium ? `Premium jusqu’au ${formatDate(user.abonnement?.date_expiration)}` : 'Gratuit' },
      ]} />
      <SimpleFieldsCard title="Mes informations" fields={[
        { key: 'nom', label: 'Nom', value: user.nom ?? '' },
        { key: 'prenom', label: 'Prénom', value: user.prenom ?? '' },
        { key: 'telephone', label: 'Téléphone', value: user.telephone ?? '', type: 'tel' },
      ]} onSave={async (v) => {
        const r = await api<{ user: SessionUser }>('profile', { method: 'PATCH', role: 'visiteur', body: v });
        onUpdate(r.user);
      }} />
      <PasswordCard role="visiteur" />
    </div>
  );
}

/* ================================================================ Espace visiteur */
export default function VisitorSpace({ page, id = '' }: { page: string; id?: string }) {
  const { user, checking, logout, updateUser } = useVisitor();
  if (checking) return <LoadingScreen label="Vérification de votre session…" />;
  if (!user) return <LoginPage />;

  const sections: NavSection[] = [
    { titre: 'Mon espace', items: [{ id: '', label: 'Tableau de bord', icon: LayoutDashboard }] },
    {
      titre: 'Contenus', items: [
        { id: 'contenus', label: 'Contenus', icon: Library },
        { id: 'favoris', label: 'Ma bibliothèque', icon: BookMarked, lock: !user.premium },
        { id: 'prieres', label: 'Demandes de prière', icon: HandHeart },
      ],
    },
    {
      titre: 'Compte', items: [
        { id: 'abonnement', label: 'Abonnement', icon: CreditCard },
        { id: 'profil', label: 'Paramètres', icon: Settings },
      ],
    },
  ];
  const active = page && sections.some((s) => s.items.some((i) => i.id === page)) ? page : '';
  const quick: QuickAction[] = [
    { label: 'Payer mon abonnement', icon: Bitcoin, onClick: () => go('espace', 'abonnement') },
    { label: 'Demander une prière', icon: HandHeart, onClick: () => go('espace', 'prieres') },
    { label: 'Paroles de Dieu', icon: BookOpen, onClick: () => go('bibliotheque', 'parole') },
    { label: 'Documents', icon: FileText, onClick: () => go('bibliotheque', 'document') },
  ];

  let content;
  switch (active) {
    case 'contenus': content = <div><PageHeader titre="Contenus" texte="Les contenus Premium sont signalés par un cadenas." /><LibraryView /></div>; break;
    case 'favoris': content = <Favoris user={user} />; break;
    case 'prieres': content = <Prieres />; break;
    case 'abonnement': content = <Abonnement user={user} merci={id === 'merci'} />; break;
    case 'profil': content = <Parametres user={user} onUpdate={updateUser} />; break;
    default: content = <Accueil user={user} />;
  }

  return (
    <Shell espace="espace" user={{ ...user, site_name: user.premium ? 'Premium' : 'Gratuit' }} roleLabel="Visiteur" sections={sections} active={active}
      bottom={['', 'contenus', 'abonnement']} quickActions={quick} onLogout={() => { logout(); go('accueil'); }}>
      {content}
    </Shell>
  );
}
