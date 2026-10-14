# -*- coding: utf-8 -*-
"""Génère les PDF d'exemple d'Ame & Vie (reportlab, polices DejaVu)."""
import os, sys
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, Table, TableStyle,
                                PageBreak, KeepTogether, NextPageTemplate)
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT

OUT = sys.argv[1]
os.makedirs(OUT, exist_ok=True)
F = '/usr/share/fonts/truetype/dejavu/'
pdfmetrics.registerFont(TTFont('Serif', F + 'DejaVuSerif.ttf'))
pdfmetrics.registerFont(TTFont('Serif-B', F + 'DejaVuSerif-Bold.ttf'))
pdfmetrics.registerFont(TTFont('Serif-I', F + 'DejaVuSerif-Italic.ttf'))
pdfmetrics.registerFont(TTFont('Sans', F + 'DejaVuSans.ttf'))
pdfmetrics.registerFont(TTFont('Sans-B', F + 'DejaVuSans-Bold.ttf'))
from reportlab.lib.fonts import addMapping
addMapping('Serif', 0, 0, 'Serif'); addMapping('Serif', 1, 0, 'Serif-B'); addMapping('Serif', 0, 1, 'Serif-I'); addMapping('Serif', 1, 1, 'Serif-B')
addMapping('Sans', 0, 0, 'Sans'); addMapping('Sans', 1, 0, 'Sans-B'); addMapping('Sans', 0, 1, 'Sans'); addMapping('Sans', 1, 1, 'Sans-B')

TERRE = colors.HexColor('#9a3f1f'); OR = colors.HexColor('#d9a23d'); NUIT = colors.HexColor('#2b1c15')
IVOIRE = colors.HexColor('#fdf8f1'); ENCRE = colors.HexColor('#2a1d16'); GRIS = colors.HexColor('#7a6a60')
LIGNE = colors.HexColor('#e8dccd')

st = {
  'h1': ParagraphStyle('h1', fontName='Serif-B', fontSize=22, leading=27, textColor=ENCRE, spaceAfter=8),
  'h2': ParagraphStyle('h2', fontName='Serif-B', fontSize=15, leading=19, textColor=TERRE, spaceBefore=10, spaceAfter=6),
  'p': ParagraphStyle('p', fontName='Sans', fontSize=10.5, leading=15.5, textColor=ENCRE, spaceAfter=6),
  'small': ParagraphStyle('small', fontName='Sans', fontSize=8.5, leading=12, textColor=GRIS),
  'verse': ParagraphStyle('verse', fontName='Serif-I', fontSize=11.5, leading=16.5, textColor=ENCRE, leftIndent=10, borderPadding=(6, 8, 6, 10), spaceBefore=4, spaceAfter=8, backColor=colors.HexColor('#f6ecdf')),
  'ref': ParagraphStyle('ref', fontName='Sans-B', fontSize=9, leading=12, textColor=TERRE, spaceAfter=10),
  'bullet': ParagraphStyle('bullet', fontName='Sans', fontSize=10.5, leading=15, textColor=ENCRE, leftIndent=14, bulletIndent=2, spaceAfter=3),
  'cell': ParagraphStyle('cell', fontName='Sans', fontSize=8.6, leading=11, textColor=ENCRE),
  'cellb': ParagraphStyle('cellb', fontName='Sans-B', fontSize=8.6, leading=11, textColor=colors.white),
}

