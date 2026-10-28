import { useEffect, useState } from 'react';
import {
  Activity, AlertTriangle, BookOpen, Church, CreditCard, Crown, Database, FileText, GraduationCap, HandHeart, KeyRound, LayoutDashboard,
  Bitcoin, Eye, Library, Mail, Settings, ShieldCheck, Sparkles, UserCheck, Users,
} from 'lucide-react';
import { api } from '@/lib/api';
import { go } from '@/lib/router';
import type { SessionUser } from '@/lib/session';
import { depuis, formatDate, formatNombre } from '@/lib/format';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Field } from '@/components/ui/Field';
import { Alert, type AlertMsg } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Empty';
import { AuthLayout } from '@/dashboard/AuthLayout';
import { PageHeader, Shell, type NavSection, type QuickAction } from '@/dashboard/Shell';
import { useAuth } from '@/dashboard/useAuth';
import { useData } from '@/dashboard/useData';
import { Card, LoadError, StatGrid, Tabs, WelcomeBanner } from '@/dashboard/Widgets';
import { ContentsManager } from '@/dashboard/ContentsManager';
import { ContentEditor } from '@/dashboard/ContentEditor';
import { PrayersBoard } from '@/dashboard/PrayersBoard';
import { PasswordCard, ProfileHeader, SimpleFieldsCard } from '@/dashboard/ProfileForms';
import { VisitorsAdmin } from './admin/VisitorsAdmin';
import { SubscriptionsAdmin } from './admin/SubscriptionsAdmin';
import { PastorsAdmin, PastorDetail, AjouterLivre } from './admin/PastorsAdmin';
import { PaymentsAdmin } from './admin/PaymentsAdmin';
import { libelleAction, type Activite } from './admin/common';

/* ========================================================================== */
/* Connexion administrateur (Supabase Auth, comptes autorisés uniquement)      */
/* ========================================================================== */
function AdminLogin({ onLogin, notice }: { onLogin: (t: string, u: SessionUser) => void; notice: string | null }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState<AlertMsg | null>(notice ? { kind: 'info', text: notice } : null);
  const [loading, setLoading] = useState(false);
  async function submit() {
    if (!email.includes('@') || !password) return setMsg({ kind: 'error', text: 'Indiquez votre email et votre mot de passe.' });
    setLoading(true); setMsg(null);
    try {
      const r = await api<{ token: string; user: SessionUser }>('auth?action=connexion-admin', { method: 'POST', body: { email, password } });
      onLogin(r.token, r.user);
    } catch (e) { setMsg({ kind: 'error', text: e instanceof Error ? e.message : 'Erreur.' }); }
    finally { setLoading(false); }
  }
  return (
    <AuthLayout photo="hero_prayer_light" surtitre="Accès réservé" titre="Administration" retour={false}
      texte="Connexion sécurisée réservée aux administrateurs autorisés." msg={msg} loading={loading} submitLabel="Se connecter" onSubmit={submit}>
      <Field label="Email" icon={<Mail className="h-4 w-4" />} type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={160} />
      <Field label="Mot de passe" icon={<KeyRound className="h-4 w-4" />} type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} maxLength={128} />
    </AuthLayout>
  );
}

/* ========================================================================== */
interface Overview {
  stats: Record<string, number | null>;
  alertes: { id: string; user_id: string; nom: string; type: string; end_date: string; jours_restants: number }[];
  activites: Activite[];
}

