import {
  User,
  UserProfile,
  Prayer,
  ResourceArticle,
  ResourceVideo,
  ResourceAudio,
  CommunityPost,
  SubscriptionPlan,
  UserSubscription,
  PaymentTransaction,
  NotificationItem,
  AdminLog,
  EmailCampaign,
} from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'u-1',
    name: 'Marie Dupont',
    email: 'marie@ameetvie.com',
    phone: '+229 01 23 45 67',
    role: 'member',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=256',
    createdAt: '2026-01-15',
    status: 'active',
  },
  {
    id: 'u-2',
    name: 'Guide Jean',
    email: 'admin@ameetvie.com',
    phone: '+229 01 98 76 54',
    role: 'admin',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
    createdAt: '2025-10-01',
    status: 'active',
  },
  {
    id: 'u-3',
    name: 'Sarah K.',
    email: 'sarah.k@gmail.com',
    phone: '+33 6 12 34 56 78',
    role: 'member',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
    createdAt: '2026-02-10',
    status: 'active',
  },
  {
    id: 'u-4',
    name: 'Daniel A.',
    email: 'daniel.a@gmail.com',
    phone: '+225 07 45 89 12',
    role: 'member',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256',
    createdAt: '2026-03-01',
    status: 'active',
  },
  {
    id: 'u-5',
    name: 'Grace Mensah',
    email: 'grace.m@outlook.com',
    phone: '+233 24 567 8901',
    role: 'member',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256',
    createdAt: '2026-04-12',
    status: 'active',
  },
];

export const INITIAL_USER_PROFILE: UserProfile = {
  userId: 'u-1',
  bio: 'Passionnée par la prière, la méditation et l\'élévation spirituelle. Membre engagée.',
  church: 'Communauté Âme & Vie',
  spiritualCommunity: 'Communauté Âme & Vie',
  preferredTradition: 'Chrétienne',
  country: 'Bénin',
  city: 'Cotonou',
  prayerStreakDays: 7,
  lastPrayerDate: '2026-10-12',
};

