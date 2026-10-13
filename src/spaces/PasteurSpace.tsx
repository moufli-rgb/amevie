import { useState } from 'react';
import {
  BookOpen, Church, Eye, FileText, GraduationCap, HandHeart, KeyRound, LayoutDashboard, Library, Mail, Phone, PlusCircle, Settings, Sparkles, User,
} from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { go } from '@/lib/router';
import type { SessionUser } from '@/lib/session';
import { TYPES, type Contenu, type TypeContenu } from '@/lib/contenus';
import { formatDateCourte } from '@/lib/format';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Field } from '@/components/ui/Field';
import type { AlertMsg } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Empty';
import { AuthLayout } from '@/dashboard/AuthLayout';
import { PageHeader, Shell, type NavSection, type QuickAction } from '@/dashboard/Shell';
import { useAuth } from '@/dashboard/useAuth';
import { useData } from '@/dashboard/useData';
import { Card, StatGrid, Tabs, WelcomeBanner } from '@/dashboard/Widgets';
import { ContentEditor } from '@/dashboard/ContentEditor';
import { ContentsManager } from '@/dashboard/ContentsManager';
import { PrayersBoard } from '@/dashboard/PrayersBoard';
import { PasswordCard, ProfileHeader, SimpleFieldsCard } from '@/dashboard/ProfileForms';

/* ========================================================================== */
/* Connexion / création de compte pasteur                                      */
/* ========================================================================== */
function PasteurAuth({ onLogin, notice }: { onLogin: (t: string, u: SessionUser) => void; notice: string | null }) {
  const [mode, setMode] = useState<'connexion' | 'inscription'>('connexion');
  const [f, setF] = useState({ nom: '', prenom: '', email: '', telephone: '', eglise: '', password: '', password_confirm: '' });
  const [msg, setMsg] = useState<AlertMsg | null>(notice ? { kind: 'info', text: notice } : null);
  const [loading, setLoading] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF((s) => ({ ...s, [k]: e.target.value }));

  async function submit() {
    setMsg(null);
    if (mode === 'inscription') {
      if (!f.nom.trim() || !f.prenom.trim()) return setMsg({ kind: 'error', text: 'Indiquez votre nom et votre prénom.' });
      if (f.telephone.replace(/\D/g, '').length < 6) return setMsg({ kind: 'error', text: 'Indiquez votre numéro de téléphone.' });
      if (f.password.length < 8) return setMsg({ kind: 'error', text: 'Le mot de passe doit contenir au moins 8 caractères.' });
      if (f.password !== f.password_confirm) return setMsg({ kind: 'error', text: 'Les deux mots de passe ne correspondent pas.' });
    }
    if (!f.email.includes('@')) return setMsg({ kind: 'error', text: 'Indiquez une adresse email valide.' });
    setLoading(true);
    try {
      if (mode === 'connexion') {
        const r = await api<{ token: string; user: SessionUser }>('auth?action=connexion', { method: 'POST', body: { email: f.email, password: f.password, role: 'pasteur' } });
        onLogin(r.token, r.user);
      } else {
        const r = await api<{ message: string }>('auth?action=inscription-pasteur', { method: 'POST', body: f });
        setMsg({ kind: 'pending', text: r.message });
        setMode('connexion');
        setF((s) => ({ ...s, password: '', password_confirm: '' }));
      }
    } catch (e) {
      setMsg({ kind: e instanceof ApiError && e.code === 'EN_ATTENTE' ? 'pending' : 'error', text: e instanceof Error ? e.message : 'Erreur.' });
    } finally { setLoading(false); }
  }

  return (
    <AuthLayout photo="spiritual_bible_study" surtitre="Espace" titre="Pasteur"
      texte={mode === 'connexion' ? 'Connectez-vous pour publier et gérer vos contenus.' : 'Créez votre compte : il sera actif après validation par l’administration.'}
      msg={msg} loading={loading} submitLabel={mode === 'connexion' ? 'Se connecter' : 'Créer mon compte pasteur'} onSubmit={submit}>
      <Tabs id="pasteur-auth" value={mode} onChange={(m) => { setMode(m); setMsg(null); }} options={[{ value: 'connexion', label: 'Se connecter' }, { value: 'inscription', label: 'Créer un compte' }]} />
      {mode === 'inscription' && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nom" icon={<User className="h-4 w-4" />} value={f.nom} onChange={set('nom')} maxLength={60} autoComplete="family-name" />
            <Field label="Prénom" value={f.prenom} onChange={set('prenom')} maxLength={60} autoComplete="given-name" />
          </div>
          <Field label="Téléphone" icon={<Phone className="h-4 w-4" />} type="tel" value={f.telephone} onChange={set('telephone')} maxLength={30} autoComplete="tel" />
          <Field label="Église / ministère" icon={<Church className="h-4 w-4" />} value={f.eglise} onChange={set('eglise')} maxLength={120} />
        </>
      )}
      <Field label="Email" icon={<Mail className="h-4 w-4" />} type="email" value={f.email} onChange={set('email')} maxLength={160} autoComplete="email" />
      <Field label="Mot de passe" icon={<KeyRound className="h-4 w-4" />} type="password" value={f.password} onChange={set('password')} maxLength={128}
        autoComplete={mode === 'connexion' ? 'current-password' : 'new-password'} hint={mode === 'inscription' ? '8 caractères minimum' : undefined} />
      {mode === 'inscription' && <Field label="Confirmation du mot de passe" type="password" value={f.password_confirm} onChange={set('password_confirm')} maxLength={128} autoComplete="new-password" />}
    </AuthLayout>
  );
}

