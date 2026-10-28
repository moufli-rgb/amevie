/** Informations de la plateforme — modifiables ici. */
export const SITE = {
  nom: 'Ame & Vie',
  slogan: 'Nourrir l’âme, éclairer la vie',
  description: 'Paroles sacrées, enseignements, livres et accompagnement spirituel : chrétiens, musulmans et sagesses universelles, publiés par nos guides spirituels.',
  /** Paiement de l'abonnement : cryptomonnaie (NOWPayments). Le prix se règle dans Vercel (PRIX_ABONNEMENT). */
  paiement: 'cryptomonnaie',
  dureeAbonnement: '1 mois',
  versetSecours: {
    texte: 'Ta parole est une lampe à mes pieds, et une lumière sur mon sentier.',
    reference: 'Psaume 119:105',
  },
} as const;