export const INITIAL_PRAYERS: Prayer[] = [
  {
    id: 'p-1',
    title: 'Prière du matin',
    description: 'Seigneur, merci pour ce nouveau jour et le souffle de vie renouvelé.',
    content: `Père céleste,
En ce matin nouveau, je viens devant Toi avec un coeur rempli de reconnaissance pour le souffle de vie que Tu m'accordes. Merci pour Tes compassions qui se renouvellent chaque matin.

Accorde-moi aujourd'hui la sagesse pour prendre de bonnes décisions, la force pour surmonter les défis et la paix qui surpasse toute intelligence. Que chacune de mes paroles, de mes pensées et de mes actions glorifie Ton saint nom.

Garde mes pas sur le chemin de la vérité, protège ma famille et fais de moi un instrument de paix et de bénédiction pour tous ceux que je croiserai aujourd'hui.

Au nom puissant de Jésus-Christ. Amen.`,
    scriptureRef: 'Lamentations 3:22-23',
    scriptureText: 'Les bontés de l’Éternel ne sont pas épuisées, ses compassions ne sont pas à leur terme; elles se renouvellent chaque matin.',
    category: 'Matin',
    tradition: 'Chrétienne',
    date: 'Aujourd\'hui',
    audioDuration: '3 min',
    likesCount: 142,
    readTime: '2 min',
    author: 'Guide Jean',
    isDailyFeatured: true,
  },
  {
    id: 'p-2',
    title: 'Prière du midi',
    description: 'Protège-moi dans mes activités et garde mon coeur centré sur Toi au milieu des occupations.',
    content: `Seigneur mon Dieu,
Au milieu de cette journée et dans le tourbillon de mes occupations, je m'arrête un instant pour élever mes yeux vers Toi. Tu es mon rocher, ma forteresse et mon appui constant.

Renouvelle mes forces physiques et spirituelles. Chasse toute anxiété, tout stress et toute précipitation. Donne-moi de travailler avec intégrité, patience et bienveillance envers mes collègues et mon entourage.

Que Ta présence demeure tangible dans chaque tâche que j'accomplis. Remplis-moi de Ta paix et conduis mes pensées selon Ta justice.

Par Jésus-Christ notre Seigneur. Amen.`,
    scriptureRef: 'Psaume 121:2',
    scriptureText: 'Le secours me vient de l’Éternel, qui a fait les cieux et la terre.',
    category: 'Midi',
    tradition: 'Chrétienne',
    date: 'Aujourd\'hui',
    audioDuration: '2 min',
    likesCount: 89,
    readTime: '2 min',
    author: 'Équipe Âme & Vie',
  },
  {
    id: 'p-3',
    title: 'Prière du soir',
    description: 'Merci pour ta fidélité tout au long de la journée et pour Ta protection sans faille.',
    content: `Seigneur bien-aimé,
Le soir venu, mon âme s'apaise et Te bénit. Merci pour Tes bienfaits visibles et invisibles répandus sur ma vie tout au long de ce jour. Merci pour Ta protection sur la route, au travail et dans mon foyer.

Si j'ai péché en pensée, en parole ou par omission, pardonne-moi par le sang précieux de Jésus. Lave mon coeur et guéris mes blessures.

Je dépose à Tes pieds mes fardeaux, mes inquiétudes et mes questionnements. Tu es le Maître des temps et des circonstances, et je sais que Tu veilles sur moi.

Bénis cette soirée dans la paix de Ton Esprit. Amen.`,
    scriptureRef: 'Psaume 4:8',
    scriptureText: 'Je me couche et je m’endors en paix, car toi seul, ô Éternel! tu me fais habiter en sécurité.',
    category: 'Soir',
    tradition: 'Chrétienne',
    date: 'Aujourd\'hui',
    audioDuration: '4 min',
    likesCount: 115,
    readTime: '3 min',
    author: 'Guide Jean',
  },
  {
    id: 'p-4',
    title: 'Prière de la nuit',
    description: 'Entre tes mains, je remets ma nuit et je reçois un sommeil doux et réparateur.',
    content: `Père très saint,
Alors que le silence s'installe, je m'en remets entièrement à Ta garde. Toi qui ne sommeilles ni ne dors, veille sur mon sommeil et garde ma maison de tout mal.

Apaise mon esprit, éloigne les cauchemars et les tourments de l'ennemi. Que Tes anges campent autour de notre demeure. Que cette nuit soit un temps de repos profond, de ressourcement et de guérison divine.

Réveille-moi demain avec un coeur vibrant de reconnaissance pour Te servir à nouveau.

En Jésus-Christ. Amen.`,
    scriptureRef: 'Proverbes 3:24',
    scriptureText: 'Si tu te couches, tu seras sans crainte; et quand tu seras couché, ton sommeil sera doux.',
    category: 'Soirée',
    tradition: 'Chrétienne',
    date: 'Hier',
    audioDuration: '3 min',
    likesCount: 97,
    readTime: '2 min',
    author: 'Soeur Hélène',
  },
  {
    id: 'p-5',
    title: 'Confie-toi en l\'Éternel',
    description: 'Ne t\'appuie pas sur ta propre sagesse mais remets ton avenir entre les mains du Créateur.',
    content: `Seigneur,
Souvent, mon esprit cherche à tout contrôler et à tout anticiper. Pardonne mon incrédulité lorsque je cède à l'angoisse de l'avenir.

Aujourd'hui, je choisis délibérément de déposer ma confiance totale en Toi. Tu connais la fin dès le commencement. Là où je ne vois pas d'issue, Tu traces un chemin dans le désert.

Guide mes choix d'aujourd'hui, qu'ils soient professionnels, familiaux ou spirituels. Que Ta volonté parfaite s'accomplisse dans ma vie, car Tes projets sont des projets de paix et d'espérance.

Gloire soit rendue à Ton saint nom. Amen.`,
    scriptureRef: 'Proverbes 3:5-6',
    scriptureText: 'Confie-toi en l’Éternel de tout ton coeur, et ne t’appuie pas sur ta sagesse; reconnais-le dans toutes tes voies, et il aplanira tes sentiers.',
    category: 'Ma journée',
    tradition: 'Chrétienne',
    date: 'Hier',
    audioDuration: '5 min',
    likesCount: 178,
    readTime: '3 min',
    author: 'Guide Jean',
    isDailyFeatured: false,
  },
  {
    id: 'p-6',
    title: 'Prière pour la guérison et la restauration',
    description: 'Invoque la puissance du Dieu qui restaure les corps brisés et console les coeurs meurtris.',
    content: `Jésus, divin Médecin,
Tu as pris nos infirmités et Tu t'es chargé de nos maladies sur la croix du Calvaire. Par Tes meurtrissures, nous avons reçu la guérison.

Je réclame Ta main bienfaisante sur chaque membre souffrant de notre communauté et sur ma propre vie. Restaure ce qui a été affaibli, renouvelle les cellules, chasse la douleur et restaure la vigueur.

Remplis aussi les coeurs brisés d'une joie surnaturelle. Que Ton Esprit de consolation enveloppe ceux qui traversent l'épreuve.

Nous Te louons car Tu es le Dieu fidèle qui guérit. Amen.`,
    scriptureRef: 'Ésaïe 53:5',
    scriptureText: 'Mais il était blessé pour nos péchés, brisé pour nos iniquités; le châtiment qui nous donne la paix est tombé sur lui, et c’est par ses meurtrissures que nous sommes guéris.',
    category: 'Soir',
    tradition: 'Chrétienne',
    date: 'Il y a 3 jours',
    audioDuration: '4 min',
    likesCount: 132,
    readTime: '3 min',
    author: 'Guide Jean',
  },
  {
    id: 'p-7',
    title: 'Méditation contemplative : Paix du coeur et souffle divin',
    description: 'Un temps de silence et de présence attentive pour déposer toute agitation intérieure.',
    content: `Dans le silence de cet instant, j'ouvre mon esprit à la présence transcendante de la Lumière.
J'inspire la paix, j'expire l'angoisse. Je laisse couler le souffle de vie qui habite et soutient l'univers tout entier.

Que tout tumulte se calme. Que mon âme trouve son repos dans la certitude que je suis aimé, guidé et protégé.
Je me relie à la source infinie d'amour et de bienveillance qui ne tarit jamais.

Que cette sérénité m'accompagne tout au long de mes pas.`,
    scriptureRef: 'Psaume 46:10 & Sagesse contemplative',
    scriptureText: 'Arrêtez, et sachez que je suis Dieu : je domine sur les nations, je domine sur la terre.',
    category: 'Matin',
    tradition: 'Méditation & Contemplation',
    date: 'Hier',
    audioDuration: '5 min',
    likesCount: 168,
    readTime: '2 min',
    author: 'Guide Jean',
  },
  {
    id: 'p-8',
    title: 'Prière universelle pour la concorde et la lumière',
    description: 'Élever nos pensées pour la paix entre les peuples, les familles et la fraternité humaine.',
    content: `Source divine de toute vie, de toute beauté et de toute paix,
Nous élevons notre coeur pour que l'harmonie triomphe là où règne la discorde, que la lumière dissipe les ténèbres de l'incompréhension, et que la bonté guérisse les blessures du monde.

Fais de nous des artisans de réconciliation, des voix de douceur et des porteurs d'espérance vivante.
Bénis chaque famille, chaque communauté en quête de sens, et que la grâce divine repose sur tous les êtres.`,
    scriptureRef: 'Prière de paix universelle',
    scriptureText: 'Bienheureux les artisans de paix, car ils seront appelés enfants de Dieu.',
    category: 'Ma journée',
    tradition: 'Sagesse Universelle & Paix',
    date: 'Il y a 4 jours',
    audioDuration: '3 min',
    likesCount: 153,
    readTime: '2 min',
    author: 'Guide Jean',
  },
];