/* ========================================================================== */
function Accueil({ user }: { user: SessionUser }) {
  const { data, loading } = useData<{ contents: Contenu[] }>('contents?scope=mine', 'pasteur');
  const items = data?.contents ?? [];
  const n = (t: TypeContenu) => items.filter((c) => c.type === t).length;
  const publier = (t: TypeContenu) => go('pasteur', 'nouveau', t);
  return (
    <div className="space-y-6">
      <WelcomeBanner photo="spiritual_bible_study" surtitre="Espace pasteur" titre={<>Bienvenue, Pst {user.prenom ?? user.name}</>}
        texte="Partagez la Parole : vos publications sont visibles par les visiteurs selon l’accès choisi (Gratuit ou Premium)." />
      <StatGrid cols="sm:grid-cols-4" stats={[
        { label: 'Paroles de Dieu', value: loading && !data ? null : n('parole'), icon: BookOpen, onClick: () => go('pasteur', 'publications') },
        { label: 'Enseignements', value: loading && !data ? null : n('enseignement'), icon: GraduationCap, onClick: () => go('pasteur', 'publications') },
        { label: 'Documents', value: loading && !data ? null : n('document'), icon: FileText, onClick: () => go('pasteur', 'publications') },
        { label: 'Lectures au total', value: loading && !data ? null : items.reduce((s, c) => s + c.views, 0), icon: Eye },
      ]} />
      <Card title="Publier rapidement">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(Object.keys(TYPES) as TypeContenu[]).map((t) => {
            const T = TYPES[t];
            return (
              <button key={t} onClick={() => publier(t)} className="flex flex-col items-start gap-3 rounded-2xl bg-surface p-4 text-left transition hover:bg-ligne/60">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-on-primary"><T.icon className="h-[18px] w-[18px]" /></span>
                <span className="text-[14px] font-semibold">{T.label}</span>
              </button>
            );
          })}
        </div>
      </Card>
      <Card title="Mes dernières publications" action={<button className="text-[13px] font-bold text-primary" onClick={() => go('pasteur', 'publications')}>Tout voir</button>}>
        {loading && !data ? <Skeleton className="h-32" /> : !items.length ? <p className="text-[14px] text-ink/55">Vous n’avez encore rien publié.</p> : (
          <ul className="divide-y divide-ligne">
            {items.slice(0, 5).map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3 py-3">
                <button onClick={() => go('pasteur', 'modifier', c.id)} className="min-w-0 text-left">
                  <p className="truncate text-[14px] font-semibold">{c.title}</p>
                  <p className="text-mini text-ink/55">{TYPES[c.type].label} · {formatDateCourte(c.created_at)} · {c.views} vue{c.views > 1 ? 's' : ''}</p>
                </button>
                <Badge tone={c.is_published ? 'actif' : 'neutre'}>{c.is_published ? 'Publié' : 'Brouillon'}</Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function Parametres({ user, onUpdate }: { user: SessionUser; onUpdate: (u: Partial<SessionUser>) => void }) {
  return (
    <div className="space-y-6">
      <PageHeader titre="Paramètres" texte="Votre profil public et votre mot de passe." />
      <ProfileHeader name={`Pst ${user.name}`} lignes={[{ label: 'Email', value: user.email }, { label: 'Téléphone', value: user.telephone }, { label: 'Église', value: user.eglise }]} />
      <SimpleFieldsCard title="Mon profil" fields={[
        { key: 'nom', label: 'Nom', value: user.nom ?? '' },
        { key: 'prenom', label: 'Prénom', value: user.prenom ?? '' },
        { key: 'telephone', label: 'Téléphone', value: user.telephone ?? '', type: 'tel' },
        { key: 'eglise', label: 'Église / ministère', value: user.eglise ?? '' },
        { key: 'bio', label: 'Présentation (page « Pasteurs »)', value: user.bio ?? '', hint: '1 000 caractères maximum' },
      ]} onSave={async (v) => {
        const r = await api<{ user: SessionUser }>('profile', { method: 'PATCH', role: 'pasteur', body: v });
        onUpdate(r.user);
      }} />
      <PasswordCard role="pasteur" />
    </div>
  );
}

/* ========================================================================== */
export default function PasteurSpace({ page, id }: { page: string; id: string }) {
  const { user, checking, notice, login, logout, updateUser } = useAuth('pasteur');
  const [flash, setFlash] = useState<string | null>(null);

  if (checking) return <LoadingScreen label="Vérification de votre session…" />;
  if (!user) return <PasteurAuth onLogin={login} notice={notice} />;

  const sections: NavSection[] = [
    { titre: 'Pilotage', items: [{ id: '', label: 'Tableau de bord', icon: LayoutDashboard }] },
    {
      titre: 'Contenus', items: [
        { id: 'nouveau', label: 'Nouvelle publication', icon: PlusCircle },
        { id: 'publications', label: 'Mes publications', icon: Library },
        { id: 'prieres', label: 'Demandes de prière', icon: HandHeart },
      ],
    },
    { titre: 'Compte', items: [{ id: 'profil', label: 'Paramètres', icon: Settings }] },
  ];
  const active = page === 'modifier' ? 'publications' : sections.some((s) => s.items.some((i) => i.id === page)) ? page : '';
  const quick: QuickAction[] = (Object.keys(TYPES) as TypeContenu[]).map((t) => ({ label: `Publier : ${TYPES[t].label}`, icon: t === 'contenu' ? Sparkles : TYPES[t].icon, onClick: () => go('pasteur', 'nouveau', t) }));
  const terminer = (_c: Contenu, message: string) => { setFlash(message); go('pasteur', 'publications'); };

  let content;
  if (page === 'nouveau') {
    content = (
      <div>
        <PageHeader titre="Nouvelle publication" texte="Choisissez le type, remplissez, puis publiez en Gratuit ou Premium." />
        <ContentEditor key={`n-${id}`} role="pasteur" initialType={(id in TYPES ? id : 'parole') as TypeContenu} onDone={terminer} />
      </div>
    );
  } else if (page === 'modifier' && id) {
    content = (
      <div>
        <PageHeader titre="Modifier la publication" />
        <ContentEditor key={`m-${id}`} role="pasteur" contentId={id} onDone={terminer} />
      </div>
    );
  } else if (active === 'publications') {
    content = (
      <div>
        <PageHeader titre="Mes publications" texte="Classées par type et par statut. Vous seul pouvez modifier vos publications." />
        {flash && <p className="mb-4 rounded-xl bg-primary/8 px-4 py-3 text-[14px] font-semibold text-primary">{flash}</p>}
        <ContentsManager role="pasteur" onEdit={(cid) => go('pasteur', 'modifier', cid)} onNew={() => go('pasteur', 'nouveau')} />
      </div>
    );
  } else if (active === 'prieres') {
    content = <div><PageHeader titre="Demandes de prière" texte="Portez les intentions des visiteurs et indiquez où en est chaque demande." /><PrayersBoard role="pasteur" /></div>;
  } else if (active === 'profil') {
    content = <Parametres user={user} onUpdate={updateUser} />;
  } else {
    content = <Accueil user={user} />;
  }

  return (
    <Shell espace="pasteur" user={{ ...user, site_name: user.eglise ?? undefined }} roleLabel="Pasteur" sections={sections} active={page === 'modifier' ? 'publications' : active || (page === 'nouveau' ? 'nouveau' : '')}
      bottom={['', 'publications', 'prieres']} quickActions={quick} onLogout={() => { logout(); go('pasteur'); }}>
      {content}
    </Shell>
  );
}
