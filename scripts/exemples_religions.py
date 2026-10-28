# -*- coding: utf-8 -*-
"""
Contenus d'exemple Islam + Spiritualité universelle (version 2 des exemples).
Ajoute au fichier seed/contenus.json :
  - deux guides provisoires (renommables dans l'administration) ;
  - les publications (paroles, enseignements, contenus spirituels) ;
  - 6 livres PDF dans seed/documents/.
    python3 scripts/exemples_religions.py
Les traductions du Coran sont des « traductions du sens » rédigées pour la plateforme :
faites-les relire par une personne qualifiée avant une large diffusion.
"""
import json, os
from pathlib import Path
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, NextPageTemplate
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.fonts import addMapping

RACINE = Path(__file__).resolve().parent.parent
SEED = RACINE / 'seed'
DOCS = SEED / 'documents'
F = '/usr/share/fonts/truetype/dejavu/'
for n, f in [('Serif', 'DejaVuSerif'), ('Serif-B', 'DejaVuSerif-Bold'), ('Serif-I', 'DejaVuSerif-Italic'), ('Sans', 'DejaVuSans'), ('Sans-B', 'DejaVuSans-Bold')]:
    pdfmetrics.registerFont(TTFont(n, F + f + '.ttf'))
addMapping('Serif', 0, 0, 'Serif'); addMapping('Serif', 1, 0, 'Serif-B'); addMapping('Serif', 0, 1, 'Serif-I'); addMapping('Serif', 1, 1, 'Serif-B')
addMapping('Sans', 0, 0, 'Sans'); addMapping('Sans', 1, 0, 'Sans-B'); addMapping('Sans', 0, 1, 'Sans'); addMapping('Sans', 1, 1, 'Sans-B')

ENCRE = colors.HexColor('#1f1d1a'); GRIS = colors.HexColor('#6b6660'); IVOIRE = colors.HexColor('#fbf8f2'); OR = colors.HexColor('#d9a23d')
PALETTES = {
    'musulman': dict(fond=colors.HexColor('#0b3b38'), bande=colors.HexColor('#0f766e'), doux=colors.HexColor('#e3f1ee'), ligne=colors.HexColor('#cfe3de'), titre=colors.HexColor('#0f766e')),
    'universel': dict(fond=colors.HexColor('#241d4f'), bande=colors.HexColor('#5b4fb3'), doux=colors.HexColor('#ecebf8'), ligne=colors.HexColor('#dcd9f0'), titre=colors.HexColor('#5b4fb3')),
}

def styles(pal):
    return {
        'h1': ParagraphStyle('h1', fontName='Serif-B', fontSize=22, leading=27, textColor=ENCRE, spaceAfter=8),
        'h2': ParagraphStyle('h2', fontName='Serif-B', fontSize=14.5, leading=18.5, textColor=pal['titre'], spaceBefore=10, spaceAfter=5),
        'p': ParagraphStyle('p', fontName='Sans', fontSize=10.5, leading=15.5, textColor=ENCRE, spaceAfter=6),
        'small': ParagraphStyle('small', fontName='Sans', fontSize=8.5, leading=12, textColor=GRIS),
        'verse': ParagraphStyle('verse', fontName='Serif-I', fontSize=11.5, leading=16.5, textColor=ENCRE, leftIndent=10, borderPadding=(6, 8, 6, 10), spaceBefore=4, spaceAfter=8, backColor=pal['doux']),
        'ref': ParagraphStyle('ref', fontName='Sans-B', fontSize=9, leading=12, textColor=pal['titre'], spaceAfter=10),
        'bullet': ParagraphStyle('bullet', fontName='Sans', fontSize=10.5, leading=15, textColor=ENCRE, leftIndent=14, bulletIndent=2, spaceAfter=3),
        'cell': ParagraphStyle('cell', fontName='Sans', fontSize=8.8, leading=11.5, textColor=ENCRE),
        'cellb': ParagraphStyle('cellb', fontName='Sans-B', fontSize=9, leading=11.5, textColor=colors.white),
    }

def make_doc(nom, titre, sous_titre, surtitre, religion, mention):
    pal = PALETTES[religion]
    W, H = A4
    import math
    def couverture(c, d):
        c.saveState()
        c.setFillColor(pal['fond']); c.rect(0, 0, W, H, fill=1, stroke=0)
        c.setFillColor(pal['bande']); c.rect(0, H * 0.42, W, H * 0.58, fill=1, stroke=0)
        c.setStrokeColor(OR); c.setLineWidth(0.8)
        if religion == 'musulman':   # motif d'étoiles à 8 branches
            pas = 26 * mm
            for j in range(0, 12):
                for i in range(-1, 10):
                    cx = i * pas + (pas / 2 if j % 2 else 0); cy = H * 0.42 + j * pas * 0.86
                    r = pas * 0.36
                    for rot in (0, math.pi / 4):
                        p = c.beginPath()
                        pts = [(cx + r * math.cos(rot + k * math.pi / 2), cy + r * math.sin(rot + k * math.pi / 2)) for k in range(4)]
                        p.moveTo(*pts[0]); [p.lineTo(*q) for q in pts[1:]]; p.close(); c.drawPath(p, stroke=1, fill=0)
        else:                        # soleil levant
            cx, cy = W * 0.72, H * 0.42
            for k in range(19):
                a = math.pi * k / 18
                c.line(cx, cy, cx + math.cos(a) * 140 * mm, cy + math.sin(a) * 140 * mm)
            c.setFillColor(OR); c.circle(cx, cy, 26 * mm, fill=1, stroke=0)
        c.setFillColor(pal['bande']); c.rect(14 * mm, H * 0.42 + 40 * mm, W - 28 * mm, 52 * mm, fill=1, stroke=0)
        c.setFillColor(colors.white); c.setFont('Serif-B', 16); c.drawString(22 * mm, H - 30 * mm, 'Ame & Vie')
        c.setFont('Sans', 8.5); c.drawString(22 * mm, H - 35 * mm, 'Plateforme spirituelle')
        c.setFillColor(OR); c.setFont('Sans-B', 9.5); c.drawString(22 * mm, H * 0.42 + 82 * mm, surtitre.upper())
        c.setFillColor(colors.white)
        y = H * 0.42 + 68 * mm
        for ligne in titre.split('\n'):
            c.setFont('Serif-B', 28); c.drawString(22 * mm, y, ligne); y -= 12 * mm
        c.setFillColor(colors.HexColor('#e9e6df')); c.setFont('Serif-I', 12.5)
        y = H * 0.42 - 16 * mm
        for ligne in sous_titre.split('\n'):
            c.drawString(22 * mm, y, ligne); y -= 6.5 * mm
        c.setFillColor(colors.HexColor('#b9b4c9') if religion == 'universel' else colors.HexColor('#a9cbc5')); c.setFont('Sans', 8.2)
        c.drawString(22 * mm, 20 * mm, mention + (' Document réservé aux abonnés Ame & Vie.' if 'Premium' in surtitre else ' Document gratuit à imprimer et partager.'))
        c.restoreState()
    def page(c, d):
        c.saveState()
        c.setFillColor(IVOIRE); c.rect(0, 0, W, H, fill=1, stroke=0)
        c.setFillColor(pal['bande']); c.rect(0, H - 9 * mm, W, 9 * mm, fill=1, stroke=0)
        c.setFillColor(colors.white); c.setFont('Sans-B', 8); c.drawString(18 * mm, H - 6 * mm, 'AME & VIE')
        c.setFont('Sans', 8); c.drawRightString(W - 18 * mm, H - 6 * mm, titre.replace('\n', ' '))
        c.setFillColor(GRIS); c.drawCentredString(W / 2, 10 * mm, f'— {d.page - 1} —')
        c.restoreState()
    doc = BaseDocTemplate(str(DOCS / nom), pagesize=A4, title=titre.replace('\n', ' '), author='Ame & Vie', subject=sous_titre.replace('\n', ' '),
                          leftMargin=18 * mm, rightMargin=18 * mm, topMargin=20 * mm, bottomMargin=18 * mm)
    fr = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id='f')
    doc.addPageTemplates([PageTemplate(id='cover', frames=[fr], onPage=couverture), PageTemplate(id='page', frames=[fr], onPage=page)])
    return doc, styles(pal), pal