function ActivityList({ items }: { items: Activite[] }) {
  if (!items.length) return <p className="text-[14px] text-ink/55">Aucune activité pour le moment.</p>;
  const ton = { admin: 'neutre', pasteur: 'actif', visiteur: 'attente', systeme: 'neutre' } as const;
  return (
    <ol className="relative space-y-4 border-l border-ligne pl-5">
      {items.map((a) => (
        <li key={a.id} className="relative">
          <span className="absolute -left-[26px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-fond" />
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[14px]"><strong>{a.actor_name ?? 'Système'}</strong> {libelleAction(a.action)}{a.target_title ? <> « {a.target_title} »</> : ''}</p>
            <Badge tone={ton[a.actor_role as keyof typeof ton] ?? 'neutre'} dot={false}>{a.actor_role}</Badge>
          </div>
          <p className="text-mini text-ink/50">{formatDate(a.created_at)} à {new Date(a.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} · {depuis(a.created_at)}</p>
        </li>
      ))}
    </ol>
  );
}

function TableauDeBord({ user, data, error, reload }: { user: SessionUser; data: Overview | null; error: string | null; reload: () => void }) {
  const s = data?.stats ?? {};
  return (
    <div className="space-y-6">
      <WelcomeBanner photo="croix_aube" surtitre="Administration" titre={<>Bonjour, {user.name}</>} texte="Vue globale de la plateforme Ame & Vie.">
        {!!s.paiements_a_valider && <button onClick={() => go('admin', 'paiements')} className="rounded-full bg-accent px-4 py-2 text-[13px] font-semibold text-ink">{s.paiements_a_valider} paiement(s) à valider →</button>}
        {!!s.pasteurs_en_attente && <button onClick={() => go('admin', 'pasteurs')} className="rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-ink">{s.pasteurs_en_attente} guide(s) à valider →</button>}
        {!!data?.alertes.length && <button onClick={() => go('admin', 'abonnements')} className="rounded-full bg-white/15 px-4 py-2 text-[13px] font-semibold text-white ring-1 ring-white/30">{data.alertes.length} abonnement(s) expirent bientôt</button>}
      </WelcomeBanner>
      {error && <LoadError message={error} onRetry={reload} />}
      {/* Bibliothèque vide : proposer les contenus d'exemple */}
      {data && !s.contenus_publies && <ImportExemples onDone={reload} />}
      <StatGrid cols="sm:grid-cols-4" stats={[
        { label: 'Visiteurs du site', value: s.visiteurs_total, icon: Eye, hint: s.visiteurs_30j != null ? `${s.visiteurs_30j} sur 30 jours` : undefined },
        { label: 'Utilisateurs inscrits', value: s.inscrits, icon: Users, hint: s.comptes_actifs != null ? `${s.comptes_actifs} actifs` : undefined, onClick: () => go('admin', 'visiteurs') },
        { label: 'Abonnements actifs', value: s.abonnements_actifs, icon: Crown, onClick: () => go('admin', 'abonnements') },
        { label: 'Abonnements expirés', value: s.abonnements_expires, icon: CreditCard, onClick: () => go('admin', 'abonnements') },
        { label: 'Guides spirituels', value: s.pasteurs, icon: Church, hint: s.pasteurs_actifs != null ? `${s.pasteurs_actifs} actifs` : undefined, onClick: () => go('admin', 'pasteurs') },
        { label: 'Contenus publiés', value: s.contenus_publies, icon: Library, onClick: () => go('admin', 'contenus') },
        { label: 'Documents', value: s.documents, icon: FileText, onClick: () => go('admin', 'contenus') },
        { label: 'Paroles de Dieu', value: s.paroles, icon: BookOpen, onClick: () => go('admin', 'contenus') },
        { label: 'Enseignements', value: s.enseignements, icon: GraduationCap, onClick: () => go('admin', 'contenus') },
      ]} />
      <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        <Card title="Expirent bientôt" action={<button className="text-[13px] font-bold text-primary" onClick={() => go('admin', 'abonnements')}>Abonnements</button>}>
          {!data ? <Skeleton className="h-24" /> : !data.alertes.length ? <p className="text-[14px] text-ink/55">Aucun abonnement n’expire dans les 7 jours.</p> : (
            <ul className="space-y-2">
              {data.alertes.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 rounded-2xl bg-accent/10 px-4 py-3">
                  <div className="min-w-0"><p className="truncate text-[14px] font-semibold">{a.nom}</p><p className="text-mini text-ink/60">{a.type} · fin le {formatDate(a.end_date)}</p></div>
                  <span className="flex shrink-0 items-center gap-1 text-[13px] font-bold"><AlertTriangle className="h-4 w-4" />{a.jours_restants === 0 ? 'Aujourd’hui' : `J-${a.jours_restants}`}</span>
                </li>
              ))}
            </ul>
          )}
          {!!s.prieres_nouvelles && <button onClick={() => go('admin', 'prieres')} className="mt-4 flex w-full items-center gap-2 rounded-2xl bg-surface px-4 py-3 text-left text-[14px] font-semibold"><HandHeart className="h-4 w-4" />{s.prieres_nouvelles} nouvelle(s) demande(s) de prière</button>}
        </Card>
        <Card title="Activité récente" action={<button className="text-[13px] font-bold text-primary" onClick={() => go('admin', 'activites')}>Tout voir</button>}>
          {!data ? <Skeleton className="h-40" /> : <ActivityList items={data.activites} />}
        </Card>
      </div>
    </div>
  );
}

