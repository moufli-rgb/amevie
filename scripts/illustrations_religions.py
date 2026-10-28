"""
Illustrations originales (sans photo, sans droits) pour l'Islam et la spiritualité universelle.
Génère public/images/site/<nom>-640.webp et <nom>-1376.webp.
    python3 scripts/illustrations_religions.py
"""
import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

SORTIE = Path(__file__).resolve().parent.parent / "public" / "images" / "site"
W, H = 1376, 860
SS = 2  # suréchantillonnage pour des traits nets


def degrade(w, h, haut, bas, diag=False):
    img = Image.new("RGB", (w, h))
    px = img.load()
    for y in range(h):
        for x in range(0, w):
            t = (y / h) if not diag else min(1, (x / w) * 0.45 + (y / h) * 0.75)
            px[x, y] = tuple(int(haut[i] + (bas[i] - haut[i]) * t) for i in range(3))
    return img


def halo(img, cx, cy, r, couleur, force=0.55):
    calque = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(calque)
    for i in range(30, 0, -1):
        a = int(255 * force * (1 - i / 30) ** 2)
        rr = r * i / 30 * 2.2
        d.ellipse([cx - rr, cy - rr, cx + rr, cy + rr], fill=couleur + (a // 6,))
    calque = calque.filter(ImageFilter.GaussianBlur(r / 3))
    return Image.alpha_composite(img.convert("RGBA"), calque)


def etoile8(d, cx, cy, r, couleur, largeur):
    """Étoile à 8 branches (khatam) : deux carrés superposés."""
    for rot in (0, math.pi / 4):
        pts = [(cx + r * math.cos(rot + k * math.pi / 2), cy + r * math.sin(rot + k * math.pi / 2)) for k in range(4)]
        d.line(pts + [pts[0]], fill=couleur, width=largeur, joint="curve")
    d.ellipse([cx - r * 0.18, cy - r * 0.18, cx + r * 0.18, cy + r * 0.18], outline=couleur, width=largeur)


def islam_motif():
    w, h = W * SS, H * SS
    img = degrade(w, h, (8, 78, 72), (4, 40, 44), diag=True).convert("RGBA")
    calque = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(calque)
    pas = 172 * SS
    or_ = (226, 182, 92, 150)
    for j in range(-1, h // pas + 2):
        for i in range(-1, w // pas + 2):
            cx = i * pas + (pas / 2 if j % 2 else 0)
            cy = j * pas * 0.86
            etoile8(d, cx, cy, pas * 0.42, or_, 3 * SS)
            d.line([(cx + pas * 0.42, cy), (cx + pas - pas * 0.42, cy)], fill=(226, 182, 92, 70), width=2 * SS)
    img = Image.alpha_composite(img, calque)
    img = halo(img, w * 0.72, h * 0.32, 260 * SS, (250, 214, 140), 0.9)
    return img.convert("RGB").resize((W, H), Image.LANCZOS)


def islam_nuit():
    w, h = W * SS, H * SS
    img = degrade(w, h, (10, 30, 58), (14, 92, 86)).convert("RGBA")
    ciel = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(ciel)
    # étoiles
    for k in range(120):
        x = (k * 977) % w
        y = (k * 613) % int(h * 0.55)
        r = 1 + (k % 3)
        d.ellipse([x - r * SS, y - r * SS, x + r * SS, y + r * SS], fill=(255, 244, 214, 160 + (k % 4) * 20))
    img = Image.alpha_composite(img, ciel)
    img = halo(img, w * 0.74, h * 0.24, 140 * SS, (255, 230, 170), 1)
    # croissant de lune (masque : disque moins disque décalé)
    cx, cy, r = w * 0.74, h * 0.24, 92 * SS
    masque = Image.new("L", (w, h), 0)
    dm = ImageDraw.Draw(masque)
    dm.ellipse([cx - r, cy - r, cx + r, cy + r], fill=255)
    dm.ellipse([cx - r + 44 * SS, cy - r - 18 * SS, cx + r + 44 * SS, cy + r - 18 * SS], fill=0)
    lune = Image.new("RGBA", (w, h), (255, 236, 190, 255))
    img.paste(lune, (0, 0), masque)
    d = ImageDraw.Draw(img)
    # silhouette : coupoles et minarets
    sol = h * 0.86
    ombre = (6, 24, 32, 255)
    d.rectangle([0, sol, w, h], fill=ombre)
    def coupole(x, largeur, haut):
        d.rectangle([x - largeur / 2, sol - haut * 0.55, x + largeur / 2, sol], fill=ombre)
        d.pieslice([x - largeur / 2, sol - haut * 0.55 - largeur / 2, x + largeur / 2, sol - haut * 0.55 + largeur / 2], 180, 360, fill=ombre)
        d.polygon([(x - 6 * SS, sol - haut * 0.55 - largeur / 2), (x + 6 * SS, sol - haut * 0.55 - largeur / 2), (x, sol - haut * 0.55 - largeur / 2 - 40 * SS)], fill=ombre)
    def minaret(x, haut):
        d.rectangle([x - 16 * SS, sol - haut, x + 16 * SS, sol], fill=ombre)
        d.rectangle([x - 26 * SS, sol - haut * 0.72, x + 26 * SS, sol - haut * 0.72 + 14 * SS], fill=ombre)
        d.polygon([(x - 18 * SS, sol - haut), (x + 18 * SS, sol - haut), (x, sol - haut - 70 * SS)], fill=ombre)
    coupole(w * 0.42, 420 * SS, 520 * SS)
    coupole(w * 0.25, 220 * SS, 330 * SS)
    coupole(w * 0.59, 220 * SS, 330 * SS)
    minaret(w * 0.12, 600 * SS)
    minaret(w * 0.72, 640 * SS)
    # fenêtres éclairées
    for x in (0.36, 0.42, 0.48):
        X = w * x
        d.rounded_rectangle([X - 14 * SS, sol - 150 * SS, X + 14 * SS, sol - 60 * SS], radius=14 * SS, fill=(250, 200, 110, 230))
    return img.convert("RGB").resize((W, H), Image.LANCZOS)


def universel_aube():
    w, h = W * SS, H * SS
    img = degrade(w, h, (52, 44, 120), (244, 160, 96)).convert("RGBA")
    cx, cy = w * 0.5, h * 0.74
    img = halo(img, cx, cy, 300 * SS, (255, 214, 150), 1)
    rayons = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    dr = ImageDraw.Draw(rayons)
    for k in range(24):
        a = math.pi + k * math.pi / 23
        dr.line([(cx, cy), (cx + math.cos(a) * w, cy + math.sin(a) * w)], fill=(255, 236, 200, 34), width=14 * SS)
    img = Image.alpha_composite(img, rayons.filter(ImageFilter.GaussianBlur(6 * SS)))
    d = ImageDraw.Draw(img)
    r = 150 * SS
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(255, 226, 170, 255))
    # collines
    for n, (couleur, base, amp) in enumerate([((92, 64, 140, 255), 0.78, 60), ((60, 42, 104, 255), 0.85, 80), ((34, 26, 70, 255), 0.92, 50)]):
        pts = [(0, h)]
        for x in range(0, w + 1, 20 * SS):
            pts.append((x, h * base - math.sin(x / w * math.pi * (2 + n) + n) * amp * SS))
        pts += [(w, h * base), (w, h)]
        d.polygon(pts, fill=couleur)
    return img.convert("RGB").resize((W, H), Image.LANCZOS)


def universel_mandala():
    w, h = W * SS, H * SS
    img = degrade(w, h, (40, 32, 96), (92, 58, 150), diag=True).convert("RGBA")
    cx, cy = w * 0.5, h * 0.5
    img = halo(img, cx, cy, 240 * SS, (240, 200, 255), 0.8)
    calque = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(calque)
    or_ = (240, 206, 140, 170)
    for anneau in range(1, 9):
        R = anneau * 62 * SS
        n = 8 + anneau * 4
        for k in range(n):
            a = k * 2 * math.pi / n + anneau * 0.2
            x, y = cx + R * math.cos(a), cy + R * math.sin(a)
            rr = (10 + anneau * 3) * SS
            d.ellipse([x - rr, y - rr * 0.55, x + rr, y + rr * 0.55], outline=or_, width=3 * SS, fill=(240, 206, 140, 18))
        d.ellipse([cx - R, cy - R, cx + R, cy + R], outline=(240, 206, 140, 60), width=2 * SS)
    for k in range(12):
        a = k * math.pi / 6
        d.line([(cx, cy), (cx + math.cos(a) * 520 * SS, cy + math.sin(a) * 520 * SS)], fill=(240, 206, 140, 40), width=2 * SS)
    img = Image.alpha_composite(img, calque)
    return img.convert("RGB").resize((W, H), Image.LANCZOS)


if __name__ == "__main__":
    SORTIE.mkdir(parents=True, exist_ok=True)
    for nom, fn in [("islam_motif", islam_motif), ("islam_nuit", islam_nuit), ("universel_aube", universel_aube), ("universel_mandala", universel_mandala)]:
        im = fn()
        im.save(SORTIE / f"{nom}-1376.webp", quality=80, method=6)
        im.resize((640, int(640 * H / W)), Image.LANCZOS).save(SORTIE / f"{nom}-640.webp", quality=78, method=6)
        print("ok", nom)
