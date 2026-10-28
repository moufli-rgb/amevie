import { useEffect, useState } from 'react';
import { CalendarPlus, Crown, Pencil, Power, RotateCcw, Zap } from 'lucide-react';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/format';
import type { Abonnement } from '@/lib/session';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Field, SelectField, TextArea } from '@/components/ui/Field';
import { Alert, type AlertMsg } from '@/components/ui/Alert';
import { Tabs } from '@/dashboard/Widgets';

export type StatutAbo = 'actif' | 'expire' | 'desactive' | 'aucun';
export const STATUT_ABO: Record<StatutAbo, { label: string; tone: 'actif' | 'rejet' | 'neutre' | 'attente' }> = {
  actif: { label: 'Actif', tone: 'actif' },
  expire: { label: 'Expiré', tone: 'rejet' },
  desactive: { label: 'Désactivé', tone: 'neutre' },
  aucun: { label: 'Aucun', tone: 'attente' },
};
export function StatutAboBadge({ s }: { s: StatutAbo }) {
  return <Badge tone={STATUT_ABO[s].tone}>{STATUT_ABO[s].label}</Badge>;
}

export const TYPES_PAR_DEFAUT = ['Mensuel', 'Trimestriel', 'Semestriel', 'Annuel', 'Famille', 'Offert'];
/** Durée suggérée selon le type choisi. */
export const DUREE_TYPE: Record<string, number> = { Mensuel: 1, Trimestriel: 3, Semestriel: 6, Annuel: 12, Famille: 1, Offert: 1 };

/**
 * Panneau de gestion de l'abonnement d'un visiteur :
 * activer / renouveler, prolonger, modifier (type, durée, date d'expiration), désactiver, réactiver.
 */
export function SubscriptionPanel({ userId, abonnement, types = TYPES_PAR_DEFAUT, onChange }: {
  userId: string; abonnement: Abonnement & { id?: string | null }; types?: readonly string[]; onChange: (a: Abonnement) => void;
}) {
  const actif = abonnement.statut === 'actif';
  const aUnAbo = abonnement.statut !== 'aucun' && !!abonnement.id;
  type Mode = 'activer' | 'prolonger' | 'modifier';
  const [mode, setMode] = useState<Mode>(actif ? 'prolonger' : 'activer');
  const [type, setType] = useState(abonnement.type ?? 'Mensuel');
  const [duree, setDuree] = useState(1);
  const [fin, setFin] = useState(abonnement.date_expiration?.slice(0, 10) ?? '');
  const [note, setNote] = useState('');
  const [msg, setMsg] = useState<AlertMsg | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { setMode(actif ? 'prolonger' : 'activer'); setType(abonnement.type ?? 'Mensuel'); setFin(abonnement.date_expiration?.slice(0, 10) ?? ''); }, [abonnement, actif]);

  async function run(fn: () => Promise<{ abonnement: Abonnement }>, ok: string) {
    setBusy(true); setMsg(null);
    try { const r = await fn(); onChange(r.abonnement); setMsg({ kind: 'success', text: ok }); }
    catch (e) { setMsg({ kind: 'error', text: e instanceof Error ? e.message : 'Erreur.' }); }
    finally { setBusy(false); }
  }
  const activer = () => run(() => api('subscriptions', { method: 'POST', role: 'admin', body: { user_id: userId, type, duration_months: duree, note: note || undefined } }),
    `Accès Premium activé pour ${duree} mois.`);
  const patch = (body: Record<string, unknown>, ok: string) => run(() => api(`subscriptions?id=${abonnement.id}`, { method: 'PATCH', role: 'admin', body }), ok);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-surface p-4">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent/20"><Crown className="h-5 w-5" /></span>
          <div>
            <p className="text-[14px] font-bold">{abonnement.type ?? 'Aucun abonnement'} {abonnement.duree_mois ? `· ${abonnement.duree_mois} mois` : ''}</p>
            <p className="text-mini text-ink/60">
              {abonnement.date_debut ? <>Du {formatDate(abonnement.date_debut)} au <strong>{formatDate(abonnement.date_expiration)}</strong></> : 'Jamais abonné'}
              {actif ? ` · ${abonnement.jours_restants} j restants` : ''}
            </p>
          </div>
        </div>
        <StatutAboBadge s={abonnement.statut} />
      </div>

      <Tabs id={`abo-${userId}`} value={mode} onChange={setMode} options={[
        { value: 'activer', label: aUnAbo ? 'Renouveler' : 'Activer l’accès' },
        ...(aUnAbo ? [{ value: 'prolonger' as Mode, label: 'Prolonger' }, { value: 'modifier' as Mode, label: 'Modifier' }] : []),
      ]} />

      {mode === 'activer' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <SelectField label="Type d’abonnement" value={type} onChange={(e) => { setType(e.target.value); setDuree(DUREE_TYPE[e.target.value] ?? 1); }}>
              {types.map((t) => <option key={t}>{t}</option>)}
            </SelectField>
            <Field label="Durée (mois)" type="number" min={1} max={36} value={duree} onChange={(e) => setDuree(Math.max(1, Math.min(36, Number(e.target.value) || 1)))} />
          </div>
          <TextArea label="Note (facultatif)" rows={2} value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} placeholder="Ex. Paiement Mobile Money reçu le…" />
          <p className="text-mini text-ink/55">Début aujourd’hui · fin le même jour dans {duree} mois. {actif && 'L’abonnement actif actuel sera remplacé.'}</p>
          <Button loading={busy} icon={<Zap className="h-4 w-4" />} onClick={activer} shine>{aUnAbo ? 'Renouveler l’abonnement' : 'Activer l’accès Premium'}</Button>
        </div>
      )}

      {mode === 'prolonger' && aUnAbo && (
        <div className="space-y-3">
          <p className="text-[14px] text-ink/70">Ajoute des mois à partir de la date de fin {actif ? 'actuelle' : '(ou d’aujourd’hui si l’abonnement est expiré)'}.</p>
          <div className="flex flex-wrap gap-2">
            {[1, 3, 6, 12].map((m) => (
              <Button key={m} variant={m === 1 ? 'primary' : 'secondary'} loading={busy} icon={<CalendarPlus className="h-4 w-4" />}
                onClick={() => patch({ action: 'prolonger', duration_months: m }, `Abonnement prolongé de ${m} mois.`)}>+{m} mois</Button>
            ))}
          </div>
        </div>
      )}

      {mode === 'modifier' && aUnAbo && (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <SelectField label="Type d’abonnement" value={type} onChange={(e) => setType(e.target.value)}>
              {types.map((t) => <option key={t}>{t}</option>)}
            </SelectField>
            <Field label="Date d’expiration" type="date" value={fin} onChange={(e) => setFin(e.target.value)} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button loading={busy} icon={<Pencil className="h-4 w-4" />} onClick={() => patch({ action: 'modifier', type, end_date: fin || undefined }, 'Abonnement modifié.')}>Enregistrer</Button>
            {abonnement.statut === 'desactive'
              ? <Button variant="secondary" loading={busy} icon={<RotateCcw className="h-4 w-4" />} onClick={() => patch({ action: 'reactiver' }, 'Abonnement réactivé.')}>Réactiver</Button>
              : <Button variant="danger" loading={busy} icon={<Power className="h-4 w-4" />} onClick={() => patch({ action: 'desactiver' }, 'Accès Premium désactivé.')}>Désactiver l’accès</Button>}
          </div>
        </div>
      )}
      {mode === 'prolonger' && aUnAbo && abonnement.statut !== 'desactive' && (
        <Button variant="ghost" size="sm" loading={busy} icon={<Power className="h-3.5 w-3.5" />} onClick={() => patch({ action: 'desactiver' }, 'Accès Premium désactivé.')}>Désactiver l’accès</Button>
      )}
      <Alert msg={msg} />
    </div>
  );
}