export const INITIAL_ARTICLES: ResourceArticle[] = [
  {
    id: 'art-1',
    title: 'Comment développer une routine de prière et méditation quotidienne solide ?',
    excerpt: 'Des conseils pratiques pour bâtir une intimité spirituelle durable et élever son âme au quotidien.',
    content: `La prière et la méditation ne sont pas des rituels monotones, mais une conversation vivante et transformatrice. Dans un monde hyperconnecté et bruyant, fixer un temps consacré à l'élévation de l'âme dès l'aube transforme notre état d'esprit.\n\n1. Définir un lieu paisible : trouver un espace calme propice au recueillement.\n2. Commencer par la gratitude : Reconnaître les grâces reçues avant d'énumérer ses requêtes.\n3. Méditer la sagesse sacrée : La prière est un dialogue, méditez un texte inspiré avant de parler.\n4. Persévérer dans la constance : Mieux vaut 15 minutes régulières chaque jour que de longues séances sporadiques.`,
    category: 'Élévation spirituelle',
    tradition: 'Chrétienne',
    author: 'Guide Jean',
    readTime: '5 min',
    date: '08 Octobre 2026',
    imageUrl: '/src/assets/images/spiritual_bible_study_1791833052033.jpg',
  },
  {
    id: 'art-2',
    title: 'Comprendre la puissance du jeûne et du recueillement intérieur',
    excerpt: 'Découvrez comment le jeûne et le silence alignent notre esprit et apaisent les agitations du coeur.',
    content: `Le jeûne spirituel est un acte d'humilité et de purification par lequel nous déclarons que notre faim de sagesse et de paix intérieure surpasse nos appétits terrestres. Il affine notre discernement face aux décisions cruciales et fortifie l'âme face aux tempêtes de la vie.`,
    category: 'Méditation & Foi',
    tradition: 'Méditation & Contemplation',
    author: 'Soeur Hélène',
    readTime: '7 min',
    date: '02 Octobre 2026',
    imageUrl: '/src/assets/images/daily_prayer_verse_1791833039552.jpg',
  },
  {
    id: 'art-3',
    title: 'La paix intérieure au sein de la famille et du travail',
    excerpt: 'Cultiver la sérénité et la bienveillance pour vivre dans l\'harmonie au foyer et au travail.',
    content: `Lorsque les tempêtes du quotidien secouent nos repères, l'ancrage spirituel demeure une force inébranlable. Nourrir son âme quotidiennement apporte clarté, patience et réconciliation dans toutes nos relations humaines.`,
    category: 'Harmonie & Vie',
    tradition: 'Sagesse Universelle & Paix',
    author: 'Guide Jean',
    readTime: '4 min',
    date: '28 Septembre 2026',
    imageUrl: '/src/assets/images/hero_prayer_light_1791833027256.jpg',
  },
];