def make_doc(path, titre, sous_titre, surtitre):
    W, H = A4
    def couverture(c, d):
        c.saveState()
        c.setFillColor(NUIT); c.rect(0, 0, W, H, fill=1, stroke=0)
        c.setFillColor(TERRE); c.rect(0, H * 0.42, W, H * 0.58, fill=1, stroke=0)
        c.setFillColor(OR); c.circle(W - 40 * mm, H - 45 * mm, 60 * mm, fill=1, stroke=0)
        c.setFillColor(TERRE); c.circle(W - 40 * mm, H - 45 * mm, 52 * mm, fill=1, stroke=0)
        # flamme
        c.setStrokeColor(colors.white); c.setLineWidth(2.2)
        cx, cy = 28 * mm, H - 30 * mm
        c.circle(cx, cy, 9 * mm, fill=0, stroke=1)
        p = c.beginPath(); p.moveTo(cx, cy + 5.5 * mm); p.curveTo(cx + 5 * mm, cy, cx + 4 * mm, cy - 4 * mm, cx, cy - 4.5 * mm)
        p.curveTo(cx - 4 * mm, cy - 4 * mm, cx - 4 * mm, cy, cx, cy + 5.5 * mm); c.drawPath(p, stroke=1, fill=0)
        c.setFillColor(colors.white); c.setFont('Serif-B', 16); c.drawString(41 * mm, H - 32 * mm, 'Ame & Vie')
        c.setFont('Sans', 8.5); c.drawString(41 * mm, H - 37 * mm, 'Plateforme spirituelle')
        c.setFillColor(OR); c.setFont('Sans-B', 9.5); c.drawString(22 * mm, H * 0.42 + 70 * mm, surtitre.upper())
        c.setFillColor(colors.white)
        y = H * 0.42 + 56 * mm
        for ligne in titre.split('\n'):
            c.setFont('Serif-B', 30); c.drawString(22 * mm, y, ligne); y -= 13 * mm
        c.setFillColor(colors.HexColor('#f3e3d2')); c.setFont('Serif-I', 12.5)
        y = H * 0.42 + 14 * mm
        for ligne in sous_titre.split('\n'):
            c.drawString(22 * mm, y, ligne); y -= 6.5 * mm
        c.setFillColor(colors.HexColor('#cbb8a8')); c.setFont('Sans', 8.5)
        c.drawString(22 * mm, 20 * mm, 'Textes bibliques : Louis Segond 1910 (domaine public). ' + ('Document réservé aux abonnés Ame & Vie.' if 'Premium' in surtitre else 'Document gratuit à imprimer et partager.'))
        c.restoreState()
    def page(c, d):
        c.saveState()
        c.setFillColor(IVOIRE); c.rect(0, 0, W, H, fill=1, stroke=0)
        c.setFillColor(TERRE); c.rect(0, H - 9 * mm, W, 9 * mm, fill=1, stroke=0)
        c.setFillColor(colors.white); c.setFont('Sans-B', 8); c.drawString(18 * mm, H - 6 * mm, 'AME & VIE')
        c.setFont('Sans', 8); c.drawRightString(W - 18 * mm, H - 6 * mm, titre.replace('\n', ' '))
        c.setFillColor(GRIS); c.setFont('Sans', 8); c.drawCentredString(W / 2, 10 * mm, f'— {d.page - 1} —')
        c.restoreState()
    doc = BaseDocTemplate(path, pagesize=A4, title=titre.replace('\n', ' '), author='Ame & Vie', subject=sous_titre.replace('\n', ' '),
                          leftMargin=18 * mm, rightMargin=18 * mm, topMargin=20 * mm, bottomMargin=18 * mm)
    fr = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id='f')
    doc.addPageTemplates([PageTemplate(id='cover', frames=[fr], onPage=couverture), PageTemplate(id='page', frames=[fr], onPage=page)])
    return doc

def start():
    return [NextPageTemplate('page'), PageBreak()]

def bullets(items):
    return [Paragraph(t, st['bullet'], bulletText='•') for t in items]

def ligne_ecriture(n=6, width=174 * mm):
    t = Table([[''] for _ in range(n)], colWidths=[width], rowHeights=[8 * mm] * n)
    t.setStyle(TableStyle([('LINEBELOW', (0, 0), (-1, -1), 0.5, LIGNE)]))
    return t

# ============================================================== 1. Plan de lecture
LIVRES = [("Genèse",50),("Exode",40),("Lévitique",27),("Nombres",36),("Deutéronome",34),("Josué",24),("Juges",21),("Ruth",4),
 ("1 Samuel",31),("2 Samuel",24),("1 Rois",22),("2 Rois",25),("1 Chroniques",29),("2 Chroniques",36),("Esdras",10),("Néhémie",13),
 ("Esther",10),("Job",42),("Psaumes",150),("Proverbes",31),("Ecclésiaste",12),("Cantique",8),("Ésaïe",66),("Jérémie",52),
 ("Lamentations",5),("Ézéchiel",48),("Daniel",12),("Osée",14),("Joël",3),("Amos",9),("Abdias",1),("Jonas",4),("Michée",7),
 ("Nahum",3),("Habacuc",3),("Sophonie",3),("Aggée",2),("Zacharie",14),("Malachie",4),("Matthieu",28),("Marc",16),("Luc",24),
 ("Jean",21),("Actes",28),("Romains",16),("1 Corinthiens",16),("2 Corinthiens",13),("Galates",6),("Éphésiens",6),
 ("Philippiens",4),("Colossiens",4),("1 Thessaloniciens",5),("2 Thessaloniciens",3),("1 Timothée",6),("2 Timothée",4),
 ("Tite",3),("Philémon",1),("Hébreux",13),("Jacques",5),("1 Pierre",5),("2 Pierre",3),("1 Jean",5),("2 Jean",1),("3 Jean",1),
 ("Jude",1),("Apocalypse",22)]