def debut():
    return [NextPageTemplate('page'), PageBreak()]

def puces(st, items):
    return [Paragraph(t, st['bullet'], bulletText='•') for t in items]

def lignes(pal, n=3, largeur=174 * mm):
    t = Table([[''] for _ in range(n)], colWidths=[largeur], rowHeights=[8 * mm] * n)
    t.setStyle(TableStyle([('LINEBELOW', (0, 0), (-1, -1), 0.5, pal['ligne'])]))
    return t

MENTION_CORAN = 'Citations du Coran : traduction du sens.'
MENTION_SAGESSE = 'Pensées des sages : citations brèves, d’après des textes anciens.'

# ====================================================================== ISLAM
NOMS = [
 ("Ar-Rahmân", "Le Tout Miséricordieux"), ("Ar-Rahîm", "Le Très Miséricordieux"), ("Al-Malik", "Le Souverain"), ("Al-Quddûs", "Le Pur, le Saint"),
 ("As-Salâm", "La Paix"), ("Al-Mu'min", "Celui qui accorde la sécurité"), ("Al-Muhaymin", "Le Protecteur vigilant"), ("Al-'Azîz", "Le Tout-Puissant"),
 ("Al-Jabbâr", "Celui qui contraint et qui répare"), ("Al-Mutakabbir", "Celui à qui appartient la grandeur"), ("Al-Khâliq", "Le Créateur"), ("Al-Bâri'", "Celui qui donne l'existence"),
 ("Al-Musawwir", "Celui qui donne forme"), ("Al-Ghaffâr", "Celui qui pardonne sans cesse"), ("Al-Qahhâr", "Le Dominateur suprême"), ("Al-Wahhâb", "Le Donateur généreux"),
 ("Ar-Razzâq", "Celui qui pourvoit à tout"), ("Al-Fattâh", "Celui qui ouvre les portes"), ("Al-'Alîm", "L'Omniscient"), ("Al-Qâbid", "Celui qui retient"),
 ("Al-Bâsit", "Celui qui étend ses dons"), ("Al-Khâfid", "Celui qui abaisse"), ("Ar-Râfi'", "Celui qui élève"), ("Al-Mu'izz", "Celui qui honore"),
 ("Al-Mudhill", "Celui qui humilie"), ("As-Samî'", "Celui qui entend tout"), ("Al-Basîr", "Celui qui voit tout"), ("Al-Hakam", "Le Juge"),
 ("Al-'Adl", "Le Juste"), ("Al-Latîf", "Le Subtil, le Bienveillant"), ("Al-Khabîr", "Le Parfaitement Informé"), ("Al-Halîm", "Le Longanime"),
 ("Al-'Azîm", "L'Immense"), ("Al-Ghafûr", "Le Pardonneur"), ("Ash-Shakûr", "Le Reconnaissant"), ("Al-'Aliyy", "Le Très-Haut"),
 ("Al-Kabîr", "Le Grand"), ("Al-Hafîz", "Le Gardien"), ("Al-Muqît", "Celui qui nourrit et veille"), ("Al-Hasîb", "Celui qui tient compte de tout"),
 ("Al-Jalîl", "Le Majestueux"), ("Al-Karîm", "Le Généreux"), ("Ar-Raqîb", "Le Vigilant"), ("Al-Mujîb", "Celui qui exauce"),
 ("Al-Wâsi'", "Le Vaste"), ("Al-Hakîm", "Le Sage"), ("Al-Wadûd", "Le Bien-Aimant"), ("Al-Majîd", "Le Glorieux"),
 ("Al-Bâ'ith", "Celui qui ressuscite"), ("Ash-Shahîd", "Le Témoin"), ("Al-Haqq", "La Vérité"), ("Al-Wakîl", "Celui à qui l'on se confie"),
 ("Al-Qawiyy", "Le Fort"), ("Al-Matîn", "L'Inébranlable"), ("Al-Waliyy", "L'Allié protecteur"), ("Al-Hamîd", "Le Digne de louange"),
 ("Al-Muhsî", "Celui qui dénombre tout"), ("Al-Mubdi'", "Celui qui commence la création"), ("Al-Mu'îd", "Celui qui la fait revenir"), ("Al-Muhyî", "Celui qui donne la vie"),
 ("Al-Mumît", "Celui qui donne la mort"), ("Al-Hayy", "Le Vivant"), ("Al-Qayyûm", "Celui qui subsiste par Lui-même"), ("Al-Wâjid", "Celui qui ne manque de rien"),
 ("Al-Mâjid", "L'Illustre"), ("Al-Wâhid", "L'Unique"), ("Al-Ahad", "L'Un"), ("As-Samad", "Celui vers qui l'on se tourne"),
 ("Al-Qâdir", "Le Capable"), ("Al-Muqtadir", "Le Tout-Puissant en acte"), ("Al-Muqaddim", "Celui qui fait avancer"), ("Al-Mu'akhkhir", "Celui qui retarde"),
 ("Al-Awwal", "Le Premier"), ("Al-Âkhir", "Le Dernier"), ("Az-Zâhir", "L'Apparent"), ("Al-Bâtin", "Le Caché"),
 ("Al-Wâlî", "Celui qui gouverne"), ("Al-Muta'âlî", "Le Sublime"), ("Al-Barr", "Le Bienfaisant"), ("At-Tawwâb", "Celui qui accueille le repentir"),
 ("Al-Muntaqim", "Celui qui rend justice"), ("Al-'Afuww", "Celui qui efface les fautes"), ("Ar-Ra'ûf", "Le Plein de tendresse"), ("Mâlik al-Mulk", "Le Maître de la royauté"),
 ("Dhû-l-Jalâli wa-l-Ikrâm", "Le Détenteur de la majesté et de la générosité"), ("Al-Muqsit", "L'Équitable"), ("Al-Jâmi'", "Celui qui rassemble"), ("Al-Ghaniyy", "Celui qui se suffit à Lui-même"),
 ("Al-Mughnî", "Celui qui enrichit"), ("Al-Mâni'", "Celui qui protège et empêche"), ("Ad-Dârr", "Celui qui éprouve"), ("An-Nâfi'", "Celui qui accorde le bienfait"),
 ("An-Nûr", "La Lumière"), ("Al-Hâdî", "Le Guide"), ("Al-Badî'", "L'Inventeur sans modèle"), ("Al-Bâqî", "L'Éternel"),
 ("Al-Wârith", "L'Héritier"), ("Ar-Rashîd", "Celui qui conduit avec droiture"), ("As-Sabûr", "Le Patient"),
]
assert len(NOMS) == 99, len(NOMS)