export const INITIAL_VIDEOS: ResourceVideo[] = [
  {
    id: 'vid-1',
    title: 'Garder la foi et la paix au milieu de l\'épreuve',
    description: 'Un enseignement lumineux sur la force intérieure lorsque les circonstances semblent contraires.',
    duration: '24:15',
    videoUrl: 'https://www.youtube.com',
    thumbnailUrl: '/src/assets/images/community_fellowship_1791833062947.jpg',
    speaker: 'Guide Jean',
    tradition: 'Chrétienne',
    views: 1420,
  },
  {
    id: 'vid-2',
    title: 'La prière qui transforme les atmosphères',
    description: 'Comment élever son esprit avec autorité, foi et compassion pour sa communauté.',
    duration: '18:40',
    videoUrl: 'https://www.youtube.com',
    thumbnailUrl: '/src/assets/images/hero_prayer_light_1791833027256.jpg',
    speaker: 'Guide Jean',
    tradition: 'Chrétienne',
    views: 980,
  },
  {
    id: 'vid-3',
    title: 'Vaincre le découragement et le doute intérieur',
    description: 'Conseils pratiques et spirituels pour renouveler son élan vital et son zèle spirituel.',
    duration: '31:10',
    videoUrl: 'https://www.youtube.com',
    thumbnailUrl: '/src/assets/images/spiritual_bible_study_1791833052033.jpg',
    speaker: 'Soeur Hélène & Invités',
    tradition: 'Sagesse Universelle & Paix',
    views: 2150,
  },
];

export const INITIAL_AUDIOS: ResourceAudio[] = [
  {
    id: 'aud-1',
    title: 'Prière guidée du matin : Bénédiction et clarté d\'esprit',
    description: 'Méditation douce et prière guidée pour confier ta journée et harmoniser tes énergies.',
    duration: '12:00',
    audioUrl: 'https://actions.google.com/sounds/v1/ambiences/morning_birds.ogg',
    narrator: 'Guide Jean',
    category: 'Prières guidées',
    tradition: 'Chrétienne',
  },
  {
    id: 'aud-2',
    title: 'Repos et paix profonde de l\'âme (Méditation du soir)',
    description: 'Détends ton esprit et reçois la sérénité avant de t\'endormir.',
    duration: '15:30',
    audioUrl: 'https://actions.google.com/sounds/v1/ambiences/gentle_rain.ogg',
    narrator: 'Soeur Marie',
    category: 'Méditation',
    tradition: 'Méditation & Contemplation',
  },
  {
    id: 'aud-3',
    title: 'Enseignement spirituel : La puissance de la gratitude et du Verbe',
    description: 'Enseignement audio sur la force de la parole bienveillante et de la foi vécue.',
    duration: '28:45',
    audioUrl: 'https://actions.google.com/sounds/v1/ambiences/chimes.ogg',
    narrator: 'Guide Jean',
    category: 'Enseignement spirituel',
    tradition: 'Sagesse Universelle & Paix',
  },
];