function Activites() {
  const [role, setRole] = useState<'tous' | 'pasteur' | 'visiteur' | 'admin'>('pasteur');
  const { data, error, loading, reload } = useData<{ activites: Activite[] }>(`admin?scope=activites${role === 'tous' ? '' : `&role=${role}`}`, 'admin');
  return (
    <div>
      <PageHeader titre="Activités" texte="Suivi à distance : connexions, publications, documents, abonnements… avec la date de chaque action." />
      <div className="mb-5"><Tabs id="act" value={role} onChange={setRole} options={[{ value: 'pasteur', label: 'Guides spirituels' }, { value: 'visiteur', label: 'Visiteurs' }, { value: 'admin', label: 'Administration' }, { value: 'tous', label: 'Tout' }]} /></div>
      <Card>{error ? <LoadError message={error} onRetry={reload} /> : loading && !data ? <Skeleton className="h-64" /> : <ActivityList items={data?.activites ?? []} />}</Card>
    </div>
  );
}

/** Bouton d'import des contenus et documents d'exemple (ré-exécutable sans doublon). */
export function ImportExemples({ onDone }: { onDone?: () => void }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<AlertMsg | null>(null);
  async function lancer() {
    setBusy(true); setMsg(null);
    try {
      const r = await api<{ ajoutes: number; ignores: number; pasteur: string }>('admin?action=exemples', { method: 'POST', role: 'admin' });
      setMsg({ kind: 'success', text: r.ajoutes
        ? `${r.ajoutes} contenu(s) ajouté(s) au nom de « ${r.pasteur} »${r.ignores ? `, ${r.ignores} déjà présent(s)` : ''}.`
        : 'Les contenus d’exemple sont déjà tous présents.' });
      onDone?.();
    } catch (e) { setMsg({ kind: 'error', text: e instanceof Error ? e.message : 'Erreur.' }); }
    finally { setBusy(false); }
  }
  return (
    <Card title="Contenus d’exemple">
      <p className="text-[14px] text-ink/70">
        Ajoute 26 publications prêtes à l’emploi : 8 Paroles de Dieu, 5 enseignements, 7 contenus spirituels et
        <strong> 6 documents PDF à télécharger</strong> (plan de lecture de la Bible, guide de prière 21 jours, étude des Béatitudes…),
        en Gratuit et en Premium. Elles sont publiées au nom de Jean, guide spirituel ; vous pourrez les modifier ou les supprimer dans « Contenus ».
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button icon={<Sparkles className="h-4 w-4" />} loading={busy} onClick={lancer} shine>Ajouter les contenus d’exemple</Button>
        <span className="text-mini text-ink/50">Sans risque de doublon : peut être relancé.</span>
      </div>
      <div className="mt-4"><Alert msg={msg} /></div>
    </Card>
  );
}

