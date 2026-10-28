import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft, BookOpen, Check, Church, Clock, DoorOpen, FileText, GraduationCap, Mail, Pencil, Phone, Power, Sparkles, Trash2, UserPlus, Users,
} from 'lucide-react';
import { api } from '@/lib/api';
import { depuis, formatDate, formatDateCourte } from '@/lib/format';
import { normalize } from '@/lib/normalize';
import { go, hrefOf } from '@/lib/router';
import { TYPES, type Contenu } from '@/lib/contenus';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Field, TextArea } from '@/components/ui/Field';
import { Alert, type AlertMsg } from '@/components/ui/Alert';
import { ConfirmDialog, Modal } from '@/components/ui/Modal';
import { EmptyState, Skeleton } from '@/components/ui/Empty';
import { GratuitBadge, PremiumBadge } from '@/components/Premium';
import { PageHeader } from '@/dashboard/Shell';
import { Card, LoadError, SearchInput, StatGrid, Tabs } from '@/dashboard/Widgets';
import { useData } from '@/dashboard/useData';
import { libelleAction } from './common';
import { ouvrirEspaceGuide } from '@/lib/accesGuide';

/** Bouton « Ouvrir son espace » (l'administration agit dans l'espace du guide). */
function OuvrirEspace({ id, size = 'sm', label = 'Ouvrir son espace' }: { id: string; size?: 'sm' | 'md'; label?: string }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  return (
    <span className="inline-flex flex-col">
      <Button size={size} icon={<DoorOpen className="h-3.5 w-3.5" />} loading={busy} onClick={async () => {
        setBusy(true); setErr(null);
        try { await ouvrirEspaceGuide(id); } catch (e) { setErr(e instanceof Error ? e.message : 'Erreur.'); setBusy(false); }
      }}>{label}</Button>
      {err && <span className="mt-1 text-mini text-erreur">{err}</span>}
    </span>
  );
}

interface Pasteur {
  id: string; nom: string; prenom: string; email: string; telephone: string | null; eglise: string | null; bio: string | null;
  is_active: boolean; en_attente?: boolean; created_by_admin: boolean; created_at: string; last_login_at: string | null;
  stats?: { parole: number; enseignement: number; document: number; contenu: number; vues: number; derniere_publication: string | null };
  derniere_activite?: { action: string; created_at: string } | null;
}

