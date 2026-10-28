import { useEffect, useRef, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, Crown, FileUp, Globe, Lock, Save, Send, Trash2, UploadCloud } from 'lucide-react';
import { api } from '@/lib/api';
import type { Role } from '@/lib/session';
import { CATEGORIES, RELIGIONS, TYPES, tailleFichier, type Contenu, type Religion, type TypeContenu } from '@/lib/contenus';
import { Field, SelectField, TextArea } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { Alert, type AlertMsg } from '@/components/ui/Alert';
import { Skeleton } from '@/components/ui/Empty';
import { Card } from './Widgets';

const ACCEPT = '.pdf,.epub,.doc,.docx,.ppt,.pptx,.mp3,.m4a,.wav,.mp4,.jpg,.jpeg,.png,.webp,.txt';
/** Type du fichier d'après son extension (certains navigateurs ne le donnent pas, surtout sous Windows). */
const TYPES_EXT: Record<string, string> = {
  pdf: 'application/pdf', epub: 'application/epub+zip', doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ppt: 'application/vnd.ms-powerpoint', pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  mp3: 'audio/mpeg', m4a: 'audio/mp4', wav: 'audio/wav', mp4: 'video/mp4',
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', txt: 'text/plain',
};
function typeDe(file: File): string {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  return TYPES_EXT[ext] ?? file.type ?? '';
}
const MAX = 50 * 1024 * 1024;

interface Fichier { file_url: string; file_name: string; file_type: string; file_size: number }

/** Envoie un fichier directement vers Supabase Storage (lien signé), avec progression. */
function envoyer(url: string, file: File, onProgress: (p: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url);
    xhr.setRequestHeader('Content-Type', typeDe(file) || 'application/octet-stream');
    xhr.setRequestHeader('x-upsert', 'false');
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) return resolve();
      const refus = xhr.status === 400 || xhr.status === 413 || xhr.status === 415;
      reject(new Error(refus
        ? `Le stockage a refusé ce fichier (code ${xhr.status}) : format ou taille non autorisés. Ré-exécutez le script supabase/schema.sql pour mettre à jour les formats acceptés.`
        : `L'envoi du fichier a échoué (code ${xhr.status}). Réessayez.`));
    };
    xhr.onerror = () => reject(new Error("L'envoi du fichier a échoué (connexion)."));
    xhr.send(file);
  });
}

/**
 * Formulaire de publication (pasteur) ou de modification (pasteur / administrateur).
 * Simple : choisir un type, remplir, choisir Gratuit / Premium, publier.
 */