function BaseDeDonnees() {
  const { data, error, loading, reload } = useData<{ tables: { table: string; lignes: number | null; existe: boolean }[]; stockage: boolean; stockage_public: boolean | null }>('admin?scope=database', 'admin');
  const manquantes = data?.tables.filter((t) => !t.existe) ?? [];
  return (
    <div>
      <PageHeader titre="Base de données" texte="État des tables et du stockage Supabase." actions={<Button variant="secondary" loading={loading} onClick={reload}>Actualiser</Button>} />
      {error && <LoadError message={error} onRetry={reload} />}
      {(manquantes.length > 0 || (data && !data.stockage)) && (
        <div className="mb-5 flex gap-3 rounded-3xl bg-accent/12 p-5 text-[14px] ring-1 ring-accent/30">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <p>{manquantes.length > 0 && <>Table(s) manquante(s) : <strong>{manquantes.map((t) => t.table).join(', ')}</strong>. </>}
            {data && !data.stockage && <>Le bucket de stockage « documents » est introuvable. </>}
            Exécutez <code>supabase/schema.sql</code> dans le SQL Editor de Supabase.</p>
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {(data?.tables ?? []).map((t) => (
          <div key={t.table} className="flex items-center gap-4 rounded-3xl bg-fond p-4 shadow-doux ring-1 ring-ligne">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-surface"><Database className="h-[18px] w-[18px]" /></span>
            <div className="min-w-0 flex-1"><p className="truncate font-mono text-[13px] font-semibold">{t.table}</p><p className="text-mini text-ink/55">{t.existe ? `${formatNombre(t.lignes)} ligne(s)` : 'Table absente'}</p></div>
            <Badge tone={t.existe ? 'actif' : 'rejet'}>{t.existe ? 'OK' : 'Manquante'}</Badge>
          </div>
        ))}
        {data && (
          <div className="flex items-center gap-4 rounded-3xl bg-fond p-4 shadow-doux ring-1 ring-ligne">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-surface"><FileText className="h-[18px] w-[18px]" /></span>
            <div className="min-w-0 flex-1"><p className="font-mono text-[13px] font-semibold">storage : documents</p><p className="text-mini text-ink/55">{data.stockage ? (data.stockage_public ? 'PUBLIC — à rendre privé !' : 'Privé') : 'Absent'}</p></div>
            <Badge tone={data.stockage && !data.stockage_public ? 'actif' : 'rejet'}>{data.stockage && !data.stockage_public ? 'OK' : 'À corriger'}</Badge>
          </div>
        )}
      </div>
      <div className="mt-6"><ImportExemples onDone={reload} /></div>
      <Card className="mt-6" title="Sécurité">
        <ul className="space-y-2 text-[14px] text-ink/70">
          {['Row Level Security activée sur toutes les tables, sans accès public.', 'Clé service_role utilisée uniquement dans les fonctions serveur Vercel.',
            'Mots de passe hachés (scrypt + sel), sessions signées HMAC-SHA256 (7 jours) revérifiées toutes les 30 s.',
            'Contenus et documents Premium filtrés côté serveur selon l’abonnement.'].map((t) => (
            <li key={t} className="flex gap-2"><ShieldCheck className="h-4 w-4 shrink-0 text-primary" />{t}</li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function Parametres({ user, onUpdate }: { user: SessionUser; onUpdate: (u: Partial<SessionUser>) => void }) {
  return (
    <div className="space-y-6">
      <PageHeader titre="Paramètres" />
      <ProfileHeader name={user.name} lignes={[{ label: 'Rôle', value: 'Administrateur' }, { label: 'Email', value: user.email }]} />
      <SimpleFieldsCard title="Nom affiché" fields={[{ key: 'display_name', label: 'Nom affiché', value: user.name }]}
        onSave={async (v) => { const r = await api<{ user: SessionUser }>('profile', { method: 'PATCH', role: 'admin', body: v }); onUpdate({ name: r.user.name }); }} />
      <PasswordCard role="admin" />
    </div>
  );
}

/* ========================================================================== */
export default function AdminSpace({ page, id }: { page: string; id: string }) {
  const { user, checking, notice, login, logout, updateUser } = useAuth('admin');
  const overview = useData<Overview>(user ? 'admin?scope=overview' : null, 'admin');
  // Compteurs (badges du menu) rafraîchis à chaque changement de page
  useEffect(() => { if (user) overview.reload(); }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  if (checking) return <LoadingScreen label="Vérification de votre session…" />;
  if (!user) return <AdminLogin onLogin={login} notice={notice} />;

  const s = overview.data?.stats ?? {};
  const sections: NavSection[] = [
    { titre: 'Pilotage', items: [{ id: '', label: 'Tableau de bord', icon: LayoutDashboard }] },
    {
      titre: 'Gestion', items: [
        { id: 'visiteurs', label: 'Visiteurs', icon: Users },
        { id: 'abonnements', label: 'Abonnements', icon: CreditCard, badge: overview.data?.alertes.length || undefined },
        { id: 'paiements', label: 'Paiements crypto', icon: Bitcoin, badge: s.paiements_a_valider || undefined },
        { id: 'pasteurs', label: 'Guides spirituels', icon: UserCheck, badge: s.pasteurs_en_attente || undefined },
        { id: 'contenus', label: 'Contenus', icon: Library },
        { id: 'prieres', label: 'Demandes de prière', icon: HandHeart, badge: s.prieres_nouvelles || undefined },
      ],
    },
    { titre: 'Suivi', items: [{ id: 'activites', label: 'Activités', icon: Activity }, { id: 'base', label: 'Base de données', icon: Database }] },
    { titre: 'Compte', items: [{ id: 'profil', label: 'Paramètres', icon: Settings }] },
  ];
  const active = sections.some((x) => x.items.some((i) => i.id === page)) ? page : '';
  const quick: QuickAction[] = [
    { label: 'Activer un abonnement', icon: Crown, onClick: () => go('admin', 'visiteurs') },
    { label: 'Valider un paiement', icon: Bitcoin, onClick: () => go('admin', 'paiements') },
    { label: 'Ajouter un livre', icon: BookOpen, onClick: () => go('admin', 'contenus') },
    { label: 'Valider un guide spirituel', icon: UserCheck, onClick: () => go('admin', 'pasteurs') },
    { label: 'Abonnements qui expirent', icon: AlertTriangle, onClick: () => go('admin', 'abonnements') },
    { label: 'Dernières activités', icon: Activity, onClick: () => go('admin', 'activites') },
  ];

  let content;
  switch (active) {
    case 'visiteurs': content = <VisitorsAdmin onChange={overview.reload} />; break;
    case 'abonnements': content = <SubscriptionsAdmin onChange={overview.reload} />; break;
    case 'paiements': content = <PaymentsAdmin onChange={overview.reload} />; break;
    case 'pasteurs': content = id ? <PastorDetail key={id} id={id} /> : <PastorsAdmin onChange={overview.reload} />; break;
    case 'contenus':
      content = id ? (
        <div><PageHeader titre="Modifier la publication" /><ContentEditor key={id} role="admin" contentId={id} onDone={() => go('admin', 'contenus')} /></div>
      ) : (
        <div><PageHeader titre="Contenus" texte="Toutes les publications des guides spirituels : consulter, modifier, retirer ou supprimer." actions={<AjouterLivre />} />
          <ContentsManager role="admin" onEdit={(cid) => go('admin', 'contenus', cid)} /></div>
      );
      break;
    case 'prieres': content = <div><PageHeader titre="Demandes de prière" /><PrayersBoard role="admin" /></div>; break;
    case 'activites': content = <Activites />; break;
    case 'base': content = <BaseDeDonnees />; break;
    case 'profil': content = <Parametres user={user} onUpdate={updateUser} />; break;
    default: content = <TableauDeBord user={user} data={overview.data} error={overview.error} reload={overview.reload} />;
  }

  return (
    <Shell espace="admin" user={user} roleLabel="Administrateur" sections={sections} active={active}
      bottom={['', 'visiteurs', 'abonnements']} quickActions={quick} onLogout={() => { logout(); go('admin'); }}>
      {content}
    </Shell>
  );
}