def pdf_noms():
    doc, st, pal = make_doc('99-noms-d-allah.pdf', 'Les 99 plus beaux\nnoms d’Allah', 'Une liste à méditer, un nom chaque jour,\navec une courte invitation à la prière.', 'Premium · Islam', 'musulman', MENTION_CORAN)
    s = debut()
    s += [Paragraph('Avant de commencer', st['h1']),
          Paragraph('« À Allah appartiennent les plus beaux noms : invoquez-Le par ces noms. » (Coran 7:180, traduction du sens)', st['verse']),
          Paragraph('Cette liste suit la tradition la plus répandue (rapportée par at-Tirmidhî). Les traductions françaises ne rendent jamais toute la richesse de l’arabe : elles ouvrent une porte à la méditation.', st['p'])]
    s += puces(st, ['Choisissez un nom par jour et répétez-le calmement.', 'Demandez-vous : qu’est-ce que ce nom change dans ma manière de vivre aujourd’hui ?', 'Faites une invocation personnelle à partir de ce nom.'])
    s.append(Spacer(1, 5 * mm))
    lignes_t = [[Paragraph('N°', st['cellb']), Paragraph('Nom', st['cellb']), Paragraph('Sens', st['cellb'])]]
    for i, (n, sens) in enumerate(NOMS, 1):
        lignes_t.append([Paragraph(str(i), st['cell']), Paragraph(f'<b>{n}</b>', st['cell']), Paragraph(sens, st['cell'])])
    t = Table(lignes_t, colWidths=[12 * mm, 62 * mm, 100 * mm], repeatRows=1)
    t.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, 0), pal['bande']), ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, pal['doux']]),
                           ('GRID', (0, 0), (-1, -1), 0.4, pal['ligne']), ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'), ('TOPPADDING', (0, 0), (-1, -1), 4), ('BOTTOMPADDING', (0, 0), (-1, -1), 4)]))
    s.append(t)
    s += [Spacer(1, 6 * mm), Paragraph('Mes noms préférés et ce qu’ils me disent', st['h2']), lignes(pal, 8)]
    doc.build(s)

ETAPES_SALAT = [
 ("L’intention (niyya)", "Dans le cœur, on décide d’accomplir telle prière pour Allah. Elle ne se prononce pas forcément à voix haute."),
 ("Le takbîr d’ouverture", "Debout, tourné vers la qibla, on lève les mains à hauteur des épaules ou des oreilles en disant « Allâhu akbar » (Allah est le plus grand)."),
 ("La récitation", "On récite la sourate al-Fâtiha, puis, dans les deux premières unités, un passage du Coran (par exemple la sourate al-Ikhlâs)."),
 ("L’inclinaison (rukû’)", "On s’incline, mains sur les genoux, dos droit, en glorifiant Allah : « Subhâna rabbiya-l-‘azîm »."),
 ("Le redressement", "On se redresse en disant « Sami‘a-llâhu liman hamidah », puis « Rabbanâ wa laka-l-hamd »."),
 ("La prosternation (sujûd)", "Front, nez, mains, genoux et orteils au sol : « Subhâna rabbiya-l-a‘lâ ». On s’assoit brièvement, puis on se prosterne une seconde fois."),
 ("La position assise (tashahhud)", "Après deux unités, et à la fin de la prière, on s’assoit et on récite l’attestation de foi et les salutations sur le Prophète."),
 ("La salutation finale (taslîm)", "On tourne la tête à droite puis à gauche en disant « As-salâmu ‘alaykum wa rahmatu-llâh »."),
]
def pdf_salat():
    doc, st, pal = make_doc('guide-priere-salat-debutants.pdf', 'Guide de la prière\npour débutants', 'Les ablutions, les cinq prières\net les gestes, expliqués simplement.', 'Gratuit · Islam', 'musulman', MENTION_CORAN)
    s = debut()
    s += [Paragraph('La prière, rendez-vous avec Allah', st['h1']),
          Paragraph('« Accomplis la prière, car la prière préserve de la turpitude et du blâmable. » (Coran 29:45, traduction du sens)', st['verse']),
          Paragraph('Ce guide donne les grandes étapes. Les écoles juridiques présentent quelques différences de détail : pour bien apprendre, faites-vous accompagner par l’imam de votre mosquée ou une personne de confiance.', st['p']),
          Paragraph('1. Les ablutions (wudû’)', st['h2'])]
    s += puces(st, ['Formuler l’intention et dire « Bismillâh ».', 'Laver les mains jusqu’aux poignets (3 fois).', 'Se rincer la bouche, puis le nez (3 fois).',
                    'Laver le visage (3 fois), puis les avant-bras jusqu’aux coudes, en commençant par le droit (3 fois).', 'Passer les mains mouillées sur la tête, puis essuyer les oreilles.', 'Laver les pieds jusqu’aux chevilles, en commençant par le droit (3 fois).'])
    s += [Paragraph('2. Les cinq prières du jour', st['h2'])]
    t = Table([[Paragraph(x, st['cellb']) for x in ('Prière', 'Moment', 'Unités obligatoires')]] + [[Paragraph(a, st['cell']), Paragraph(b, st['cell']), Paragraph(c, st['cell'])] for a, b, c in [
        ('Fajr (aube)', 'De l’aube au lever du soleil', '2'), ('Dhuhr (midi)', 'Après le passage du soleil au zénith', '4'), ('‘Asr (après-midi)', 'Milieu de l’après-midi', '4'),
        ('Maghrib (coucher)', 'Juste après le coucher du soleil', '3'), ('‘Ishâ’ (nuit)', 'À la tombée de la nuit', '4')]],
        colWidths=[48 * mm, 80 * mm, 46 * mm])
    t.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, 0), pal['bande']), ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, pal['doux']]), ('GRID', (0, 0), (-1, -1), 0.4, pal['ligne']), ('TOPPADDING', (0, 0), (-1, -1), 5), ('BOTTOMPADDING', (0, 0), (-1, -1), 5)]))
    s += [t, Paragraph('3. Les étapes d’une unité de prière (rak‘a)', st['h2'])]
    for i, (titre, texte) in enumerate(ETAPES_SALAT, 1):
        s.append(KeepTogether([Paragraph(f'<b>{i}. {titre}</b>', st['p']), Paragraph(texte, st['p'])]))
    s += [Paragraph('4. Pour progresser', st['h2'])]
    s += puces(st, ['Apprenez d’abord al-Fâtiha et une courte sourate.', 'Priez avec d’autres quand c’est possible.', 'Soyez patient avec vous-même : la régularité compte plus que la perfection.'])
    doc.build(s)