chap = [(b, i) for b, n in LIVRES for i in range(1, n + 1)]
assert len(chap) == 1189

def lecture_jours():
    jours = []
    for d in range(365):
        a, b = round(d * len(chap) / 365), round((d + 1) * len(chap) / 365)
        part = chap[a:b]
        groupes = []
        for livre, c in part:
            if groupes and groupes[-1][0] == livre: groupes[-1][2] = c
            else: groupes.append([livre, c, c])
        jours.append(' ; '.join(f'{g[0]} {g[1]}' + (f'–{g[2]}' if g[2] != g[1] else '') for g in groupes))
    return jours

def plan_lecture():
    doc = make_doc(os.path.join(OUT, 'plan-de-lecture-bible-1-an.pdf'), 'Plan de lecture\nde la Bible en un an',
                   'De la Genèse à l’Apocalypse,\nenviron trois chapitres par jour.', 'Document gratuit')
    s = start()
    s += [Paragraph('Comment utiliser ce plan', st['h1']),
          Paragraph('La Bible compte 1 189 chapitres. En lisant environ trois chapitres par jour, vous la parcourez entièrement en un an. Cochez chaque jour lu : si vous prenez du retard, ne vous découragez pas, reprenez simplement à la date du jour.', st['p'])]
    s += bullets(['Choisissez un moment fixe (le matin, la pause de midi ou le soir).',
                  'Lisez avec un carnet : notez un verset qui vous touche et une prière.',
                  'Vous pouvez commencer n’importe quel jour de l’année : le jour 1 est votre premier jour.'])
    s.append(Paragraph('« Ta parole est une lampe à mes pieds, et une lumière sur mon sentier. »', st['verse']))
    s.append(Paragraph('Psaume 119:105', st['ref']))
    jours = lecture_jours()
    for sem in range(53):
        bloc = jours[sem * 7:(sem + 1) * 7]
        if not bloc: break
        rows = [[Paragraph(f'Semaine {sem + 1}', st['cellb']), Paragraph('', st['cellb']), Paragraph('', st['cellb'])]]
        for k, j in enumerate(bloc):
            rows.append(['☐', Paragraph(f'Jour {sem * 7 + k + 1}', st['cell']), Paragraph(j, st['cell'])])
        t = Table(rows, colWidths=[8 * mm, 20 * mm, 146 * mm])
        t.setStyle(TableStyle([('SPAN', (0, 0), (-1, 0)), ('BACKGROUND', (0, 0), (-1, 0), TERRE),
                               ('FONT', (0, 1), (0, -1), 'Sans', 10), ('TEXTCOLOR', (0, 1), (0, -1), TERRE),
                               ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f9f1e6')]),
                               ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'), ('BOX', (0, 0), (-1, -1), 0.5, LIGNE),
                               ('TOPPADDING', (0, 0), (-1, -1), 3), ('BOTTOMPADDING', (0, 0), (-1, -1), 3)]))
        s += [KeepTogether([t]), Spacer(1, 5 * mm)]
    doc.build(s)

