# -*- coding: utf-8 -*-
"""Génère seed/contenus.json : contenus d'exemple d'Ame & Vie (textes bibliques : Louis Segond 1910, domaine public)."""
import json, sys, os

OUT = sys.argv[1]

P = lambda titre, ref, verset, meditation, acces='gratuit': dict(type='parole', title=titre, bible_ref=ref, content=verset, description=meditation, access=acces)
E = lambda titre, desc, texte, acces='gratuit', cat='Étude biblique', ref=None: dict(type='enseignement', title=titre, description=desc, content=texte, access=acces, category=cat, bible_ref=ref)
C = lambda titre, cat, desc, texte, acces='gratuit', ref=None: dict(type='contenu', title=titre, category=cat, description=desc, content=texte, access=acces, bible_ref=ref)
D = lambda titre, fichier, desc, acces='gratuit', cat=None: dict(type='document', title=titre, file=fichier, description=desc, access=acces, category=cat)

contenus = [
  # ------------------------------------------------------------ Paroles de Dieu
  P("Le Seigneur est mon berger", "Psaume 23:1-3",
    "L'Éternel est mon berger : je ne manquerai de rien. Il me fait reposer dans de verts pâturages, Il me dirige près des eaux paisibles. Il restaure mon âme, Il me conduit dans les sentiers de la justice, à cause de son nom.",
    "Aujourd'hui, laissez-vous conduire. Le berger connaît le chemin, la source et le repos dont vous avez besoin."),
  P("Tant aimé", "Jean 3:16",
    "Car Dieu a tant aimé le monde qu'il a donné son Fils unique, afin que quiconque croit en lui ne périsse point, mais qu'il ait la vie éternelle.",
    "Le cœur de l'Évangile en une phrase : vous êtes aimé, et cet amour a un nom, Jésus."),
  P("La paix qui surpasse tout", "Philippiens 4:6-7",
    "Ne vous inquiétez de rien ; mais en toute chose faites connaître vos besoins à Dieu par des prières et des supplications, avec des actions de grâces. Et la paix de Dieu, qui surpasse toute intelligence, gardera vos cœurs et vos pensées en Jésus-Christ.",
    "Échangez vos inquiétudes contre sa paix : nommez chaque souci dans la prière, puis remerciez."),
  P("Ne crains rien", "Ésaïe 41:10",
    "Ne crains rien, car je suis avec toi ; ne promène pas des regards inquiets, car je suis ton Dieu ; je te fortifie, je viens à ton secours, je te soutiens de ma droite triomphante.",
    "Quatre promesses pour une seule journée : sa présence, sa force, son secours, son soutien."),
  P("Venez à moi", "Matthieu 11:28",
    "Venez à moi, vous tous qui êtes fatigués et chargés, et je vous donnerai du repos.",
    "Le repos n'est pas d'abord un lieu, c'est une personne. Approchez-vous de lui aujourd'hui."),
  P("Des projets de paix", "Jérémie 29:11",
    "Car je connais les projets que j'ai formés sur vous, dit l'Éternel, projets de paix et non de malheur, afin de vous donner un avenir et de l'espérance.",
    "Même dans l'attente, Dieu prépare un avenir. Confiez-lui ce que vous ne voyez pas encore.", 'premium'),
  P("Fortifie-toi et prends courage", "Josué 1:9",
    "Ne t'ai-je pas donné cet ordre : Fortifie-toi et prends courage ? Ne t'effraie point et ne t'épouvante point, car l'Éternel, ton Dieu, est avec toi dans tout ce que tu entreprendras.",
    "Le courage n'est pas l'absence de peur : c'est avancer en sachant qui marche avec vous.", 'premium'),
  P("Tout concourt au bien", "Romains 8:28",
    "Nous savons, du reste, que toutes choses concourent au bien de ceux qui aiment Dieu, de ceux qui sont appelés selon son dessein.",
    "Rien n'est perdu entre les mains de Dieu, pas même les jours difficiles.", 'premium'),

  # ------------------------------------------------------------ Enseignements
  E("Bâtir sa maison sur le roc",
    "Une parabole de Jésus pour construire une vie solide, capable de traverser les tempêtes.",
    """« C'est pourquoi, quiconque entend ces paroles que je dis et les met en pratique, sera semblable à un homme prudent qui a bâti sa maison sur le roc. » (Matthieu 7:24)

1. Deux maisons qui se ressemblent
Vues de l'extérieur, les deux maisons de la parabole sont identiques. La différence ne se voit pas : elle est dans les fondations. Il en va de même de nos vies. Deux personnes peuvent aller à l'église, chanter les mêmes cantiques, connaître les mêmes versets. Ce qui les distingue apparaît le jour de la tempête.

2. Entendre ne suffit pas
Les deux bâtisseurs ont entendu la même parole. Le prudent l'a mise en pratique. La foi n'est pas seulement un savoir, c'est une obéissance de chaque jour : pardonner, servir, dire la vérité, prier quand on n'en a pas envie.

3. La tempête vient pour tous
Jésus ne promet pas une vie sans pluie, sans torrents ni vents. Il promet une maison qui reste debout. La question n'est donc pas « Est-ce que la tempête viendra ? » mais « Sur quoi suis-je construit quand elle viendra ? »

À mettre en pratique cette semaine
• Choisissez une parole de Jésus lue récemment et notez une action concrète pour l'appliquer.
• Identifiez une « fondation de sable » dans votre vie (peur, orgueil, dépendance) et confiez-la à Dieu dans la prière.
• Partagez cette parabole avec une personne de votre entourage.""", ref="Matthieu 7:24-27"),
  E("La puissance du pardon",
    "Pardonner ne veut pas dire oublier ni excuser : c'est libérer son cœur. Un enseignement pratique.",
    """« Supportez-vous les uns les autres, et, si l'un a sujet de se plaindre de l'autre, pardonnez-vous réciproquement. De même que Christ vous a pardonné, pardonnez-vous aussi. » (Colossiens 3:13)

Ce que le pardon n'est pas
Pardonner, ce n'est pas dire que le mal n'était pas grave. Ce n'est pas non plus faire comme si rien ne s'était passé, ni se remettre forcément en danger. Le pardon reconnaît la blessure ; il refuse seulement qu'elle gouverne notre cœur.

Pourquoi pardonner ?
Parce que nous avons été pardonnés les premiers. Celui qui mesure la grâce reçue trouve la force de la transmettre. Et parce que la rancune enferme surtout celui qui la porte.

Un chemin, pas un instant
Le pardon commence souvent par une décision, puis se poursuit dans le temps. Il peut falloir pardonner plusieurs fois pour la même offense, à mesure que le souvenir revient. C'est normal.

Quatre pas pour avancer
1. Nommer devant Dieu ce qui vous a blessé, honnêtement.
2. Remettre à Dieu le droit de juger et de rendre justice.
3. Bénir la personne dans la prière, même en quelques mots.
4. Chercher de l'aide (pasteur, ami de confiance) si la blessure est profonde."""),
  E("Marcher par la foi, non par la vue",
    "Comment avancer quand on ne voit pas encore la réponse ? Un enseignement en trois parties.",
    """« Car nous marchons par la foi et non par la vue. » (2 Corinthiens 5:7)

Partie 1 — Abraham, l'homme qui partit sans savoir
Abraham quitta son pays « sans savoir où il allait » (Hébreux 11:8). Sa foi ne reposait pas sur une carte, mais sur Celui qui l'appelait. La foi commence souvent par un premier pas dont on ne voit pas la suite.

Partie 2 — Quand la vue contredit la promesse
Pierre marcha sur les eaux tant qu'il regarda Jésus. Quand il regarda le vent, il commença à enfoncer. Nos circonstances sont réelles, mais elles ne sont pas la réalité tout entière. Fixer les yeux sur Jésus, c'est laisser sa parole avoir le dernier mot.

Partie 3 — La foi qui agit
Une foi vivante se traduit par des actes : prier avec persévérance, rester fidèle dans les petites choses, continuer à servir dans l'attente. Dieu honore la foi qui avance.

Questions pour méditer
• Quelle promesse de Dieu vous semble aujourd'hui contredite par ce que vous voyez ?
• Quel « premier pas » Dieu vous demande-t-il de faire cette semaine ?
• Qui pouvez-vous encourager à garder la foi ?""", 'premium', 'Exhortation', "2 Corinthiens 5:7"),
  E("Prier sans cesse",
    "La prière au quotidien : des repères simples pour une vie de communion avec Dieu.",
    """« Priez sans cesse. Rendez grâces en toutes choses, car c'est à votre égard la volonté de Dieu en Jésus-Christ. » (1 Thessaloniciens 5:17-18)

Prier sans cesse : est-ce possible ?
Il ne s'agit pas de rester à genoux toute la journée, mais de vivre la journée avec Dieu. La prière devient une conversation continue : un merci au réveil, un appel au secours au travail, une intercession dans les transports.

Trois moments pour structurer la journée
• Le matin : confier la journée, lire un verset, demander la direction de Dieu.
• Dans la journée : des prières courtes (« Seigneur, aide-moi », « Merci »).
• Le soir : relire la journée avec Dieu, remercier, demander pardon, remettre ses soucis.

Le modèle de Jésus
Le « Notre Père » (Matthieu 6:9-13) donne un chemin : adorer, désirer sa volonté, demander le pain du jour, pardonner et être pardonné, être gardé du mal.

Défi de 7 jours
Chaque jour, notez un sujet de prière et une raison de remercier. Au bout d'une semaine, relisez : vous verrez la fidélité de Dieu.""", 'premium', 'Prière', "1 Thessaloniciens 5:17"),
  E("Vaincre l'anxiété par la Parole",
    "Ce que la Bible dit de l'inquiétude, et des gestes concrets pour retrouver la paix.",
    """« Déchargez-vous sur lui de tous vos soucis, car lui-même prend soin de vous. » (1 Pierre 5:7)

L'anxiété n'est pas un manque de foi
De grands serviteurs de Dieu ont connu l'angoisse : David dans les Psaumes, Élie dans le désert, Jésus lui-même à Gethsémané. Dieu ne nous reproche pas nos peurs ; il nous invite à les lui apporter.

Ce que dit la Parole
• Dieu prend soin de vous personnellement (1 Pierre 5:7).
• Il connaît vos besoins avant que vous les exprimiez (Matthieu 6:8).
• Sa paix garde le cœur de ceux qui prient (Philippiens 4:6-7).

Des gestes concrets
1. Écrire ses inquiétudes, puis les transformer une à une en prières.
2. Méditer chaque matin un verset de confiance et le garder sur soi.
3. Prendre soin de son corps : sommeil, marche, repas réguliers.
4. Parler à quelqu'un : un pasteur, un ami, et si besoin un professionnel de santé. Demander de l'aide est aussi un acte de foi.""", 'premium', 'Exhortation'),

  # ------------------------------------------------------------ Contenus spirituels
  C("Prière du matin", 'Prière', "Commencer la journée en confiant tout à Dieu.",
    """Seigneur, merci pour ce nouveau jour.
Merci pour le souffle de vie, pour le repos de la nuit, pour ceux que j'aime.

Je te confie cette journée : mes rendez-vous, mon travail, mes déplacements, mes décisions.
Donne-moi la sagesse quand je ne sais pas quoi faire, la patience quand tout va trop vite, et la douceur dans mes paroles.

Garde ma famille et mes proches. Bénis ceux que je rencontrerai aujourd'hui, et fais de moi une lumière là où je serai.

Que ta paix garde mon cœur et mes pensées.
Au nom de Jésus. Amen."""),
  C("Prière du soir", 'Prière', "Remettre sa journée à Dieu et s'endormir en paix.",
    """Seigneur, au terme de cette journée, je viens à toi.

Merci pour tout ce que tu m'as donné aujourd'hui, même ce que je n'ai pas remarqué.
Pardonne-moi pour les paroles et les gestes qui ne t'ont pas honoré. Aide-moi aussi à pardonner à ceux qui m'ont blessé.

Je dépose devant toi ce qui m'inquiète pour demain.
« Je me couche et je m'endors en paix, car toi seul, ô Éternel, tu me donnes la sécurité dans ma demeure. » (Psaume 4:9)

Veille sur moi et sur les miens cette nuit.
Amen.""", ref="Psaume 4:9"),
  C("Prière pour la famille", 'Famille', "Une prière à dire ensemble, parents et enfants.",
    """Père céleste, merci pour notre famille.

Bénis chacun de nous : ceux qui sont présents et ceux qui sont loin.
Mets dans notre maison ta paix, ta joie et ton amour.
Apprends-nous à nous écouter, à nous pardonner vite et à nous encourager.

Protège nos enfants à l'école, sur les routes et dans leurs amitiés.
Donne du travail et de la sagesse aux parents, de la force aux anciens.

« Moi et ma maison, nous servirons l'Éternel. » (Josué 24:15)
Amen.""", ref="Josué 24:15"),
  C("Rendre grâce en toute chose", 'Louange', "Une louange pour les jours ordinaires comme pour les jours difficiles.",
    """« Rendez grâces en toutes choses, car c'est à votre égard la volonté de Dieu en Jésus-Christ. » (1 Thessaloniciens 5:18)

Je te loue, Seigneur, pour ta fidélité qui se renouvelle chaque matin.
Je te loue pour le pain sur la table, pour l'eau qui désaltère, pour le toit qui m'abrite.
Je te loue pour les visages qui m'entourent et pour les mains qui m'ont aidé.

Je te loue aussi pour les jours difficiles, car tu ne m'y as jamais laissé seul.
Tu es bon, et ta bonté dure à toujours.

Exercice : écrivez aujourd'hui dix raisons de dire merci. Relisez-les ce soir à voix haute.""", ref="1 Thessaloniciens 5:18"),
  C("Le Seigneur est mon berger — méditation guidée", 'Méditation', "Une méditation lente du Psaume 23, verset par verset.",
    """Installez-vous dans un endroit calme. Respirez lentement. Lisez chaque phrase deux fois, puis laissez un temps de silence.

« L'Éternel est mon berger » — Il ne s'agit pas d'un berger, mais de MON berger. Il me connaît par mon nom.

« Je ne manquerai de rien » — De quoi ai-je peur de manquer aujourd'hui ? Je le lui dis.

« Il me fait reposer dans de verts pâturages » — Où sont mes verts pâturages ? Quand me suis-je vraiment reposé pour la dernière fois ?

« Il restaure mon âme » — Quelle partie de moi est fatiguée, blessée ? Je la lui présente.

« Quand je marche dans la vallée de l'ombre de la mort, je ne crains aucun mal, car tu es avec moi » — Dans la vallée, le psalmiste ne parle plus de Dieu : il lui parle. La difficulté rapproche.

Terminez en remerciant le berger pour un soin précis de cette semaine.""", 'premium', ref="Psaume 23"),
  C("Jeunes : ta valeur aux yeux de Dieu", 'Jeunesse', "Une exhortation pour les jeunes qui doutent d'eux-mêmes.",
    """« Je te loue de ce que je suis une créature si merveilleuse. Tes œuvres sont admirables, et mon âme le reconnaît bien. » (Psaume 139:14)

Les réseaux sociaux te comparent sans cesse aux autres. Les notes, les likes, les regards te disent ce que tu vaux. Mais ta valeur n'est pas un score.

Dieu t'a formé avec soin. Il connaît tes forces et tes faiblesses, et il t'aime déjà. Tu n'as pas à mériter son amour : tu peux seulement le recevoir.

Trois rappels pour cette semaine :
1. Avant de te comparer, remercie Dieu pour une qualité qu'il t'a donnée.
2. Choisis tes influences : ce que tu regardes façonne ce que tu penses.
3. Entoure-toi de personnes qui t'aident à grandir, pas à douter.

Tu as de la valeur. Tu as un appel. Avance.""", 'premium', ref="Psaume 139:14"),
  C("Témoignage : de l'inquiétude à la paix", 'Témoignage', "Une sœur raconte comment la prière a changé sa façon de vivre une épreuve.",
    """« Pendant des mois, je me réveillais chaque nuit avec la même angoisse : mon travail allait s'arrêter et je ne voyais pas comment nourrir mes enfants.

Un dimanche, une sœur m'a donné Philippiens 4:6-7 écrit sur un petit papier. Je l'ai collé sur mon miroir. Chaque matin, au lieu de ruminer, j'ai commencé à écrire mes soucis et à les transformer en prières, puis à noter une raison de dire merci.

La situation n'a pas changé tout de suite. Mais moi, j'ai changé : j'ai retrouvé le sommeil, et une paix que je ne savais pas expliquer.

Trois mois plus tard, une porte s'est ouverte dans un autre service. Aujourd'hui je garde ce petit papier dans ma Bible, pour me souvenir que Dieu était là avant la réponse. »

Témoignage partagé avec l'accord de son auteure (prénom non publié)."""),

  # ------------------------------------------------------------ Documents
  D("Plan de lecture de la Bible en un an", "plan-de-lecture-bible-1-an.pdf",
    "Toute la Bible en 365 jours, de la Genèse à l'Apocalypse, avec une case à cocher par jour. À imprimer.", 'gratuit', 'Étude biblique'),
  D("Premiers pas dans la foi", "premiers-pas-dans-la-foi.pdf",
    "Un livret simple pour les nouveaux croyants : prière, lecture de la Bible, église, baptême.", 'gratuit', 'Jeunesse'),
  D("Carnet de méditation hebdomadaire", "carnet-de-meditation.pdf",
    "Des pages à imprimer pour noter vos lectures, prières et sujets de reconnaissance chaque semaine.", 'gratuit', 'Méditation'),
  D("Guide de prière : 21 jours", "guide-de-priere-21-jours.pdf",
    "Trois semaines pour approfondir votre vie de prière : un thème, un verset et une prière par jour.", 'premium', 'Prière'),
  D("Étude biblique : les Béatitudes", "etude-biblique-beatitudes.pdf",
    "Huit leçons sur Matthieu 5:1-12, avec questions de discussion pour l'étude personnelle ou en groupe.", 'premium', 'Étude biblique'),
  D("30 versets à mémoriser", "30-versets-a-memoriser.pdf",
    "Des cartes à découper, classées par thème : confiance, paix, pardon, force, espérance.", 'premium', 'Méditation'),
]

os.makedirs(OUT, exist_ok=True)
json.dump({
  "_aide": "Contenus d'exemple importés depuis l'administration (Base de données → Ajouter les contenus d'exemple). Textes bibliques : Louis Segond 1910 (domaine public).",
  "pasteur": {"prenom": "Équipe", "nom": "Ame & Vie", "email": "equipe@ameetvie.org", "eglise": "Ame & Vie",
              "bio": "Contenus proposés par l'équipe Ame & Vie pour bien démarrer."},
  "contenus": contenus,
}, open(os.path.join(OUT, 'contenus.json'), 'w'), ensure_ascii=False, indent=2)
print(len(contenus), 'contenus')