RAMADAN = [
 ("L’intention", "Je confie ce mois à Allah et je choisis trois objectifs simples.", "Noter mes trois objectifs."),
 ("La patience", "Le jeûne apprend à attendre et à se maîtriser.", "Répondre avec calme à une contrariété."),
 ("La gratitude", "Chaque datte et chaque gorgée d’eau deviennent un don.", "Remercier Allah pour cinq bienfaits."),
 ("La parole", "Le jeûne concerne aussi la langue.", "Éviter toute médisance aujourd’hui."),
 ("Le Coran", "Ramadan est le mois où le Coran a commencé à être révélé.", "Lire une page avec attention."),
 ("La famille", "Rompre le jeûne ensemble resserre les liens.", "Préparer l’iftar avec un proche."),
 ("Les pauvres", "La faim d’un jour rappelle la faim de beaucoup.", "Mettre de côté une aumône."),
 ("Le pardon", "« Ô Allah, Tu es Celui qui efface les fautes, Tu aimes pardonner : pardonne-moi. »", "Pardonner une offense."),
 ("La prière de nuit", "Quelques unités de prière, même courtes, dans le calme.", "Prier deux unités avant de dormir."),
 ("Le corps", "Prendre soin du corps fait partie de l’adoration.", "Boire suffisamment entre l’iftar et le suhûr."),
 ("L’humilité", "Le jeûne nous rappelle notre fragilité.", "Rendre un service discret."),
 ("La sincérité", "Agir pour Allah, non pour être vu.", "Faire une bonne action sans en parler."),
 ("Le voisin", "Le bon voisinage est une part de la foi.", "Partager un plat avec un voisin."),
 ("Les parents", "La bonté envers les parents est très recommandée.", "Appeler ou rendre visite à un parent."),
 ("La mi-parcours", "Faire le point sans se décourager.", "Relire mes objectifs et les ajuster."),
 ("La confiance (tawakkul)", "Faire sa part, puis s’en remettre à Allah.", "Confier un souci précis dans l’invocation."),
 ("Le savoir", "Chercher la science est une adoration.", "Apprendre le sens d’un verset."),
 ("La douceur", "La douceur embellit tout ce qu’elle touche.", "Parler doucement à la maison."),
 ("L’invocation", "Le jeûneur a une invocation qui n’est pas repoussée.", "Invoquer pour trois personnes."),
 ("Les dix dernières nuits", "Elles sont les plus précieuses du mois.", "Préparer un programme pour ces nuits."),
 ("Laylat al-Qadr", "« La Nuit du Destin est meilleure que mille mois. » (97:3)", "Multiplier les invocations ce soir."),
 ("La retraite spirituelle", "Se retirer un peu du bruit pour se rapprocher d’Allah.", "Une heure sans écran."),
 ("Le repentir", "Revenir à Allah, toujours possible.", "Demander pardon pour une faute précise."),
 ("La générosité", "Le Prophète était plus généreux encore pendant Ramadan.", "Donner un peu plus que prévu."),
 ("La fraternité", "Les croyants sont comme un seul corps.", "Prendre des nouvelles d’un ami isolé."),
 ("La persévérance", "Les actes les plus aimés sont les plus réguliers.", "Choisir une bonne habitude à garder après Ramadan."),
 ("La zakât al-fitr", "L’aumône de fin de mois purifie le jeûne.", "Vérifier comment et quand la verser."),
 ("La joie", "La fête est un don d’Allah.", "Préparer un geste pour l’Aïd."),
 ("Le bilan", "Remercier pour ce qui a grandi en moi.", "Écrire ce que ce mois m’a appris."),
 ("Et après ?", "Garder la lumière de Ramadan toute l’année.", "Prévoir quelques jours de jeûne volontaire."),
]
def pdf_ramadan():
    doc, st, pal = make_doc('ramadan-30-jours.pdf', 'Ramadan\n30 jours de réflexion', 'Un thème, une pensée et un geste\npour chaque jour du mois béni.', 'Premium · Islam', 'musulman', MENTION_CORAN)
    s = debut()
    s += [Paragraph('Un mois pour revenir à l’essentiel', st['h1']),
          Paragraph('« Ô les croyants ! On vous a prescrit le jeûne comme on l’a prescrit à ceux d’avant vous, ainsi atteindrez-vous la piété. » (Coran 2:183, traduction du sens)', st['verse']),
          Paragraph('Chaque jour : lisez le thème, méditez la pensée, puis accomplissez le petit geste proposé. Notez ensuite ce que vous retenez.', st['p'])]
    for i, (theme, pensee, geste) in enumerate(RAMADAN, 1):
        s.append(KeepTogether([Paragraph(f'Jour {i} — {theme}', st['h2']), Paragraph(pensee, st['p']), Paragraph(f'<b>Mon geste :</b> {geste}', st['p']), lignes(pal, 2)]))
    doc.build(s)