/* ------------------------------------------------------------------ Formulaire ajout / modification */
function PasteurForm({ p, onClose, onSaved }: { p: Pasteur | null; onClose: () => void; onSaved: (p: Pasteur, nouveau: boolean) => void }) {
  const [f, setF] = useState({ nom: p?.nom ?? '', prenom: p?.prenom ?? '', email: p?.email ?? '', telephone: p?.telephone ?? '', eglise: p?.eglise ?? '', bio: p?.bio ?? '', password: '' });
  const [msg, setMsg] = useState<AlertMsg | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((s) => ({ ...s, [k]: e.target.value }));
  async function save() {
    if (!p && f.password.length < 8) return setMsg({ kind: 'error', text: 'Le mot de passe provisoire doit contenir au moins 8 caractères.' });
    setBusy(true); setMsg(null);
    try {
      const { password, ...info } = f;
      const r = p
        ? await api<{ pastor: Pasteur }>(`pastors?id=${p.id}`, { method: 'PATCH', role: 'admin', body: { ...info, ...(password ? { new_password: password } : {}) } })
        : await api<{ pastor: Pasteur }>('pastors', { method: 'POST', role: 'admin', body: f });
      onSaved(r.pastor, !p);
    } catch (e) { setMsg({ kind: 'error', text: e instanceof Error ? e.message : 'Erreur.' }); }
    finally { setBusy(false); }
  }
  return (
    <Modal open onClose={onClose} title={p ? `Modifier · ${p.prenom} ${p.nom}`.trim() : 'Ajouter un guide spirituel'} wide
      footer={<><Button variant="secondary" onClick={onClose}>Annuler</Button><Button loading={busy} onClick={save}>{p ? 'Enregistrer' : 'Créer le compte'}</Button></>}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Nom *" value={f.nom} onChange={set('nom')} maxLength={60} />
        <Field label="Prénom *" value={f.prenom} onChange={set('prenom')} maxLength={60} />
        <Field label="Email *" type="email" value={f.email} onChange={set('email')} maxLength={160} />
        <Field label="Téléphone" type="tel" value={f.telephone} onChange={set('telephone')} maxLength={30} />
        <Field label="Église / ministère" value={f.eglise} onChange={set('eglise')} maxLength={120} className="sm:col-span-2" />
        <div className="sm:col-span-2"><TextArea label="Présentation" rows={3} value={f.bio} onChange={set('bio')} maxLength={1000} /></div>
        <Field label={p ? 'Nouveau mot de passe (facultatif)' : 'Mot de passe provisoire *'} type="password" value={f.password} onChange={set('password')} maxLength={128}
          hint={p ? 'Laissez vide pour ne pas le changer.' : 'Communiquez-le au guide spirituel : il pourra le changer dans ses paramètres.'} className="sm:col-span-2" />
        <div className="sm:col-span-2"><Alert msg={msg} /></div>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ Fiche d'un pasteur */
export function PastorDetail({ id }: { id: string }) {
  const { data, error, loading, reload } = useData<{ pastor: Pasteur; contents: Contenu[]; activites: { id: number; action: string; target_title: string | null; created_at: string }[] }>(`pastors?id=${id}`, 'admin');
  const [edit, setEdit] = useState(false);
  if (error) return <LoadError message={error} onRetry={reload} />;
  if (loading && !data) return <Skeleton className="h-96" />;
  if (!data) return null;
  const { pastor: p, contents, activites } = data;
  const n = (t: string) => contents.filter((c) => c.type === t).length;
  return (
    <div className="space-y-6">
      <button onClick={() => go('admin', 'pasteurs')} className="inline-flex items-center gap-2 text-[13.5px] font-semibold text-ink/60 hover:text-primary"><ArrowLeft className="h-4 w-4" /> Tous les guides spirituels</button>
      <Card>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <span className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl bg-primary font-serif text-2xl text-on-primary">{p.prenom[0]}{p.nom[0]}</span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2"><h1 className="text-2xl">{`${p.prenom} ${p.nom}`.trim()}</h1>
              <Badge tone={p.is_active ? 'actif' : p.en_attente ? 'attente' : 'rejet'}>{p.is_active ? 'Actif' : 'Inactif'}</Badge></div>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[13.5px] text-ink/65">
              <span className="inline-flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{p.email}</span>
              {p.telephone && <span className="inline-flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{p.telephone}</span>}
              {p.eglise && <span className="inline-flex items-center gap-1.5"><Church className="h-3.5 w-3.5" />{p.eglise}</span>}
              <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />Dernière connexion : {p.last_login_at ? depuis(p.last_login_at) : 'jamais'}</span>
            </div>
            {p.bio && <p className="mt-3 text-[14px] text-ink/70">{p.bio}</p>}
          </div>
          <div className="flex flex-wrap gap-2">
            <OuvrirEspace id={p.id} size="md" label="Ouvrir son espace" />
            <Button variant="secondary" icon={<Pencil className="h-4 w-4" />} onClick={() => setEdit(true)}>Modifier</Button>
          </div>
        </div>
      </Card>
      <StatGrid cols="sm:grid-cols-4" stats={[
        { label: 'Paroles de Dieu', value: n('parole'), icon: BookOpen }, { label: 'Enseignements', value: n('enseignement'), icon: GraduationCap },
        { label: 'Documents', value: n('document'), icon: FileText }, { label: 'Contenus spirituels', value: n('contenu'), icon: Sparkles },
      ]} />
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Card title={`Publications (${contents.length})`}>
          {!contents.length ? <p className="text-[14px] text-ink/55">Aucune publication.</p> : (
            <ul className="divide-y divide-ligne">
              {contents.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3 py-3">
                  <a href={hrefOf('contenu', c.id)} target="_blank" rel="noopener" className="min-w-0">
                    <p className="truncate text-[14px] font-semibold hover:text-primary">{c.title}</p>
                    <p className="text-mini text-ink/55">{TYPES[c.type].label} · {formatDateCourte(c.created_at)} · {c.views} vue{c.views > 1 ? 's' : ''}{c.has_file ? ` · ${c.file_name}` : ''}</p>
                  </a>
                  <div className="flex shrink-0 gap-1.5">{c.access === 'premium' ? <PremiumBadge small /> : <GratuitBadge small />}<Badge tone={c.is_published ? 'actif' : 'neutre'}>{c.is_published ? 'Publié' : 'Brouillon'}</Badge></div>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card title="Activités">
          {!activites.length ? <p className="text-[14px] text-ink/55">Aucune activité.</p> : (
            <ol className="relative space-y-4 border-l border-ligne pl-5">
              {activites.map((a) => (
                <li key={a.id} className="relative">
                  <span className="absolute -left-[26px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-fond" />
                  <p className="text-[14px]">{libelleAction(a.action)}{a.target_title ? <> « <strong>{a.target_title}</strong> »</> : ''}</p>
                  <p className="text-mini text-ink/50">{formatDate(a.created_at)} · {new Date(a.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>
      {edit && <PasteurForm p={p} onClose={() => setEdit(false)} onSaved={() => { setEdit(false); reload(); }} />}
    </div>
  );
}

/* ------------------------------------------------------------------ Liste des guides spirituels */
export function PastorsAdmin({ onChange }: { onChange: () => void }) {
  const { data, setData, error, loading, reload } = useData<{ pastors: Pasteur[] }>('pastors', 'admin');
  const [filtre, setFiltre] = useState<'tous' | 'actifs' | 'attente' | 'inactifs'>('tous');
  const [q, setQ] = useState('');
  const [form, setForm] = useState<Pasteur | 'nouveau' | null>(null);
  const [suppr, setSuppr] = useState<Pasteur | null>(null);
  const [flash, setFlash] = useState<AlertMsg | null>(null);
  const items = data?.pastors ?? [];
  const liste = useMemo(() => {
    const nq = normalize(q);
    return items.filter((p) => (filtre === 'tous' || (filtre === 'actifs' && p.is_active) || (filtre === 'attente' && p.en_attente) || (filtre === 'inactifs' && !p.is_active && !p.en_attente))
      && (!nq || normalize(`${p.nom} ${p.prenom} ${p.email} ${p.eglise ?? ''}`).includes(nq)));
  }, [items, filtre, q]);

  async function statut(p: Pasteur, is_active: boolean) {
    try {
      const r = await api<{ pastor: Pasteur }>(`pastors?id=${p.id}`, { method: 'PATCH', role: 'admin', body: { is_active } });
      setData({ pastors: items.map((x) => (x.id === p.id ? { ...x, ...r.pastor, en_attente: false } : x)) });
      setFlash({ kind: 'success', text: `${`${p.prenom} ${p.nom}`.trim()} : compte ${is_active ? 'activé' : 'désactivé'}.` }); onChange();
    } catch (e) { setFlash({ kind: 'error', text: e instanceof Error ? e.message : 'Erreur.' }); }
  }
  async function supprimer() {
    if (!suppr) return;
    try { await api(`pastors?id=${suppr.id}`, { method: 'DELETE', role: 'admin' }); setData({ pastors: items.filter((x) => x.id !== suppr.id) }); setFlash({ kind: 'success', text: 'Pasteur supprimé.' }); onChange(); }
    catch (e) { setFlash({ kind: 'error', text: e instanceof Error ? e.message : 'Erreur.' }); }
    finally { setSuppr(null); }
  }

  const actifs = items.filter((p) => p.is_active).length;
  return (
    <div>
      <PageHeader titre="Guides spirituels" texte="Validez les nouveaux comptes, suivez les publications et l’activité de chaque guide spirituel."
        actions={<Button icon={<UserPlus className="h-4 w-4" />} onClick={() => setForm('nouveau')} shine>Ajouter un guide spirituel</Button>} />
      <StatGrid cols="sm:grid-cols-4" stats={[
        { label: 'Guides inscrits', value: items.length, icon: Users }, { label: 'Guides actifs', value: actifs, icon: Check },
        { label: 'Paroles publiées', value: items.reduce((s, p) => s + (p.stats?.parole ?? 0), 0), icon: BookOpen },
        { label: 'Documents ajoutés', value: items.reduce((s, p) => s + (p.stats?.document ?? 0), 0), icon: FileText },
      ]} />
      <div className="my-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs id="filtre-pasteurs" value={filtre} onChange={setFiltre} options={[
          { value: 'tous', label: 'Tous' }, { value: 'actifs', label: 'Actifs' },
          { value: 'attente', label: 'À valider', badge: items.filter((p) => p.en_attente).length || undefined }, { value: 'inactifs', label: 'Désactivés' },
        ]} />
        <SearchInput value={q} onChange={setQ} placeholder="Nom, email, église…" />
      </div>
      <div className="mb-4"><Alert msg={flash} /></div>
      {error ? <LoadError message={error} onRetry={reload} /> : loading && !data ? <Skeleton className="h-64" /> : liste.length === 0 ? (
        <EmptyState icon={<Church className="h-6 w-6" />} title="Aucun guide spirituel" text="Ajoutez un guide spirituel ou attendez les inscriptions." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {liste.map((p, i) => (
            <motion.article key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 8) * 0.04 }}
              className="flex flex-col rounded-3xl bg-fond p-5 shadow-doux ring-1 ring-ligne">
              <div className="flex items-start gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary/10 font-serif text-primary">{p.prenom[0]}{p.nom[0]}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <button onClick={() => go('admin', 'pasteurs', p.id)} className="truncate text-left text-[16px] font-bold hover:text-primary">{`${p.prenom} ${p.nom}`.trim()}</button>
                    <Badge tone={p.is_active ? 'actif' : p.en_attente ? 'attente' : 'rejet'}>{p.is_active ? 'Actif' : p.en_attente ? 'À valider' : 'Désactivé'}</Badge>
                  </div>
                  <p className="truncate text-[13px] text-ink/55">{p.email}{p.eglise ? ` · ${p.eglise}` : ''}</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-4 gap-2 text-center">
                {([['parole', 'Paroles'], ['enseignement', 'Enseign.'], ['document', 'Docs'], ['contenu', 'Autres']] as const).map(([k, l]) => (
                  <div key={k} className="rounded-xl bg-surface py-2"><p className="font-serif text-lg leading-none">{p.stats?.[k] ?? 0}</p><p className="mt-1 text-mini text-ink/55">{l}</p></div>
                ))}
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-y-1 text-[12.5px]">
                <dt className="text-ink/50">Inscription</dt><dd>{formatDateCourte(p.created_at)}</dd>
                <dt className="text-ink/50">Dernière connexion</dt><dd>{p.last_login_at ? depuis(p.last_login_at) : 'jamais'}</dd>
                <dt className="text-ink/50">Dernière publication</dt><dd>{p.stats?.derniere_publication ? depuis(p.stats.derniere_publication) : '—'}</dd>
                <dt className="text-ink/50">Dernière activité</dt><dd className="truncate">{p.derniere_activite ? `${libelleAction(p.derniere_activite.action)} · ${depuis(p.derniere_activite.created_at)}` : '—'}</dd>
              </dl>
              <div className="mt-4 flex flex-wrap gap-2">
                {!p.is_active && <Button size="sm" icon={<Check className="h-3.5 w-3.5" />} onClick={() => statut(p, true)}>{p.en_attente ? 'Valider' : 'Activer'}</Button>}
                {p.is_active && <Button size="sm" variant="secondary" icon={<Power className="h-3.5 w-3.5" />} onClick={() => statut(p, false)}>Désactiver</Button>}
                <OuvrirEspace id={p.id} />
                <Button size="sm" variant="ghost" onClick={() => go('admin', 'pasteurs', p.id)}>Profil & activités</Button>
                <Button size="sm" variant="ghost" icon={<Pencil className="h-3.5 w-3.5" />} onClick={() => setForm(p)}>Modifier</Button>
                <Button size="sm" variant="ghost" icon={<Trash2 className="h-3.5 w-3.5" />} onClick={() => setSuppr(p)}>Supprimer</Button>
              </div>
            </motion.article>
          ))}
        </div>
      )}
      {form && <PasteurForm p={form === 'nouveau' ? null : form} onClose={() => setForm(null)} onSaved={(np, nouveau) => {
        setForm(null); reload(); onChange();
        setFlash({ kind: 'success', text: nouveau ? `Compte de ${`${np.prenom} ${np.nom}`.trim()} créé et actif.` : 'Guide spirituel modifié.' });
      }} />}
      <ConfirmDialog open={!!suppr} onClose={() => setSuppr(null)} onConfirm={supprimer} danger title="Supprimer ce guide spirituel ?" confirmLabel="Supprimer"
        message={<>Le compte de <strong>{suppr?.prenom} {suppr?.nom}</strong>, ses publications et ses fichiers seront supprimés définitivement.</>} />
    </div>
  );
}

/**
 * « Ajouter un livre » depuis l'administration : ouvre l'espace de Jean (ou du premier guide actif)
 * directement sur une nouvelle publication de type Document.
 */
export function AjouterLivre({ label = 'Ajouter un livre ou un document' }: { label?: string }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  async function ouvrir() {
    setBusy(true); setErr(null);
    try {
      const { pastors } = await api<{ pastors: Pasteur[] }>('pastors', { role: 'admin' });
      const guide = pastors.find((p) => p.email === 'equipe@ameetvie.org') ?? pastors.find((p) => p.is_active) ?? pastors[0];
      if (!guide) { setErr('Aucun guide spirituel : ajoutez-en un dans « Guides spirituels ».'); setBusy(false); return; }
      await ouvrirEspaceGuide(guide.id, 'nouveau', 'document');
    } catch (e) { setErr(e instanceof Error ? e.message : 'Erreur.'); setBusy(false); }
  }
  return (
    <span className="inline-flex flex-col items-start">
      <Button icon={<BookOpen className="h-4 w-4" />} loading={busy} onClick={ouvrir} shine>{label}</Button>
      {err && <span className="mt-1 text-mini text-erreur">{err}</span>}
    </span>
  );
}