# ============================================================== 2. Premiers pas
def premiers_pas():
    doc = make_doc(os.path.join(OUT, 'premiers-pas-dans-la-foi.pdf'), 'Premiers pas\ndans la foi',
                   'Un petit guide pour celles et ceux\nqui viennent de rencontrer Jésus.', 'Livret gratuit')
    s = start()
    sections = [
      ('Bienvenue dans la famille de Dieu',
       ['Vous avez décidé de suivre Jésus : c’est le plus beau commencement. Ce livret vous propose quelques repères simples pour grandir pas à pas. Personne ne devient mature en un jour : soyez patient avec vous-même, Dieu l’est.'],
       ('Si quelqu’un est en Christ, il est une nouvelle créature. Les choses anciennes sont passées ; voici, toutes choses sont devenues nouvelles.', '2 Corinthiens 5:17'),
       ['Dieu vous aime et vous a pardonné.', 'Vous êtes son enfant : rien ne peut vous séparer de son amour (Romains 8:38-39).', 'Le Saint-Esprit habite en vous pour vous guider.']),
      ('Parler avec Dieu : la prière',
       ['Prier, c’est parler à Dieu simplement, comme à un père qui vous écoute. Pas besoin de grands mots : dites-lui merci, confiez-lui vos soucis, demandez-lui de l’aide, et prenez le temps d’écouter.'],
       ('Ne vous inquiétez de rien ; mais en toute chose faites connaître vos besoins à Dieu par des prières et des supplications, avec des actions de grâces.', 'Philippiens 4:6'),
       ['Commencez par cinq minutes le matin.', 'Utilisez le « Notre Père » (Matthieu 6:9-13) comme modèle.', 'Notez vos sujets de prière et les réponses reçues.']),
      ('Écouter Dieu : la Bible',
       ['La Bible est la Parole de Dieu. Pour commencer, lisez l’Évangile de Jean, un chapitre par jour, puis le livre des Psaumes et l’Évangile de Marc.'],
       ('Toute Écriture est inspirée de Dieu, et utile pour enseigner, pour convaincre, pour corriger, pour instruire dans la justice.', '2 Timothée 3:16'),
       ['Lisez lentement et posez-vous trois questions : Que dit ce texte de Dieu ? Que dit-il de moi ? Que vais-je faire ?', 'Soulignez un verset par jour et apprenez-le.', 'Posez vos questions à un pasteur ou à un frère/une sœur plus avancé(e).']),
      ('Grandir avec les autres : l’Église',
       ['On ne grandit pas seul. L’Église est une famille où l’on adore Dieu ensemble, où l’on apprend et où l’on se soutient.'],
       ('Persévérez dans l’enseignement des apôtres, dans la communion fraternelle, dans la fraction du pain, et dans les prières.', 'd’après Actes 2:42'),
       ['Participez au culte chaque semaine.', 'Rejoignez un groupe de maison ou de prière.', 'Trouvez un(e) chrétien(ne) mature qui puisse vous accompagner.']),
      ('Le baptême et la vie nouvelle',
       ['Le baptême est le signe public de votre foi : vous dites devant tous que vous appartenez à Jésus. Parlez-en au pasteur de votre église.',
        'La vie chrétienne n’est pas une liste d’interdits, mais une relation qui transforme. Quand vous tombez, relevez-vous : Dieu pardonne celui qui revient à lui (1 Jean 1:9).'],
       ('Allez, faites de toutes les nations des disciples, les baptisant au nom du Père, du Fils et du Saint-Esprit.', 'Matthieu 28:19'),
       ['Remerciez Dieu chaque jour pour son salut.', 'Racontez à quelqu’un ce que Jésus a fait pour vous.', 'Servez : chacun a un don à mettre au service des autres.']),
    ]
    for i, (titre, paras, (v, r), pts) in enumerate(sections):
        s.append(Paragraph(f'{i + 1}. {titre}', st['h1']))
        s += [Paragraph(p, st['p']) for p in paras]
        s += [Paragraph(f'« {v} »', st['verse']), Paragraph(r, st['ref']), Paragraph('À retenir', st['h2'])]
        s += bullets(pts)
        s.append(Spacer(1, 8 * mm))
    s += [Paragraph('Ma prière d’engagement', st['h2']),
          Paragraph('Seigneur Jésus, merci de m’avoir aimé et sauvé. Je veux te suivre chaque jour. Apprends-moi à prier, à lire ta Parole et à aimer comme toi. Remplis-moi de ton Esprit. Amen.', st['verse']),
          Spacer(1, 4 * mm), Paragraph('Date : ____________________   Signature : ____________________', st['p'])]
    doc.build(s)

# ============================================================== 3. Carnet de méditation
def carnet():
    doc = make_doc(os.path.join(OUT, 'carnet-de-meditation.pdf'), 'Carnet de\nméditation',
                   'Une page par semaine pour lire, prier\net garder la trace des bontés de Dieu.', 'À imprimer')
    s = start()
    s += [Paragraph('Mode d’emploi', st['h1']),
          Paragraph('Imprimez autant de pages que nécessaire. Chaque semaine, notez le passage lu, ce que Dieu vous a montré, vos sujets de prière et vos raisons de dire merci. Relisez votre carnet de temps en temps : vous verrez la fidélité de Dieu.', st['p']),
          Paragraph('« Mon âme, bénis l’Éternel, et n’oublie aucun de ses bienfaits ! »', st['verse']), Paragraph('Psaume 103:2', st['ref']),
          PageBreak()]
    for k in range(8):
        s += [Paragraph(f'Semaine du ____ / ____ / ________', st['h1']),
              Paragraph('Passage lu', st['h2']), ligne_ecriture(2),
              Paragraph('Ce que Dieu me montre', st['h2']), ligne_ecriture(5),
              Paragraph('Mes sujets de prière', st['h2']), ligne_ecriture(4),
              Paragraph('Merci, Seigneur, pour…', st['h2']), ligne_ecriture(3),
              Paragraph('Un verset à garder', st['h2']), ligne_ecriture(2)]
        if k < 7: s.append(PageBreak())
    doc.build(s)

