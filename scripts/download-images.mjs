/**
 * Télécharge les images Unsplash listées dans src/config/images.json
 * vers public/images/site/<nom>-640.webp et <nom>-1376.webp.
 * Lancé automatiquement avant « npm run dev » et « npm run build ».
 * Ne fait jamais échouer le build : sans réseau, le site charge les images
 * directement depuis Unsplash, puis affiche un dégradé.
 */
import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dossier = path.join(racine, 'public', 'images', 'site');
const TAILLES = [640, 1376];
const existe = (f) => access(f).then(() => true, () => false);

async function main() {
  if (process.env.SKIP_IMAGES === '1') return console.log('[images] SKIP_IMAGES=1 → ignoré.');
  const { images } = JSON.parse(await readFile(path.join(racine, 'src', 'config', 'images.json'), 'utf8'));
  await mkdir(dossier, { recursive: true });
  const taches = [];
  for (const [nom, img] of Object.entries(images)) {
    if (!img.unsplash) continue;
    for (const w of TAILLES) taches.push({ nom, id: img.unsplash, w, fichier: path.join(dossier, `${nom}-${w}.webp`) });
  }
  let ok = 0, deja = 0, echec = 0;
  const file = [...taches];
  async function ouvrier() {
    while (file.length) {
      const t = file.shift();
      if (await existe(t.fichier)) { deja++; continue; }
      const ctrl = new AbortController();
      const minuteur = setTimeout(() => ctrl.abort(), 20000);
      try {
        const rep = await fetch(`https://images.unsplash.com/${t.id}?w=${t.w}&q=74&fm=webp&fit=crop&auto=format`, { signal: ctrl.signal });
        if (!rep.ok) throw new Error(`HTTP ${rep.status}`);
        await writeFile(t.fichier, Buffer.from(await rep.arrayBuffer()));
        ok++;
      } catch (e) {
        echec++;
        if (echec <= 3) console.warn(`[images] échec ${t.nom} (${t.w}px) : ${e.message}`);
      } finally { clearTimeout(minuteur); }
    }
  }
  await Promise.all(Array.from({ length: 6 }, ouvrier));
  console.log(`[images] ${ok} téléchargée(s), ${deja} déjà présente(s), ${echec} échec(s).`);
}
main().catch((e) => { console.warn('[images]', e.message); process.exit(0); });
