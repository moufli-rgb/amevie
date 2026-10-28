/** Libellés des statuts de paiement crypto. */
export const STATUTS_PAIEMENT: Record<string, { label: string; tone: 'actif' | 'attente' | 'neutre' | 'rejet' }> = {
  paye: { label: 'Payé', tone: 'actif' },
  en_attente: { label: 'En attente', tone: 'neutre' },
  en_cours: { label: 'Confirmation…', tone: 'attente' },
  partiel: { label: 'Paiement partiel', tone: 'attente' },
  a_verifier: { label: 'À vérifier', tone: 'attente' },
  echoue: { label: 'Échoué', tone: 'rejet' },
  expire: { label: 'Expiré', tone: 'rejet' },
  a_valider: { label: 'À valider', tone: 'attente' },
  refuse: { label: 'Refusé', tone: 'rejet' },
};