export const INITIAL_COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: 'post-1',
    userId: 'u-3',
    userName: 'Sarah K.',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
    category: 'Témoignages',
    content: 'Merci pour cette nouvelle semaine ! Que chacun de nous reste fort dans la foi et la paix intérieure ! 🙏 Une situation professionnelle très bloquée depuis 6 mois s\'est résolue par la grâce. Ne perdez jamais confiance !',
    likesCount: 12,
    likedByCurrentUser: true,
    commentsCount: 4,
    createdAt: 'Il y a 2 heures',
    status: 'published',
    comments: [
      {
        id: 'c-1',
        postId: 'post-1',
        userId: 'u-1',
        userName: 'Marie Dupont',
        userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=256',
        content: 'Gloire à Dieu ! Quelle joie de lire ce témoignage si encourageant pour nos âmes !',
        createdAt: 'Il y a 1 heure',
      },
      {
        id: 'c-2',
        postId: 'post-1',
        userId: 'u-4',
        userName: 'Daniel A.',
        userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256',
        content: 'La persévérance porte toujours ses fruits. Félicitations à toute votre famille.',
        createdAt: 'Il y a 30 minutes',
      },
    ],
  },
  {
    id: 'post-2',
    userId: 'u-4',
    userName: 'Daniel A.',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256',
    category: 'Sujets de prière',
    content: 'Je prie pour ceux qui traversent des moments d\'incertitude. Que la paix et la force spirituelle leur soient données. Merci de vous unir à moi pour ma mère actuellement hospitalisée.',
    likesCount: 18,
    likedByCurrentUser: false,
    commentsCount: 6,
    createdAt: 'Il y a 5 heures',
    status: 'published',
    comments: [
      {
        id: 'c-3',
        postId: 'post-2',
        userId: 'u-2',
        userName: 'Guide Jean',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
        content: 'Frère Daniel, toute notre communauté porte ta maman dans nos prières et méditations matinales. Que la main guérissante et bienfaisante repose sur elle.',
        createdAt: 'Il y a 4 heures',
      },
    ],
  },
  {
    id: 'post-3',
    userId: 'u-5',
    userName: 'Grace Mensah',
    userAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256',
    category: 'Questions',
    content: 'Chers frères et soeurs d\'Âme & Vie, comment faites-vous concrètement pour maintenir votre rituel de méditation et lecture inspirée quand les journées de travail sont surchargées ? Vos conseils me seraient précieux !',
    likesCount: 9,
    likedByCurrentUser: false,
    commentsCount: 5,
    createdAt: 'Hier à 18:30',
    status: 'published',
    comments: [],
  },
];

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'GRATUIT',
    price: 0,
    interval: 'gratuit',
    description: 'Découvrir la plateforme et cultiver sa prière et méditation quotidienne.',
    features: [
      'Prières & méditations quotidiennes',
      'Ressources de base',
      'Accès à la communauté',
      'Accès web responsive',
    ],
  },
  {
    id: 'monthly',
    name: 'MENSUEL',
    price: 4.99,
    interval: 'mois',
    badge: 'Le plus populaire',
    description: 'Une expérience spirituelle enrichie au quotidien sans engagement.',
    features: [
      'Tout le contenu gratuit',
      'Ressources & méditations exclusives',
      'Accès aux vidéos et audios Premium',
      'Support prioritaire',
      'Notifications WhatsApp quotidiennes',
    ],
  },
  {
    id: 'annual',
    name: 'ANNUEL',
    price: 49.99,
    interval: 'an',
    description: 'Soutenez la mission durablement et profitez de tous les privilèges.',
    features: [
      'Tout le contenu mensuel',
      'Accès illimité',
      'Téléchargements PDF & guides spirituels',
      'Support prioritaire avec Guide Jean (Fondateur & Responsable de la communauté)',
      '2 mois gratuits inclus',
    ],
  },
];