# ============================================================== 4. Guide 21 jours
JOURS21 = [
 ("Dieu est bon", "Psaume 34:9", "Sentez et voyez combien l’Éternel est bon ! Heureux l’homme qui cherche en lui son refuge !", "Remerciez Dieu pour trois bontés précises de cette semaine."),
 ("Dieu m’écoute", "Jérémie 33:3", "Invoque-moi, et je te répondrai ; je t’annoncerai de grandes choses, des choses cachées, que tu ne connais pas.", "Présentez-lui la question qui vous préoccupe le plus."),
 ("Prier avec confiance", "Hébreux 4:16", "Approchons-nous donc avec assurance du trône de la grâce, afin d’obtenir miséricorde et de trouver grâce, pour être secourus dans nos besoins.", "Demandez son secours pour un besoin concret."),
 ("Le Notre Père", "Matthieu 6:9-10", "Notre Père qui es aux cieux ! Que ton nom soit sanctifié ; que ton règne vienne ; que ta volonté soit faite sur la terre comme au ciel.", "Priez lentement le Notre Père, phrase par phrase."),
 ("Le pain de ce jour", "Matthieu 6:11", "Donne-nous aujourd’hui notre pain quotidien.", "Confiez-lui vos besoins matériels d’aujourd’hui seulement."),
 ("Demander pardon", "1 Jean 1:9", "Si nous confessons nos péchés, il est fidèle et juste pour nous les pardonner, et pour nous purifier de toute iniquité.", "Faites le point sur votre cœur et recevez son pardon."),
 ("Pardonner", "Éphésiens 4:32", "Soyez bons les uns envers les autres, compatissants, vous pardonnant réciproquement, comme Dieu vous a pardonnés en Christ.", "Bénissez dans la prière une personne qui vous a blessé."),
 ("La paix de Dieu", "Jean 14:27", "Je vous laisse la paix, je vous donne ma paix. Je ne vous donne pas comme le monde donne. Que votre cœur ne se trouble point, et ne s’alarme point.", "Nommez vos inquiétudes et échangez-les contre sa paix."),
 ("La force dans la faiblesse", "2 Corinthiens 12:9", "Ma grâce te suffit, car ma puissance s’accomplit dans la faiblesse.", "Présentez-lui un domaine où vous vous sentez faible."),
 ("Prier pour sa famille", "Josué 24:15", "Moi et ma maison, nous servirons l’Éternel.", "Priez pour chaque membre de votre famille par son nom."),
 ("Prier pour ses enfants", "Proverbes 22:6", "Instruis l’enfant selon la voie qu’il doit suivre ; et quand il sera vieux, il ne s’en détournera pas.", "Priez pour les enfants de votre entourage et leur avenir."),
 ("Prier pour l’Église", "Éphésiens 3:20-21", "Or, à celui qui peut faire, par la puissance qui agit en nous, infiniment au-delà de tout ce que nous demandons ou pensons, à lui soit la gloire dans l’Église.", "Priez pour vos pasteurs et pour l’unité des croyants."),
 ("Prier pour son pays", "1 Timothée 2:1-2", "J’exhorte donc, avant toutes choses, à faire des prières, des supplications, des requêtes, des actions de grâces, pour tous les hommes, pour les rois et pour tous ceux qui sont élevés en dignité.", "Priez pour vos dirigeants et pour la paix de votre pays."),
 ("Prier pour les malades", "Jacques 5:16", "Priez les uns pour les autres, afin que vous soyez guéris. La prière agissante du juste a une grande efficacité.", "Priez pour trois personnes malades ou éprouvées."),
 ("La direction de Dieu", "Proverbes 3:5-6", "Confie-toi en l’Éternel de tout ton cœur, et ne t’appuie pas sur ta sagesse ; reconnais-le dans toutes tes voies, et il aplanira tes sentiers.", "Présentez-lui une décision à prendre."),
 ("Le travail", "Colossiens 3:23", "Tout ce que vous faites, faites-le de bon cœur, comme pour le Seigneur et non pour des hommes.", "Consacrez-lui votre travail ou vos études."),
 ("Être une lumière", "Matthieu 5:16", "Que votre lumière luise ainsi devant les hommes, afin qu’ils voient vos bonnes œuvres, et qu’ils glorifient votre Père qui est dans les cieux.", "Demandez une occasion de servir quelqu’un aujourd’hui."),
 ("Les amis qui ne connaissent pas Dieu", "Romains 10:14", "Comment donc invoqueront-ils celui en qui ils n’ont pas cru ? Et comment croiront-ils en celui dont ils n’ont pas entendu parler ?", "Priez pour trois amis par leur nom."),
 ("Persévérer", "Luc 18:1", "Jésus leur adressa une parabole, pour montrer qu’il faut toujours prier, et ne point se relâcher.", "Reprenez une prière que vous aviez abandonnée."),
 ("Rendre grâce", "1 Thessaloniciens 5:18", "Rendez grâces en toutes choses, car c’est à votre égard la volonté de Dieu en Jésus-Christ.", "Écrivez vingt raisons de dire merci."),
 ("Adorer", "Psaume 95:6", "Venez, prosternons-nous et humilions-nous, fléchissons le genou devant l’Éternel, notre créateur !", "Passez dix minutes à adorer Dieu pour qui il est, sans rien demander."),
]
def guide21():
    doc = make_doc(os.path.join(OUT, 'guide-de-priere-21-jours.pdf'), 'Guide de prière\n21 jours',
                   'Un thème, un verset et une prière par jour\npour approfondir votre communion avec Dieu.', 'Premium')
    s = start()
    s += [Paragraph('Avant de commencer', st['h1']),
          Paragraph('Réservez chaque jour 15 à 20 minutes, au même moment si possible. Lisez le verset deux fois, lentement. Laissez un temps de silence, puis priez à partir de la proposition du jour. Notez ce que vous recevez.', st['p'])]
    s += bullets(['Semaine 1 : connaître le Dieu qui écoute.', 'Semaine 2 : prier pour les autres.', 'Semaine 3 : marcher avec Dieu au quotidien.'])
    s.append(Spacer(1, 6 * mm))
    for i, (theme, ref, verset, prop) in enumerate(JOURS21):
        bloc = [Paragraph(f'Jour {i + 1} — {theme}', st['h2']),
                Paragraph(f'« {verset} »', st['verse']), Paragraph(ref, st['ref']),
                Paragraph(f'<b>Prière :</b> {prop}', st['p']),
                Paragraph('Ce que je retiens :', st['small']), ligne_ecriture(2), Spacer(1, 4 * mm)]
        s.append(KeepTogether(bloc))
        if i in (6, 13): s.append(PageBreak())
    doc.build(s)

