import { useState, type FormEvent, type ReactNode } from 'react';
import { KeyRound, Save } from 'lucide-react';
import { api } from '@/lib/api';
import type { Role } from '@/lib/session';
import { Field } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { Alert, type AlertMsg } from '@/components/ui/Alert';
import { initiales } from '@/lib/format';
import { Card } from './Widgets';

/** En-tête de profil : avatar + nom + lignes d'information. */
export function ProfileHeader({ name, lignes }: { name: string; lignes: { label: string; value: ReactNode }[] }) {
  return (
    <Card>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <span className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl bg-primary font-serif text-2xl text-on-primary shadow-doux">{initiales(name)}</span>
        <div className="min-w-0">
          <h2 className="truncate text-2xl">{name}</h2>
          <dl className="mt-2 grid gap-x-8 gap-y-1 text-[14px] sm:grid-cols-2">
            {lignes.map((l) => (
              <div key={l.label} className="flex gap-2"><dt className="text-ink/50">{l.label} :</dt><dd className="truncate font-semibold">{l.value || '—'}</dd></div>
            ))}
          </dl>
        </div>
      </div>
    </Card>
  );
}

/** Formulaire de changement de mot de passe (mot de passe actuel requis). */
export function PasswordCard({ path = 'profile', method = 'PATCH', role }: { path?: string; method?: 'PATCH'; role: Role }) {
  const [actuel, setActuel] = useState('');
  const [nouveau, setNouveau] = useState('');
  const [confirme, setConfirme] = useState('');
  const [msg, setMsg] = useState<AlertMsg | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (nouveau.length < 8) return setMsg({ kind: 'error', text: 'Le nouveau mot de passe doit contenir au moins 8 caractères.' });
    if (nouveau !== confirme) return setMsg({ kind: 'error', text: 'Les deux mots de passe ne correspondent pas.' });
    setLoading(true); setMsg(null);
    try {
      await api(path, { method, role, body: { current_password: actuel, new_password: nouveau } });
      setActuel(''); setNouveau(''); setConfirme('');
      setMsg({ kind: 'success', text: 'Mot de passe modifié.' });
    } catch (err) {
      setMsg({ kind: 'error', text: err instanceof Error ? err.message : 'Erreur.' });
    } finally { setLoading(false); }
  }

  return (
    <Card title="Mot de passe">
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-3">
        <Field label="Mot de passe actuel" type="password" autoComplete="current-password" value={actuel} onChange={(e) => setActuel(e.target.value)} />
        <Field label="Nouveau mot de passe" type="password" autoComplete="new-password" value={nouveau} onChange={(e) => setNouveau(e.target.value)} hint="8 caractères minimum" />
        <Field label="Confirmation" type="password" autoComplete="new-password" value={confirme} onChange={(e) => setConfirme(e.target.value)} />
        <div className="sm:col-span-3"><Alert msg={msg} /></div>
        <div className="sm:col-span-3"><Button type="submit" loading={loading} icon={<KeyRound className="h-4 w-4" />}>Changer le mot de passe</Button></div>
      </form>
    </Card>
  );
}

/** Formulaire simple d'un ou plusieurs champs texte. */
export function SimpleFieldsCard({ title, fields, onSave }: {
  title: string;
  fields: { key: string; label: string; value: string; type?: string; hint?: string }[];
  onSave: (values: Record<string, string>) => Promise<void>;
}) {
  const [values, setValues] = useState(() => Object.fromEntries(fields.map((f) => [f.key, f.value])));
  const [msg, setMsg] = useState<AlertMsg | null>(null);
  const [loading, setLoading] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true); setMsg(null);
    try { await onSave(values); setMsg({ kind: 'success', text: 'Profil mis à jour.' }); }
    catch (err) { setMsg({ kind: 'error', text: err instanceof Error ? err.message : 'Erreur.' }); }
    finally { setLoading(false); }
  }
  return (
    <Card title={title}>
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        {fields.map((f) => (
          <Field key={f.key} label={f.label} type={f.type ?? 'text'} hint={f.hint} value={values[f.key] ?? ''} onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))} />
        ))}
        <div className="sm:col-span-2"><Alert msg={msg} /></div>
        <div className="sm:col-span-2"><Button type="submit" loading={loading} icon={<Save className="h-4 w-4" />}>Enregistrer</Button></div>
      </form>
    </Card>
  );
}