# ====================================================================== UNIVERSEL
MEDITATION21 = [
 ("Arriver", "Asseyez-vous, dos droit, épaules relâchées. Comptez dix respirations."),
 ("Le souffle", "Observez l’air qui entre et qui sort, sans le changer."),
 ("Le corps", "Parcourez le corps de la tête aux pieds et relâchez chaque tension."),
 ("Les sons", "Accueillez les bruits autour de vous comme une musique."),
 ("Les pensées", "Regardez les pensées passer comme des nuages."),
 ("La pause", "Trois fois aujourd’hui, faites une pause de trois respirations."),
 ("Bilan de la semaine", "Qu’est-ce qui a changé depuis le premier jour ?"),
 ("La gratitude", "Pensez à trois choses simples qui vous font du bien."),
 ("La bienveillance envers soi", "Répétez : « Puissé-je être en paix. »"),
 ("Un proche", "Souhaitez du bien à une personne que vous aimez."),
 ("Une personne neutre", "Souhaitez du bien à quelqu’un que vous connaissez peu."),
 ("Une relation difficile", "Souhaitez, même un peu, la paix à une personne qui vous a blessé."),
 ("Tous les êtres", "Élargissez ce souhait au monde entier."),
 ("Bilan de la semaine", "Quel exercice vous a le plus touché ?"),
 ("Manger en conscience", "Prenez une bouchée lentement, en goûtant vraiment."),
 ("Marcher en conscience", "Marchez cinq minutes en sentant chaque pas."),
 ("Les émotions", "Nommez l’émotion présente, sans la juger."),
 ("Le silence", "Restez dix minutes en silence, sans rien faire d’autre."),
 ("La nature", "Observez un arbre, le ciel ou une plante pendant cinq minutes."),
 ("Le lâcher-prise", "Inspirez « j’accueille », expirez « je laisse aller »."),
 ("Continuer", "Choisissez l’exercice que vous garderez chaque jour."),
]
def pdf_meditation():
    doc, st, pal = make_doc('meditation-21-jours.pdf', 'Méditation\nprogramme de 21 jours', 'Dix minutes par jour pour apaiser l’esprit,\nhabiter son corps et ouvrir son cœur.', 'Premium · Spiritualité universelle', 'universel', MENTION_SAGESSE)
    s = debut()
    s += [Paragraph('Comment utiliser ce programme', st['h1']),
          Paragraph('« Un voyage de mille lieues commence par un premier pas. » — d’après Lao-Tseu', st['verse']),
          Paragraph('Choisissez un moment fixe, un lieu calme, et dix minutes. Aucune croyance n’est demandée : ces exercices conviennent à chacun, quelle que soit sa tradition.', st['p'])]
    s += puces(st, ['Semaine 1 : l’attention.', 'Semaine 2 : la bienveillance.', 'Semaine 3 : la vie quotidienne.'])
    for i, (titre, texte) in enumerate(MEDITATION21, 1):
        s.append(KeepTogether([Paragraph(f'Jour {i} — {titre}', st['h2']), Paragraph(texte, st['p']), Paragraph('Ce que j’ai ressenti :', st['small']), lignes(pal, 2)]))
        if i in (7, 14): s.append(PageBreak())
    doc.build(s)

def pdf_gratitude():
    doc, st, pal = make_doc('carnet-de-gratitude.pdf', 'Carnet de gratitude\n30 jours', 'Chaque soir, trois mercis :\nun petit rituel qui change le regard.', 'Gratuit · Spiritualité universelle', 'universel', MENTION_SAGESSE)
    s = debut()
    s += [Paragraph('Pourquoi la gratitude ?', st['h1']),
          Paragraph('« Ce n’est pas le bonheur qui nous rend reconnaissants, c’est la reconnaissance qui nous rend heureux. » — pensée populaire', st['verse']),
          Paragraph('Toutes les traditions spirituelles invitent à rendre grâce. Écrire chaque soir trois choses pour lesquelles on est reconnaissant aide à voir le bien qui est déjà là.', st['p'])]
    for j in range(1, 31):
        s.append(KeepTogether([Paragraph(f'Jour {j}', st['h2']), Paragraph('Aujourd’hui, je dis merci pour :', st['small']), lignes(pal, 3)]))
        if j % 6 == 0: s.append(PageBreak())
    doc.build(s)

