/** Informations de la plateforme — modifiables ici. */
export const SITE = {
  nom: 'Ame & Vie',
  slogan: 'Nourrir l’âme, éclairer la vie',
  description: 'Paroles de Dieu, enseignements, documents et accompagnement spirituel, publiés par des pasteurs.',
  /** Numéro WhatsApp des abonnements (format international, sans + ni espaces) */
  whatsapp: '2250759399566',
  whatsappAffiche: '+225 07 59 39 95 66',
  messageAbonnement: 'Bonjour, je souhaite faire mon abonnement sur la plateforme Ame & Vie.',
  dureeAbonnement: '1 mois',
  versetSecours: {
    texte: 'Ta parole est une lampe à mes pieds, et une lumière sur mon sentier.',
    reference: 'Psaume 119:105',
  },
} as const;

/** Lien WhatsApp avec message automatique (et l'email du compte s'il est connu). */
export function lienWhatsApp(email?: string | null) {
  const msg = email ? `${SITE.messageAbonnement}\nMon compte : ${email}` : SITE.messageAbonnement;
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(msg)}`;
}