# ============================================================== 5. Béatitudes
BEAT = [
 ("Heureux les pauvres en esprit, car le royaume des cieux est à eux !", "Matthieu 5:3", "Être « pauvre en esprit », c’est reconnaître que l’on a besoin de Dieu. Le royaume s’ouvre à ceux qui ne prétendent pas se suffire à eux-mêmes.", ["Dans quels domaines ai-je du mal à reconnaître mon besoin de Dieu ?", "Comment l’humilité change-t-elle nos relations ?"]),
 ("Heureux les affligés, car ils seront consolés !", "Matthieu 5:4", "Jésus ne promet pas l’absence de larmes, mais la consolation. Il pleure avec ceux qui pleurent et nous rend capables de consoler à notre tour (2 Corinthiens 1:4).", ["Quelle consolation ai-je déjà reçue de Dieu ?", "Qui, autour de moi, a besoin d’être consolé ?"]),
 ("Heureux les débonnaires, car ils hériteront la terre !", "Matthieu 5:5", "La douceur n’est pas de la faiblesse : c’est une force maîtrisée, remise entre les mains de Dieu.", ["Dans quelles situations ai-je tendance à réagir avec dureté ?", "Comment Jésus a-t-il montré sa douceur ?"]),
 ("Heureux ceux qui ont faim et soif de la justice, car ils seront rassasiés !", "Matthieu 5:6", "Avoir faim de justice, c’est désirer que la volonté de Dieu soit faite, en nous et autour de nous.", ["Qu’est-ce qui nourrit vraiment ma faim de Dieu ?", "Quelle injustice me touche, et que puis-je faire ?"]),
 ("Heureux les miséricordieux, car ils obtiendront miséricorde !", "Matthieu 5:7", "La miséricorde reçue devient miséricorde donnée. Elle se voit dans le pardon et dans l’aide concrète apportée aux plus faibles.", ["Envers qui suis-je appelé à faire miséricorde aujourd’hui ?", "Quel geste concret puis-je poser cette semaine ?"]),
 ("Heureux ceux qui ont le cœur pur, car ils verront Dieu !", "Matthieu 5:8", "Un cœur pur est un cœur sans partage, tourné vers Dieu. Il ne s’agit pas de perfection, mais de sincérité.", ["Qu’est-ce qui divise mon cœur ?", "Quelles habitudes m’aident à garder un cœur pur ?"]),
 ("Heureux ceux qui procurent la paix, car ils seront appelés fils de Dieu !", "Matthieu 5:9", "Procurer la paix, c’est plus qu’éviter les conflits : c’est réconcilier, construire des ponts, comme Dieu l’a fait pour nous en Christ.", ["Où suis-je appelé à être un artisan de paix ?", "Comment parler vrai sans blesser ?"]),
 ("Heureux ceux qui sont persécutés pour la justice, car le royaume des cieux est à eux !", "Matthieu 5:10-12", "Suivre Jésus peut coûter : moqueries, rejet, parfois davantage. Mais la récompense est grande, et nous ne sommes pas seuls.", ["Ai-je déjà eu honte de ma foi ? Pourquoi ?", "Comment soutenir les chrétiens persécutés ?"]),
]
def beatitudes():
    doc = make_doc(os.path.join(OUT, 'etude-biblique-beatitudes.pdf'), 'Étude biblique :\nles Béatitudes',
                   'Huit leçons sur Matthieu 5:1-12\npour l’étude personnelle ou en groupe.', 'Premium')
    s = start()
    s += [Paragraph('Introduction', st['h1']),
          Paragraph('Les Béatitudes ouvrent le Sermon sur la montagne. Jésus y décrit le bonheur véritable, souvent à l’opposé de ce que le monde appelle bonheur. Chaque leçon propose le texte, une explication et des questions de discussion. Comptez 30 à 45 minutes par leçon.', st['p']),
          Paragraph('« Voyant la foule, Jésus monta sur la montagne ; et, après qu’il se fut assis, ses disciples s’approchèrent de lui. Puis, ayant ouvert la bouche, il les enseigna. »', st['verse']),
          Paragraph('Matthieu 5:1-2', st['ref']), PageBreak()]
    for i, (v, r, expl, qs) in enumerate(BEAT):
        s += [Paragraph(f'Leçon {i + 1}', st['h2']), Paragraph(f'« {v} »', st['verse']), Paragraph(r, st['ref']),
              Paragraph(expl, st['p']), Paragraph('Questions', st['h2'])]
        s += bullets(qs)
        s += [Paragraph('Mes notes', st['h2']), ligne_ecriture(4)]
        if i < len(BEAT) - 1: s.append(PageBreak())
    doc.build(s)