SAGESSES = [
 ("Il y a des choses qui dépendent de nous, et d’autres qui n’en dépendent pas.", "d’après Épictète"),
 ("Le bonheur de ta vie dépend de la qualité de tes pensées.", "d’après Marc Aurèle"),
 ("Ce n’est pas parce que les choses sont difficiles que nous n’osons pas ; c’est parce que nous n’osons pas qu’elles sont difficiles.", "d’après Sénèque"),
 ("Connais-toi toi-même.", "inscription du temple de Delphes"),
 ("Celui qui connaît les autres est savant ; celui qui se connaît lui-même est sage.", "d’après Lao-Tseu"),
 ("Ne fais pas à autrui ce que tu ne voudrais pas qu’on te fasse.", "d’après Confucius"),
 ("La haine ne cesse pas par la haine, mais par l’amour.", "d’après le Dhammapada"),
 ("L’eau est douce et pourtant elle use la pierre.", "d’après Lao-Tseu"),
 ("Le temps passé à se fâcher est du temps perdu pour la paix.", "pensée populaire"),
 ("Seul on va plus vite, ensemble on va plus loin.", "proverbe africain"),
 ("Quand tu ne sais pas où tu vas, regarde d’où tu viens.", "proverbe africain"),
 ("L’arbre ne refuse son ombre à personne, pas même au bûcheron.", "proverbe indien"),
 ("La patience est amère, mais son fruit est doux.", "proverbe"),
 ("Une seule bougie peut en allumer mille sans que sa vie soit abrégée.", "d’après un enseignement bouddhique"),
 ("Fais de ta vie un rêve, et d’un rêve une réalité.", "pensée populaire"),
 ("Le sage ne dit pas tout ce qu’il sait, mais il sait tout ce qu’il dit.", "proverbe"),
 ("Il n’y a pas de chemin vers la paix : la paix est le chemin.", "pensée attribuée à un sage de la non-violence"),
 ("Le plus grand voyage commence par un pas.", "d’après Lao-Tseu"),
 ("La gratitude transforme ce que nous avons en suffisance.", "pensée populaire"),
 ("Écoute beaucoup, parle peu.", "proverbe"),
 ("Chaque matin, nous naissons à nouveau. Ce que nous faisons aujourd’hui compte le plus.", "d’après un enseignement bouddhique"),
 ("La douceur est invincible.", "d’après Marc Aurèle"),
 ("On ne voit bien qu’avec le cœur.", "pensée populaire"),
 ("Ce que tu cherches te cherche aussi.", "pensée soufie"),
 ("La lampe ne brille pas pour elle-même.", "proverbe"),
 ("Le bambou plie mais ne rompt pas.", "proverbe asiatique"),
 ("Pardonner, c’est libérer un prisonnier et découvrir que c’était soi.", "pensée populaire"),
 ("L’homme qui déplace une montagne commence par déplacer de petites pierres.", "d’après Confucius"),
 ("Sois le changement que tu veux voir dans le monde.", "pensée inspirée de la non-violence"),
 ("Le silence est parfois la meilleure réponse.", "proverbe"),
 ("L’amitié double les joies et divise les peines.", "proverbe"),
 ("Prends soin de ton âme comme d’un jardin.", "pensée populaire"),
 ("La vraie richesse est de se contenter de peu.", "d’après Épicure"),
 ("Rien n’est permanent, sauf le changement.", "d’après Héraclite"),
 ("Le cœur a ses raisons que la raison ne connaît point.", "Blaise Pascal"),
 ("Mieux vaut allumer une bougie que maudire l’obscurité.", "proverbe"),
 ("La parole est d’argent, mais le silence est d’or.", "proverbe"),
 ("Chaque être humain est un livre ; apprends à le lire avec bonté.", "pensée populaire"),
 ("Ce que l’on donne avec le cœur ne s’appauvrit jamais.", "pensée populaire"),
 ("Aujourd’hui est un don : c’est pourquoi on l’appelle le présent.", "pensée populaire"),
]
def pdf_sagesses():
    doc, st, pal = make_doc('sagesses-du-monde-40-pensees.pdf', 'Sagesses du monde\n40 pensées', 'Des paroles venues de toutes les cultures\npour éclairer le quotidien.', 'Gratuit · Spiritualité universelle', 'universel', MENTION_SAGESSE)
    s = debut()
    s += [Paragraph('Une pensée par jour', st['h1']),
          Paragraph('Lisez une pensée le matin, gardez-la avec vous, et revenez-y le soir : qu’a-t-elle éclairé dans votre journée ? Les citations anciennes sont données « d’après » leur auteur : ce sont des traductions libres et abrégées.', st['p'])]
    cartes = [Table([[Paragraph(f'« {t} »', ParagraphStyle('c', parent=st['cell'], fontName='Serif-I', fontSize=10.2, leading=14))], [Paragraph(f'<b>{a}</b>', st['small'])]], colWidths=[80 * mm]) for t, a in SAGESSES]
    lignes_t = [[cartes[i], cartes[i + 1] if i + 1 < len(cartes) else ''] for i in range(0, len(cartes), 2)]
    t = Table(lignes_t, colWidths=[87 * mm, 87 * mm])
    t.setStyle(TableStyle([('GRID', (0, 0), (-1, -1), 0.6, pal['ligne']), ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'), ('BACKGROUND', (0, 0), (-1, -1), colors.white),
                           ('TOPPADDING', (0, 0), (-1, -1), 10), ('BOTTOMPADDING', (0, 0), (-1, -1), 10), ('LEFTPADDING', (0, 0), (-1, -1), 8)]))
    s += [Spacer(1, 4 * mm), t]
    doc.build(s)

# ====================================================================== PUBLICATIONS
def C(religion, guide, type_, titre, description, contenu=None, ref=None, access='gratuit', categorie=None, fichier=None):
    o = {"v": 2, "religion": religion, "guide": guide, "type": type_, "title": titre, "description": description, "access": access}
    if contenu: o["content"] = contenu
    if ref: o["bible_ref"] = ref
    if categorie: o["category"] = categorie
    if fichier: o["file"] = fichier
    return o