/** Libellés lisibles du journal d'activité. */
const ACTIONS: Record<string, string> = {
  inscription_visiteur: 's’est inscrit(e)', inscription_pasteur: 'a créé un compte de guide spirituel', connexion: 's’est connecté(e)',
  publication_parole: 'a publié une Parole de Dieu', publication_enseignement: 'a publié un enseignement', publication_document: 'a ajouté un document',
  publication_contenu: 'a publié un contenu spirituel', modification_parole: 'a modifié une Parole de Dieu', modification_enseignement: 'a modifié un enseignement',
  modification_document: 'a modifié un document', modification_contenu: 'a modifié un contenu', suppression_parole: 'a supprimé une Parole de Dieu',
  suppression_enseignement: 'a supprimé un enseignement', suppression_document: 'a supprimé un document', suppression_contenu: 'a supprimé un contenu',
  moderation_contenu: 'a modéré une publication', telechargement: 'a téléchargé un document', demande_priere: 'a demandé une prière',
  priere_en_priere: 'a pris en charge une prière', priere_exaucee: 'a marqué une prière exaucée', priere_nouvelle: 'a remis une prière en attente',
  activation_abonnement: 'a activé un abonnement', renouvellement_abonnement: 'a renouvelé un abonnement', abonnement_prolonger: 'a prolongé un abonnement',
  abonnement_modifier: 'a modifié un abonnement', abonnement_desactiver: 'a désactivé un abonnement', abonnement_reactiver: 'a réactivé un abonnement',
  activation_compte: 'a activé un compte', desactivation_compte: 'a désactivé un compte', modification_compte: 'a modifié un compte', suppression_compte: 'a supprimé un compte',
  ajout_pasteur: 'a ajouté un guide spirituel', activation_pasteur: 'a activé un guide spirituel', desactivation_pasteur: 'a désactivé un guide spirituel',
  modification_pasteur: 'a modifié un guide spirituel', suppression_pasteur: 'a supprimé un guide spirituel', profil_modifie: 'a modifié son profil', mot_de_passe_modifie: 'a changé son mot de passe',
  acces_espace_guide: 'a ouvert l’espace d’un guide spirituel', paiement_demande: 'a lancé un paiement crypto', paiement_crypto: 'a payé son abonnement en crypto', paiement_manuel_declare: 'a déclaré un paiement crypto', paiement_valide: 'a validé un paiement', paiement_refuse: 'a refusé un paiement', portefeuilles_modifies: 'a modifié les adresses de paiement',
};
export const libelleAction = (a: string) => ACTIONS[a] ?? a.replace(/_/g, ' ');

export interface Activite { id: number; user_id: string | null; actor_role: string; actor_name: string | null; action: string; target_title: string | null; created_at: string }