# ============================================================== 6. 30 versets
VERSETS = [
 ("Confiance", "Proverbes 3:5", "Confie-toi en l’Éternel de tout ton cœur, et ne t’appuie pas sur ta sagesse."),
 ("Confiance", "Psaume 56:4", "Quand je suis dans la crainte, en toi je me confie."),
 ("Confiance", "Ésaïe 26:3", "À celui qui est ferme dans ses sentiments tu assures la paix, la paix, parce qu’il se confie en toi."),
 ("Confiance", "Psaume 37:5", "Recommande ton sort à l’Éternel, mets en lui ta confiance, et il agira."),
 ("Confiance", "Nahum 1:7", "L’Éternel est bon, il est un refuge au jour de la détresse ; il connaît ceux qui se confient en lui."),
 ("Confiance", "Psaume 46:2", "Dieu est pour nous un refuge et un appui, un secours qui ne manque jamais dans la détresse."),
 ("Paix", "Jean 14:27", "Je vous laisse la paix, je vous donne ma paix."),
 ("Paix", "Matthieu 11:28", "Venez à moi, vous tous qui êtes fatigués et chargés, et je vous donnerai du repos."),
 ("Paix", "1 Pierre 5:7", "Déchargez-vous sur lui de tous vos soucis, car lui-même prend soin de vous."),
 ("Paix", "Psaume 4:9", "Je me couche et je m’endors en paix, car toi seul, ô Éternel ! tu me donnes la sécurité dans ma demeure."),
 ("Paix", "Jean 16:33", "Vous aurez des tribulations dans le monde ; mais prenez courage, j’ai vaincu le monde."),
 ("Paix", "Philippiens 4:7", "Et la paix de Dieu, qui surpasse toute intelligence, gardera vos cœurs et vos pensées en Jésus-Christ."),
 ("Pardon", "1 Jean 1:9", "Si nous confessons nos péchés, il est fidèle et juste pour nous les pardonner."),
 ("Pardon", "Éphésiens 4:32", "Soyez bons les uns envers les autres, compatissants, vous pardonnant réciproquement, comme Dieu vous a pardonnés en Christ."),
 ("Pardon", "Psaume 103:12", "Autant l’orient est éloigné de l’occident, autant il éloigne de nous nos transgressions."),
 ("Pardon", "Romains 8:1", "Il n’y a donc maintenant aucune condamnation pour ceux qui sont en Jésus-Christ."),
 ("Pardon", "Colossiens 3:13", "De même que Christ vous a pardonné, pardonnez-vous aussi."),
 ("Pardon", "Michée 7:18", "Il ne garde pas sa colère à toujours, car il prend plaisir à la miséricorde."),
 ("Force", "Philippiens 4:13", "Je puis tout par celui qui me fortifie."),
 ("Force", "Ésaïe 40:31", "Mais ceux qui se confient en l’Éternel renouvellent leur force. Ils prennent le vol comme les aigles."),
 ("Force", "2 Corinthiens 12:9", "Ma grâce te suffit, car ma puissance s’accomplit dans la faiblesse."),
 ("Force", "Josué 1:9", "Fortifie-toi et prends courage ! Car l’Éternel, ton Dieu, est avec toi dans tout ce que tu entreprendras."),
 ("Force", "Psaume 27:1", "L’Éternel est ma lumière et mon salut : de qui aurais-je crainte ?"),
 ("Force", "Néhémie 8:10", "La joie de l’Éternel sera votre force."),
 ("Espérance", "Jérémie 29:11", "Projets de paix et non de malheur, afin de vous donner un avenir et de l’espérance."),
 ("Espérance", "Romains 8:28", "Toutes choses concourent au bien de ceux qui aiment Dieu."),
 ("Espérance", "Lamentations 3:22-23", "Les bontés de l’Éternel ne sont pas épuisées, ses compassions ne sont pas à leur terme ; elles se renouvellent chaque matin."),
 ("Espérance", "Romains 15:13", "Que le Dieu de l’espérance vous remplisse de toute joie et de toute paix dans la foi."),
 ("Espérance", "Apocalypse 21:4", "Il essuiera toute larme de leurs yeux, et la mort ne sera plus."),
 ("Espérance", "Psaume 30:6", "Le soir arrivent les pleurs, et le matin l’allégresse."),
]
def versets():
    doc = make_doc(os.path.join(OUT, '30-versets-a-memoriser.pdf'), '30 versets\nà mémoriser',
                   'Des cartes à découper et à garder sur soi,\nclassées par thème.', 'Premium')
    s = start()
    s += [Paragraph('Comment mémoriser', st['h1']),
          Paragraph('Découpez les cartes le long des pointillés. Apprenez un verset par semaine : lisez-le à voix haute matin et soir, recopiez-le, puis récitez-le à quelqu’un. Gardez la carte dans votre portefeuille ou votre Bible.', st['p']),
          Paragraph('« Je serre ta parole dans mon cœur, afin de ne pas pécher contre toi. »', st['verse']), Paragraph('Psaume 119:11', st['ref'])]
    th_col = {'Confiance': TERRE, 'Paix': colors.HexColor('#0f6b6b'), 'Pardon': colors.HexColor('#7c2d5b'), 'Force': colors.HexColor('#c2410c'), 'Espérance': colors.HexColor('#b7791f')}
    cards = []
    for th, ref, txt in VERSETS:
        cards.append([Paragraph(f'<font color="{th_col[th].hexval().replace("0x", "#")}"><b>{th.upper()}</b></font>', st['small']),
                      Paragraph(f'« {txt} »', ParagraphStyle('c', parent=st['cell'], fontName='Serif-I', fontSize=10, leading=13.5)),
                      Paragraph(f'<b>{ref}</b>', st['small'])])
    rows = []
    for i in range(0, len(cards), 2):
        rows.append([cards[i], cards[i + 1] if i + 1 < len(cards) else ''])
    t = Table(rows, colWidths=[87 * mm, 87 * mm], rowHeights=[40 * mm] * len(rows))
    t.setStyle(TableStyle([('GRID', (0, 0), (-1, -1), 0.6, LIGNE), ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                           ('LEFTPADDING', (0, 0), (-1, -1), 9), ('RIGHTPADDING', (0, 0), (-1, -1), 9),
                           ('BACKGROUND', (0, 0), (-1, -1), colors.white)]))
    s += [Spacer(1, 4 * mm), t]
    doc.build(s)

plan_lecture(); premiers_pas(); carnet(); guide21(); beatitudes(); versets()
for f in sorted(os.listdir(OUT)):
    if f.endswith('.pdf'): print(f, os.path.getsize(os.path.join(OUT, f)))