ISLAM = [
 C('musulman', 'islam', 'parole', "L’Ouverture (al-Fâtiha)", "La première sourate, récitée dans chaque prière.",
   "« Au nom d’Allah, le Tout Miséricordieux, le Très Miséricordieux. Louange à Allah, Seigneur des mondes, le Tout Miséricordieux, le Très Miséricordieux, Maître du Jour du Jugement. C’est Toi seul que nous adorons, et c’est Toi seul dont nous implorons le secours. Guide-nous sur le droit chemin, le chemin de ceux que Tu as comblés de Tes bienfaits, non de ceux qui ont encouru la colère, ni des égarés. »\n\nMéditation\nCette sourate est un dialogue : la louange d’abord, puis la demande. Avant de demander, je reconnais Celui à qui je parle. Aujourd’hui, je la récite lentement, en pensant au sens de chaque phrase.\n\n(Traduction du sens)",
   "Coran 1:1-7", categorie='Prière'),
 C('musulman', 'islam', 'parole', "Le verset du Trône (Âyat al-Kursî)", "Un verset de protection et de grandeur.",
   "« Allah ! Point de divinité à part Lui, le Vivant, Celui qui subsiste par Lui-même. Ni somnolence ni sommeil ne Le saisissent. À Lui appartient tout ce qui est dans les cieux et sur la terre. Qui peut intercéder auprès de Lui sans Sa permission ? Il connaît ce qui est devant eux et ce qui est derrière eux, et ils n’embrassent de Sa science que ce qu’Il veut. Son Trône s’étend sur les cieux et la terre, et leur garde ne Lui coûte aucune peine. Il est le Très-Haut, l’Immense. »\n\nMéditation\nRien n’échappe à Celui qui ne dort jamais. Quand l’inquiétude m’empêche de dormir, je me souviens que Lui veille.\n\n(Traduction du sens)",
   "Coran 2:255", categorie='Méditation'),
 C('musulman', 'islam', 'parole', "Avec la difficulté, la facilité", "Une promesse répétée deux fois, pour les jours lourds.",
   "« Car, à côté de la difficulté, il y a certes une facilité. Oui, à côté de la difficulté, il y a certes une facilité. »\n\nMéditation\nLe verset ne dit pas « après », mais « avec » : la facilité est déjà là, cachée dans l’épreuve. Je cherche aujourd’hui un petit signe de cette facilité.\n\n(Traduction du sens)",
   "Coran 94:5-6", categorie='Exhortation'),
 C('musulman', 'islam', 'parole', "Les cœurs s’apaisent", "Le rappel d’Allah, chemin de la paix intérieure.",
   "« Ceux qui ont cru, et dont les cœurs se tranquillisent au rappel d’Allah. N’est-ce point par le rappel d’Allah que les cœurs se tranquillisent ? »\n\nMéditation\nQuelques minutes de dhikr peuvent changer une journée. Je choisis un moment fixe pour me souvenir d’Allah.\n\n(Traduction du sens)",
   "Coran 13:28", categorie='Méditation'),
 C('musulman', 'islam', 'parole', "Le monothéisme pur (al-Ikhlâs)", "Une courte sourate au cœur de la foi.",
   "« Dis : Il est Allah, l’Unique. Allah, Celui vers qui l’on se tourne en tout besoin. Il n’a pas engendré et n’a pas été engendré. Et nul n’est égal à Lui. »\n\nMéditation\nQuatre versets suffisent à dire l’essentiel. Je la récite avec attention, en laissant chaque mot me parler.\n\n(Traduction du sens)",
   "Coran 112", categorie='Prière'),
 C('musulman', 'islam', 'parole', "Aucune âme n’est chargée au-delà de sa capacité", "Un verset de réconfort et une invocation.",
   "« Allah n’impose à aucune âme une charge supérieure à sa capacité. […] Seigneur, ne nous tiens pas rigueur de nos oublis et de nos erreurs. »\n\nMéditation\nCe que je vis aujourd’hui, Allah sait que je peux le porter. Je Lui demande la force, et je me pardonne aussi mes faiblesses.\n\n(Traduction du sens, extrait)",
   "Coran 2:286", categorie='Exhortation'),
 C('musulman', 'islam', 'enseignement', "Les cinq piliers de l’islam", "La base de la pratique, expliquée simplement.",
   "Les cinq piliers sont comme les colonnes d’une maison.\n\n1. La shahâda : attester qu’il n’y a de divinité qu’Allah et que Muhammad est Son messager.\n2. La prière (salât) : cinq rendez-vous quotidiens avec Allah.\n3. L’aumône (zakât) : purifier ses biens en partageant avec ceux qui sont dans le besoin.\n4. Le jeûne du Ramadan (sawm) : un mois de maîtrise de soi, de prière et de générosité.\n5. Le pèlerinage (hajj) à La Mecque, une fois dans la vie pour qui en a la capacité.\n\nPour aller plus loin\nChaque pilier relie le croyant à Allah et aux autres. La prière forme le cœur, l’aumône ouvre la main, le jeûne apprend la patience.",
   categorie='Étude coranique'),
 C('musulman', 'islam', 'enseignement', "La patience (as-sabr) dans le Coran", "Trois visages de la patience, et comment la cultiver.",
   "« Ô les croyants ! Cherchez secours dans la patience et la prière. Allah est avec ceux qui sont patients. » (Coran 2:153, traduction du sens)\n\nLes savants distinguent trois patiences :\n• la patience dans l’obéissance : persévérer dans le bien, même quand c’est difficile ;\n• la patience face à l’interdit : résister à ce qui fait du tort ;\n• la patience dans l’épreuve : accepter ce qui ne dépend pas de nous, sans perdre confiance.\n\nCultiver la patience\n1. Respirer et invoquer avant de répondre.\n2. Se rappeler que l’épreuve a une fin.\n3. Chercher la compagnie de personnes patientes.\n4. Demander à Allah : « Seigneur, accorde-nous l’endurance. »",
   access='premium', categorie='Étude coranique'),
 C('musulman', 'islam', 'enseignement', "Le pardon et la miséricorde", "Pardonner comme on espère être pardonné.",
   "« Qu’ils pardonnent et qu’ils passent l’éponge. N’aimez-vous pas qu’Allah vous pardonne ? » (Coran 24:22, traduction du sens)\n\nLa miséricorde est au cœur de l’islam : chaque sourate, sauf une, commence par « Au nom d’Allah, le Tout Miséricordieux, le Très Miséricordieux ».\n\nPardonner ne veut pas dire oublier ni accepter l’injustice. C’est refuser que la rancune dirige notre cœur.\n\nUn chemin en quatre pas\n1. Reconnaître la blessure devant Allah.\n2. Remettre la justice entre Ses mains.\n3. Invoquer pour la personne, même en quelques mots.\n4. Demander conseil à l’imam ou à un proche si la blessure est profonde.",
   access='premium', categorie='Exhortation'),
 C('musulman', 'islam', 'contenu', "Invocations du matin et du soir", "Un rappel simple, à la portée de tous.",
   "Après la prière ou à tout moment :\n\n• Subhâna-llâh (Gloire à Allah) — 33 fois\n• Al-hamdu li-llâh (Louange à Allah) — 33 fois\n• Allâhu akbar (Allah est le plus grand) — 33 fois\n\nLe matin, on peut dire aussi : « Nous voici au matin, et le royaume appartient à Allah. »\nLe soir : « Nous voici au soir, et le royaume appartient à Allah. »\n\nConseil\nUn chapelet (misbaha) ou les doigts suffisent pour compter. L’important est la présence du cœur.",
   categorie='Prière'),
 C('musulman', 'islam', 'contenu', "Préparer son cœur au Ramadan", "Quelques semaines avant le mois béni, se préparer en douceur.",
   "Ramadan se prépare avant Ramadan.\n\n1. Reprendre doucement la lecture du Coran, quelques versets par jour.\n2. Jeûner un ou deux jours volontaires pour habituer le corps.\n3. Régler ses dettes et se réconcilier avec ceux que l’on a blessés.\n4. Préparer un budget d’aumône.\n5. Écrire trois intentions pour le mois.\n\nInvocation\n« Ô Allah, fais-nous atteindre Ramadan, et accepte-le de nous. »",
   access='premium', categorie='Méditation'),
 C('musulman', 'islam', 'document', "Guide de la prière (salât) pour débutants", "Les ablutions, les cinq prières et les gestes, expliqués pas à pas.", access='gratuit', categorie='Prière', fichier='guide-priere-salat-debutants.pdf'),
 C('musulman', 'islam', 'document', "Les 99 plus beaux noms d’Allah", "La liste complète avec le sens de chaque nom, pour une méditation quotidienne.", access='premium', categorie='Méditation', fichier='99-noms-d-allah.pdf'),
 C('musulman', 'islam', 'document', "Ramadan : 30 jours de réflexion", "Un thème, une pensée et un geste pour chaque jour du mois béni.", access='premium', categorie='Méditation', fichier='ramadan-30-jours.pdf'),
]