export function ContentEditor({ role, contentId, initialType = 'parole', pastorId, onDone }: {
  role: Role; contentId?: string; initialType?: TypeContenu; pastorId?: string; onDone: (c: Contenu, message: string) => void;
}) {
  const [type, setType] = useState<TypeContenu>(initialType);
  const [f, setF] = useState({ title: '', description: '', content: '', bible_ref: '', category: '', religion: 'chretien' as Religion, video_url: '', access: 'gratuit' as 'gratuit' | 'premium', is_published: true });
  const [fichier, setFichier] = useState<Fichier | null>(null);
  const [aFichierExistant, setAFichierExistant] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [msg, setMsg] = useState<AlertMsg | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!contentId);
  const [owner, setOwner] = useState(pastorId);
  const input = useRef<HTMLInputElement>(null);

  // Chargement d'une publication existante
  useEffect(() => {
    if (!contentId) return;
    api<{ content: Contenu }>(`contents?id=${contentId}`, { role }).then(({ content: c }) => {
      setType(c.type);
      setOwner(c.pastor_id);
      setF({
        title: c.title, description: c.description ?? '', content: c.content ?? '', bible_ref: c.bible_ref ?? '', category: c.category ?? '', religion: c.religion ?? 'chretien',
        video_url: c.video_url ?? '', access: c.access, is_published: c.is_published,
      });
      setAFichierExistant(c.has_file);
      if (c.has_file) setFichier({ file_url: '', file_name: c.file_name ?? 'Fichier', file_type: c.file_type ?? '', file_size: c.file_size ?? 0 });
    }).catch((e) => setMsg({ kind: 'error', text: e.message })).finally(() => setLoading(false));
  }, [contentId, role]);

  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((s) => ({ ...s, [k]: e.target.value }));

  async function choisirFichier(file?: File | null) {
    if (!file) return;
    if (file.size > MAX) return setMsg({ kind: 'error', text: 'Le fichier doit faire moins de 50 Mo.' });
    const mime = typeDe(file);
    if (!Object.values(TYPES_EXT).includes(mime)) return setMsg({ kind: 'error', text: 'Format non accepté. Utilisez un PDF, un EPUB, un document Word ou PowerPoint, un audio, une vidéo MP4, une image ou un texte.' });
    setMsg(null); setProgress(0);
    try {
      const { path, signedUrl } = await api<{ path: string; signedUrl: string }>('files', {
        method: 'POST', role, body: { name: file.name, type: mime, size: file.size, ...(role === 'admin' ? { pastor_id: owner } : {}) },
      });
      await envoyer(signedUrl, file, setProgress);
      setFichier({ file_url: path, file_name: file.name, file_type: mime, file_size: file.size });
      if (!f.title) setF((s) => ({ ...s, title: file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ') }));
    } catch (e) {
      setMsg({ kind: 'error', text: e instanceof Error ? e.message : 'Erreur.' });
    } finally { setProgress(null); }
  }

  async function submit(e?: FormEvent, publier = f.is_published) {
    e?.preventDefault();
    if (f.title.trim().length < 2) return setMsg({ kind: 'error', text: 'Indiquez un titre.' });
    if (type === 'parole' && (!f.content.trim() || !f.bible_ref.trim())) return setMsg({ kind: 'error', text: 'Indiquez le texte du verset et sa référence.' });
    if (type === 'document' && !fichier) return setMsg({ kind: 'error', text: 'Ajoutez le fichier du document.' });
    const body: Record<string, unknown> = {
      title: f.title, description: f.description || null, content: f.content || null, bible_ref: f.bible_ref || null,
      category: f.category || null, religion: f.religion, video_url: f.video_url || null, access: f.access, is_published: publier,
    };
    // Fichier : nouveau → envoyé ; retiré → null ; inchangé → non envoyé
    if (fichier?.file_url) Object.assign(body, fichier);
    else if (!fichier && aFichierExistant) body.file_url = null;
    setSaving(true); setMsg(null);
    try {
      if (contentId) {
        const r = await api<{ content: Contenu }>(`contents?id=${contentId}`, { method: 'PATCH', role, body });
        onDone(r.content, 'Modifications enregistrées.');
      } else {
        const r = await api<{ content: Contenu; message: string }>('contents', { method: 'POST', role, body: { ...body, type } });
        onDone(r.content, r.message);
      }
    } catch (err) {
      setMsg({ kind: 'error', text: err instanceof Error ? err.message : 'Erreur.' });
    } finally { setSaving(false); }
  }

  if (loading) return <Skeleton className="h-96" />;

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        {/* Type de publication */}
        {!contentId && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(Object.keys(TYPES) as TypeContenu[]).map((t) => {
              const T = TYPES[t]; const on = t === type;
              return (
                <motion.button type="button" key={t} onClick={() => setType(t)} whileTap={{ scale: 0.97 }}
                  className={`relative rounded-2xl p-4 text-left transition ${on ? 'bg-primary text-on-primary shadow-doux' : 'bg-fond ring-1 ring-ligne hover:ring-primary/40'}`}>
                  <T.icon className="h-5 w-5" />
                  <p className="mt-3 text-[14px] font-bold">{T.label}</p>
                  <p className={`mt-0.5 text-mini ${on ? 'opacity-80' : 'text-ink/55'}`}>{T.description}</p>
                </motion.button>
              );
            })}
          </div>
        )}

        <Card>
          <div className="space-y-4">
            <Field label="Titre *" value={f.title} onChange={set('title')} maxLength={160} placeholder={type === 'parole' ? 'Ex. La paix qui surpasse toute intelligence' : 'Titre de la publication'} />
            <div>
              <span className="mb-1.5 block text-[13px] font-semibold text-ink/80">Religion / tradition</span>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(RELIGIONS) as Religion[]).map((r) => (
                  <button key={r} type="button" onClick={() => setF((s) => ({ ...s, religion: r }))} aria-pressed={f.religion === r}
                    className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-[13.5px] font-semibold ring-1 transition ${f.religion === r ? `${RELIGIONS[r].bg} text-white ring-transparent` : 'bg-fond ring-ligne hover:ring-ink/30'}`}>
                    <span aria-hidden>{RELIGIONS[r].symbole}</span> {RELIGIONS[r].label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={type === 'parole' ? 'Référence *' : 'Référence'} value={f.bible_ref} onChange={set('bible_ref')} maxLength={120}
                placeholder={f.religion === 'musulman' ? 'Ex. Coran 2:255' : f.religion === 'universel' ? 'Ex. Marc Aurèle, Pensées' : 'Ex. Jean 3:16'} />
              <SelectField label="Catégorie" value={f.category} onChange={set('category')}>
                <option value="">— Aucune —</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </SelectField>
            </div>
            <TextArea label="Description courte" hint="Visible par tous, même sur un contenu Premium." value={f.description} onChange={set('description')} maxLength={500} rows={2} />
            <TextArea label={type === 'parole' ? 'Texte du verset et méditation *' : type === 'document' ? 'Présentation du document' : 'Texte'} value={f.content} onChange={set('content')} maxLength={50000} rows={type === 'document' ? 4 : 10} />
            {type === 'enseignement' && (
              <Field label="Lien vidéo (YouTube, Vimeo…)" type="url" value={f.video_url} onChange={set('video_url')} maxLength={300} placeholder="https://www.youtube.com/watch?v=…" hint="Un texte ou un lien vidéo est nécessaire." />
            )}
          </div>
        </Card>

        {/* Fichier */}
        <Card title={type === 'document' ? 'Fichier du document *' : 'Fichier joint (facultatif)'}>
          <AnimatePresence mode="wait">
            {fichier ? (
              <motion.div key="f" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-4 rounded-2xl bg-surface p-4">
                <CheckCircle2 className="h-6 w-6 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{fichier.file_name}</p>
                  <p className="text-mini text-ink/55">{tailleFichier(fichier.file_size)}{fichier.file_url ? ' · prêt' : ' · déjà en ligne'}</p>
                </div>
                <Button type="button" size="sm" variant="ghost" icon={<Trash2 className="h-3.5 w-3.5" />} onClick={() => setFichier(null)}>Retirer</Button>
              </motion.div>
            ) : (
              <motion.button key="u" type="button" onClick={() => input.current?.click()} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); choisirFichier(e.dataTransfer.files[0]); }}
                className="flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-ligne p-8 text-center transition hover:border-primary/50">
                {progress !== null ? (
                  <>
                    <UploadCloud className="h-7 w-7 animate-pulse text-primary" />
                    <p className="text-[14px] font-semibold">Envoi… {Math.round(progress * 100)} %</p>
                    <span className="h-1.5 w-48 overflow-hidden rounded-full bg-surface"><span className="block h-full bg-primary transition-[width]" style={{ width: `${progress * 100}%` }} /></span>
                  </>
                ) : (
                  <>
                    <FileUp className="h-7 w-7 text-primary" />
                    <p className="text-[14px] font-semibold">Choisir ou déposer un fichier</p>
                    <p className="text-mini text-ink/55">PDF, EPUB, Word, PowerPoint, audio, vidéo MP4, image · 50 Mo maximum</p>
                  </>
                )}
              </motion.button>
            )}
          </AnimatePresence>
          <input ref={input} type="file" accept={ACCEPT} hidden onChange={(e) => { choisirFichier(e.target.files?.[0]); e.target.value = ''; }} />
        </Card>
      </div>

      {/* Colonne de publication */}
      <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
        <Card title="Accès">
          <div className="grid grid-cols-2 gap-2">
            {([['gratuit', 'Gratuit', Globe, 'Visible par tous'], ['premium', 'Premium', Crown, 'Abonnés uniquement']] as const).map(([v, l, I, d]) => (
              <button type="button" key={v} onClick={() => setF((s) => ({ ...s, access: v }))}
                className={`rounded-2xl p-3 text-left transition ${f.access === v ? 'bg-primary text-on-primary' : 'bg-surface hover:bg-ligne/60'}`}>
                <I className="h-4 w-4" /><p className="mt-2 text-[14px] font-bold">{l}</p><p className="text-mini opacity-75">{d}</p>
              </button>
            ))}
          </div>
          {f.access === 'premium' && <p className="mt-3 flex items-center gap-1.5 text-mini text-ink/60"><Lock className="h-3.5 w-3.5" /> Texte, vidéo et fichier réservés aux abonnés (contrôle serveur).</p>}
        </Card>
        <Card>
          <div className="space-y-3">
            <Alert msg={msg} />
            <Button type="button" className="w-full" shine loading={saving} disabled={progress !== null} icon={<Send className="h-4 w-4" />} onClick={() => submit(undefined, true)}>
              {contentId ? 'Enregistrer et publier' : 'Publier'}
            </Button>
            <Button type="button" variant="secondary" className="w-full" loading={saving} disabled={progress !== null} icon={<Save className="h-4 w-4" />} onClick={() => submit(undefined, false)}>
              Enregistrer en brouillon
            </Button>
            {contentId && <p className="text-center text-mini text-ink/50">Statut actuel : {f.is_published ? 'publié' : 'brouillon / non publié'}</p>}
          </div>
        </Card>
      </div>
    </form>
  );
}