export const INITIAL_USER_SUBSCRIPTION: UserSubscription = {
  id: 'sub-101',
  userId: 'u-1',
  planId: 'monthly',
  planName: 'Mensuel',
  status: 'active',
  startDate: '2026-09-14',
  nextRenewalDate: '14/10/2026',
  amount: 4.99,
  paymentMethod: 'Carte bancaire (•••• 4242)',
};

export const INITIAL_PAYMENTS: PaymentTransaction[] = [
  {
    id: 'pay-001',
    userId: 'u-1',
    userName: 'Marie Dupont',
    amount: 4.99,
    currency: 'EUR',
    status: 'success',
    paymentMethod: 'Carte bancaire',
    date: '14/09/2026',
    invoiceNumber: 'INV-2026-0914',
  },
  {
    id: 'pay-002',
    userId: 'u-1',
    userName: 'Marie Dupont',
    amount: 4.99,
    currency: 'EUR',
    status: 'success',
    paymentMethod: 'Carte bancaire',
    date: '14/08/2026',
    invoiceNumber: 'INV-2026-0814',
  },
  {
    id: 'pay-003',
    userId: 'u-3',
    userName: 'Sarah K.',
    amount: 49.99,
    currency: 'EUR',
    status: 'success',
    paymentMethod: 'PayPal',
    date: '10/02/2026',
    invoiceNumber: 'INV-2026-0210',
  },
  {
    id: 'pay-004',
    userId: 'u-4',
    userName: 'Daniel A.',
    amount: 4.99,
    currency: 'EUR',
    status: 'success',
    paymentMethod: 'Orange Money / Wave',
    date: '01/03/2026',
    invoiceNumber: 'INV-2026-0301',
  },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    userId: 'u-1',
    title: 'Nouvelle prière et méditation du matin',
    message: '« Seigneur, merci pour ce nouveau jour... » Venez élever votre âme dès l\'aurore.',
    createdAt: 'Il y a 3 heures',
    isRead: false,
    type: 'prayer',
  },
  {
    id: 'notif-2',
    userId: 'u-1',
    title: 'Sarah K. a aimé votre commentaire',
    message: 'Votre encouragement dans le groupe Témoignages a touché Sarah K.',
    createdAt: 'Il y a 1 jour',
    isRead: true,
    type: 'community',
  },
  {
    id: 'notif-3',
    userId: 'u-1',
    title: 'Renouvellement d\'abonnement',
    message: 'Votre prochain prélèvement mensuel aura lieu le 14/10/2026.',
    createdAt: 'Il y a 3 jours',
    isRead: true,
    type: 'subscription',
  },
];

export const INITIAL_ADMIN_LOGS: AdminLog[] = [
  {
    id: 'log-1',
    adminId: 'u-2',
    adminName: 'Guide Jean (Fondateur & Responsable de la communauté)',
    action: 'PUBLISH_PRAYER',
    target: 'Prière du matin (p-1)',
    details: 'Publication de la prière quotidienne pour Lamentations 3:22',
    timestamp: '2026-10-12 06:00',
  },
  {
    id: 'log-2',
    adminId: 'u-2',
    adminName: 'Guide Jean (Fondateur & Responsable de la communauté)',
    action: 'UPDATE_PLAN',
    target: 'Plan Mensuel',
    details: 'Mise à jour des avantages exclusifs vidéos/audios Premium',
    timestamp: '2026-10-10 14:22',
  },
  {
    id: 'log-3',
    adminId: 'u-2',
    adminName: 'Guide Jean (Fondateur & Responsable de la communauté)',
    action: 'MODERATE_POST',
    target: 'Post communautaire #409',
    details: 'Validation et publication après vérification bienveillante',
    timestamp: '2026-10-09 11:05',
  },
];

export const INITIAL_EMAIL_CAMPAIGNS: EmailCampaign[] = [
  {
    id: 'camp-1',
    title: 'Prière & Méditation de la semaine #41',
    subject: 'Que la paix intérieure et la lumière gardent vos coeurs cette semaine',
    recipientCount: 2450,
    sentAt: '2026-10-10',
    status: 'sent',
    openRate: '68.4%',
  },
  {
    id: 'camp-2',
    title: 'Nouveau guide audio disponible : Repos et Paix de l\'Âme',
    subject: 'Écoutez notre nouvelle méditation guidée du soir',
    recipientCount: 1820,
    sentAt: '2026-10-05',
    status: 'sent',
    openRate: '72.1%',
  },
];