UNIVERSEL = [
 C('universel', 'universel', 'contenu', "Ce qui dépend de nous", "Une sagesse stoïcienne pour retrouver la paix.",
   "« Il y a des choses qui dépendent de nous, et d’autres qui n’en dépendent pas. » — d’après Épictète\n\nLa pluie, l’avis des autres, le passé : cela ne dépend pas de moi. Mes choix, mes paroles, ma manière de réagir : cela dépend de moi.\n\nExercice du jour\nPrenez un souci qui vous pèse. Divisez une feuille en deux colonnes : « ce qui dépend de moi » et « ce qui n’en dépend pas ». Agissez sur la première, relâchez la seconde.",
   ref="d’après Épictète, Manuel", categorie='Sagesse'),
 C('universel', 'universel', 'contenu', "Le premier pas", "Commencer petit, mais commencer.",
   "« Un voyage de mille lieues commence par un premier pas. » — d’après Lao-Tseu\n\nNous attendons souvent d’être prêts pour commencer. La sagesse taoïste invite à faire le premier pas, même petit.\n\nAujourd’hui\nChoisissez un projet que vous repoussez et faites-en la plus petite étape possible : cinq minutes suffisent.",
   ref="d’après Lao-Tseu, Tao Te King", categorie='Sagesse'),
 C('universel', 'universel', 'enseignement', "La règle d’or dans les traditions du monde", "Une même sagesse, sous mille formes.",
   "Presque toutes les traditions enseignent une même règle :\n\n• « Ne fais pas à autrui ce que tu ne voudrais pas qu’on te fasse. » (d’après Confucius)\n• « Tout ce que vous voulez que les hommes fassent pour vous, faites-le de même pour eux. » (Évangile selon Matthieu 7:12)\n• « Aucun de vous n’est vraiment croyant tant qu’il ne désire pas pour son frère ce qu’il désire pour lui-même. » (hadith rapporté par al-Bukhârî et Muslim)\n• « Ne blesse pas les autres de la manière qui te blesserait toi-même. » (d’après un enseignement bouddhique)\n\nCe qui nous rassemble\nAu-delà des différences, cette règle trace un chemin commun : le respect de l’autre comme de soi-même.\n\nÀ méditer\nDans quelle situation de ma semaine puis-je appliquer cette règle concrètement ?",
   categorie='Sagesse'),
 C('universel', 'universel', 'contenu', "Respirer pour apaiser l’esprit", "Cinq minutes de respiration, accessibles à tous.",
   "Un exercice simple, quelle que soit votre croyance :\n\n1. Asseyez-vous, pieds au sol, dos droit.\n2. Inspirez par le nez en comptant jusqu’à 5.\n3. Expirez doucement par la bouche en comptant jusqu’à 5.\n4. Continuez pendant 5 minutes.\n\nBienfaits\nCette respiration lente calme le cœur et apaise les pensées. Pratiquée trois fois par jour, elle aide à traverser les moments de stress.",
   categorie='Pleine conscience'),
 C('universel', 'universel', 'enseignement', "La gratitude transforme le regard", "Pourquoi dire merci rend plus heureux.",
   "« La gratitude transforme ce que nous avons en suffisance. »\n\nToutes les traditions invitent à rendre grâce. La gratitude n’ignore pas les difficultés : elle apprend à voir aussi le bien.\n\nTrois pratiques\n1. Le carnet : chaque soir, écrire trois mercis.\n2. La lettre : écrire à une personne pour la remercier de ce qu’elle vous a apporté.\n3. Le regard : une fois par jour, s’arrêter devant une chose belle et simple.\n\nÀ essayer pendant 30 jours : c’est le temps qu’il faut pour qu’une habitude s’installe.",
   access='premium', categorie='Méditation'),
 C('universel', 'universel', 'enseignement', "Traverser le deuil et la perte", "Des repères doux pour les jours de peine.",
   "Le deuil n’est pas une maladie : c’est l’amour qui continue, privé de son objet.\n\nCe qui peut aider\n• Accepter que la peine vienne par vagues.\n• Parler de la personne disparue, garder des souvenirs.\n• Prendre soin de son corps : sommeil, repas, marche.\n• Se donner le droit de rire à nouveau sans culpabilité.\n• Demander de l’aide : un proche, un guide spirituel, un professionnel si la peine devient trop lourde.\n\nUne pensée\n« Ceux que nous avons aimés ne sont plus là où ils étaient, mais ils sont partout où nous sommes. » (pensée populaire)",
   access='premium', categorie='Exhortation'),
 C('universel', 'universel', 'contenu', "Méditation du soir : faire la paix avec sa journée", "Un rituel de dix minutes avant de dormir.",
   "1. Asseyez-vous et respirez lentement dix fois.\n2. Repassez votre journée comme un film, sans juger.\n3. Remerciez pour un moment heureux.\n4. Reconnaissez un moment difficile, et dites-vous : « J’ai fait de mon mieux. »\n5. Laissez partir ce que vous ne pouvez pas changer.\n6. Souhaitez la paix à une personne de votre choix.\n\nVous pouvez terminer par la prière ou le silence de votre tradition.",
   access='premium', categorie='Pleine conscience'),
 C('universel', 'universel', 'document', "Méditation : programme de 21 jours", "Dix minutes par jour pour apaiser l’esprit, habiter son corps et ouvrir son cœur.", access='premium', categorie='Pleine conscience', fichier='meditation-21-jours.pdf'),
 C('universel', 'universel', 'document', "Carnet de gratitude (30 jours)", "Un carnet à imprimer : trois mercis chaque soir pendant un mois.", access='gratuit', categorie='Méditation', fichier='carnet-de-gratitude.pdf'),
 C('universel', 'universel', 'document', "Sagesses du monde : 40 pensées", "Des paroles de toutes les cultures, à garder sur soi ou à afficher.", access='gratuit', categorie='Sagesse', fichier='sagesses-du-monde-40-pensees.pdf'),
]

GUIDES = [
    {"cle": "islam", "prenom": "Guide", "nom": "Islam", "email": "islam@ameetvie.org", "eglise": "Ame & Vie",
     "bio": "Guide spirituel pour les contenus musulmans (nom provisoire, modifiable dans l’administration)."},
    {"cle": "universel", "prenom": "Guide", "nom": "Sagesse", "email": "sagesse@ameetvie.org", "eglise": "Ame & Vie",
     "bio": "Guide pour la spiritualité universelle : méditation, sagesses du monde, paix intérieure (nom provisoire, modifiable)."},
]

if __name__ == '__main__':
    DOCS.mkdir(parents=True, exist_ok=True)
    pdf_noms(); pdf_salat(); pdf_ramadan(); pdf_meditation(); pdf_gratitude(); pdf_sagesses()
    p = SEED / 'contenus.json'
    data = json.load(open(p, encoding='utf-8'))
    data['version'] = 2
    data['guides'] = GUIDES
    data['contenus'] = [c for c in data['contenus'] if c.get('v', 1) < 2] + ISLAM + UNIVERSEL
    data['_aide'] = ("Contenus d'exemple ajoutés automatiquement : Christianisme (Jean, textes Louis Segond 1910), Islam et Spiritualité universelle "
                     "(guides provisoires). Citations du Coran : traductions du sens à faire relire. Régénérer : scripts/exemples_religions.py.")
    json.dump(data, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
    print(len(data['contenus']), 'contenus,', len(ISLAM), 'islam,', len(UNIVERSEL), 'universel')
    for f in sorted(os.listdir(DOCS)):
        print(' ', f, os.path.getsize(DOCS / f))
