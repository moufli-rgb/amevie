import { useState } from 'react';
import { KeyRound, Mail, Phone, User } from 'lucide-react';
import { api } from '@/lib/api';
import { go, hrefOf } from '@/lib/router';
import { useVisitor } from '@/lib/visitor';
import type { SessionUser } from '@/lib/session';
import { Field } from '@/components/ui/Field';
import type { AlertMsg } from '@/components/ui/Alert';
import { AuthLayout } from '@/dashboard/AuthLayout';

/** Connexion visiteur. */
export function LoginPage() {
  const { login, notice } = useVisitor();
  const [f, setF] = useState({ email: '', password: '' });
  const [msg, setMsg] = useState<AlertMsg | null>(notice ? { kind: 'info', text: notice } : null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!f.email.includes('@') || !f.password) return setMsg({ kind: 'error', text: 'Indiquez votre email et votre mot de passe.' });
    setLoading(true); setMsg(null);
    try {
      const r = await api<{ token: string; user: SessionUser }>('auth?action=connexion', { method: 'POST', body: { ...f, role: 'visiteur' } });
      login(r.token, r.user);
      go('espace');
    } catch (e) {
      setMsg({ kind: 'error', text: e instanceof Error ? e.message : 'Erreur.' });
    } finally { setLoading(false); }
  }

  return (
    <AuthLayout photo="daily_prayer_verse" surtitre="Bon retour" titre="Connexion" texte="Accédez à votre espace, à vos favoris et à votre abonnement."
      msg={msg} loading={loading} submitLabel="Se connecter" onSubmit={submit}
      footer={<>Pas encore de compte ? <a className="font-semibold text-primary" href={hrefOf('inscription')}>Créer un compte</a> · Vous êtes pasteur ? <a className="font-semibold text-primary" href={hrefOf('pasteur')}>Espace pasteur</a></>}>
      <Field label="Email" icon={<Mail className="h-4 w-4" />} type="email" autoComplete="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} maxLength={160} />
      <Field label="Mot de passe" icon={<KeyRound className="h-4 w-4" />} type="password" autoComplete="current-password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} maxLength={128} />
    </AuthLayout>
  );
}

/** Création de compte visiteur. */
export function RegisterPage() {
  const { login } = useVisitor();
  const [f, setF] = useState({ nom: '', prenom: '', email: '', telephone: '', password: '', password_confirm: '' });
  const [msg, setMsg] = useState<AlertMsg | null>(null);
  const [loading, setLoading] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF((s) => ({ ...s, [k]: e.target.value }));

  async function submit() {
    if (!f.nom.trim() || !f.prenom.trim()) return setMsg({ kind: 'error', text: 'Indiquez votre nom et votre prénom.' });
    if (!f.email.includes('@')) return setMsg({ kind: 'error', text: 'Indiquez une adresse email valide.' });
    if (f.telephone.replace(/\D/g, '').length < 6) return setMsg({ kind: 'error', text: 'Indiquez votre numéro de téléphone.' });
    if (f.password.length < 8) return setMsg({ kind: 'error', text: 'Le mot de passe doit contenir au moins 8 caractères.' });
    if (f.password !== f.password_confirm) return setMsg({ kind: 'error', text: 'Les deux mots de passe ne correspondent pas.' });
    setLoading(true); setMsg(null);
    try {
      const r = await api<{ token: string; user: SessionUser }>('auth?action=inscription-visiteur', { method: 'POST', body: f });
      login(r.token, r.user);
      go('espace');
    } catch (e) {
      setMsg({ kind: 'error', text: e instanceof Error ? e.message : 'Erreur.' });
    } finally { setLoading(false); }
  }

  return (
    <AuthLayout photo="community_fellowship" surtitre="Bienvenue" titre="Créer mon compte" texte="Gratuit et sans engagement. Vous pourrez passer Premium à tout moment."
      msg={msg} loading={loading} submitLabel="Créer mon compte" onSubmit={submit}
      footer={<>Déjà inscrit ? <a className="font-semibold text-primary" href={hrefOf('connexion')}>Se connecter</a></>}>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Nom" icon={<User className="h-4 w-4" />} autoComplete="family-name" value={f.nom} onChange={set('nom')} maxLength={60} />
        <Field label="Prénom" autoComplete="given-name" value={f.prenom} onChange={set('prenom')} maxLength={60} />
      </div>
      <Field label="Adresse e-mail" icon={<Mail className="h-4 w-4" />} type="email" autoComplete="email" value={f.email} onChange={set('email')} maxLength={160} />
      <Field label="Numéro de téléphone" icon={<Phone className="h-4 w-4" />} type="tel" autoComplete="tel" value={f.telephone} onChange={set('telephone')} maxLength={30} placeholder="+225 07 00 00 00 00" />
      <div className="grid gap-3 sm:grid-cols-2 paysage:grid-cols-2">
        <Field label="Mot de passe" icon={<KeyRound className="h-4 w-4" />} type="password" autoComplete="new-password" value={f.password} onChange={set('password')} maxLength={128} hint="8 caractères minimum" />
        <Field label="Confirmation" type="password" autoComplete="new-password" value={f.password_confirm} onChange={set('password_confirm')} maxLength={128} />
      </div>
    </AuthLayout>
  );
}
