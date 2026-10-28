/**
 * Contenus d'exemple (seed/contenus.json + seed/documents/*.pdf).
 *  - Jean (Christianisme) et des guides provisoires pour l'Islam et la spiritualité universelle.
 *  - Import automatique à la première visite, puis à chaque nouvelle version des exemples
 *    (seulement les nouveautés : ce que l'administration a supprimé ne revient pas).
 *  - Bouton manuel dans l'administration : Base de données → « Ajouter les contenus d'exemple ».
 * Ré-exécutable : les contenus déjà présents (même titre, même guide) sont ignorés.
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { db, check } from './supabase.js';
import { hashPassword } from './crypto.js';
import { ApiError } from './errors.js';

interface Exemple {
  type: 'parole' | 'enseignement' | 'document' | 'contenu';
  title: string; description?: string | null; content?: string | null; bible_ref?: string | null;
  category?: string | null; access: 'gratuit' | 'premium'; file?: string;
  religion?: 'chretien' | 'musulman' | 'universel'; guide?: string; v?: number;
}
interface Guide { cle?: string; prenom: string; nom: string; email: string; eglise: string; bio: string }
interface Fichier { version?: number; pasteur: Guide; guides?: Guide[]; contenus: Exemple[] }

const EMAIL_JEAN = 'equipe@ameetvie.org';

/** Dossier « seed » : à la racine du projet (inclus dans la fonction via vercel.json → includeFiles). */
function dossierSeed() {
  return path.join(process.cwd(), 'seed');
}
async function lireFichier(): Promise<Fichier> {
  try {
    return JSON.parse(await readFile(path.join(dossierSeed(), 'contenus.json'), 'utf8'));
  } catch {
    throw new ApiError(500, 'Fichiers d’exemple introuvables sur le serveur (dossier « seed »).');
  }
}

/** Retrouve (ou crée, actif, mot de passe aléatoire) le compte d'un guide d'exemple. */
async function guideId(g: Guide): Promise<string> {
  const { data, error } = await db().from('pastors').select('id').eq('email', g.email).maybeSingle();
  check(error, 'pastors');
  if (data) return data.id as string;
  const ins = await db().from('pastors').insert({
    nom: g.nom, prenom: g.prenom, email: g.email, eglise: g.eglise, bio: g.bio,
    password_hash: await hashPassword(randomBytes(24).toString('base64url')),
    is_active: true, created_by_admin: true, reviewed_at: new Date().toISOString(),
  }).select('id').single();
  if (ins.error?.code === '23505') return guideId(g); // créé en parallèle
  check(ins.error, 'pastors');
  return ins.data!.id as string;
}

/**
 * Importe les contenus d'exemple.
 * depuisVersion : n'importe que les contenus plus récents que cette version (0 = tout).
 */
export async function importerExemples(depuisVersion = 0): Promise<{ ajoutes: number; ignores: number; pasteur: string; version: number }> {
  const data = await lireFichier();
  const aImporter = data.contenus.filter((c) => (c.v ?? 1) > depuisVersion);
  const guides = new Map<string, Guide>([['jean', data.pasteur], ...(data.guides ?? []).map((g) => [g.cle ?? g.email, g] as [string, Guide])]);
  const ids = new Map<string, string>();
  const deja = new Map<string, Set<string>>();

  let ajoutes = 0, ignores = 0;
  const base = Date.now() - aImporter.length * 3600_000; // dates échelonnées pour un affichage naturel
  for (const [i, c] of aImporter.entries()) {
    const cle = c.guide && guides.has(c.guide) ? c.guide : 'jean';
    if (!ids.has(cle)) {
      const id = await guideId(guides.get(cle)!);
      ids.set(cle, id);
      const exist = await db().from('contents').select('title').eq('pastor_id', id);
      check(exist.error, 'contents');
      deja.set(cle, new Set((exist.data ?? []).map((x) => x.title as string)));
    }
    const pastorId = ids.get(cle)!;
    if (deja.get(cle)!.has(c.title)) { ignores++; continue; }
    const quand = new Date(base + i * 3600_000).toISOString();
    const row: Record<string, unknown> = {
      pastor_id: pastorId, type: c.type, title: c.title, description: c.description ?? null,
      content: c.content ?? null, bible_ref: c.bible_ref ?? null, category: c.category ?? null,
      access: c.access, is_published: true, created_at: quand, updated_at: quand,
    };
    if (c.religion && c.religion !== 'chretien') row.religion = c.religion;
    if (c.file) {
      const contenu = await readFile(path.join(dossierSeed(), 'documents', c.file));
      const chemin = `${pastorId}/exemple-${c.file}`;
      const up = await db().storage.from('documents').upload(chemin, contenu, { contentType: 'application/pdf', upsert: true });
      if (up.error) throw new ApiError(503, `Envoi du fichier « ${c.file} » impossible : vérifiez le bucket « documents » (script supabase/schema.sql).`, 'STOCKAGE');
      Object.assign(row, { file_url: chemin, file_name: c.file, file_type: 'application/pdf', file_size: contenu.length });
    }
    const { error: e } = await db().from('contents').insert(row);
    check(e, 'contents');
    deja.get(cle)!.add(c.title);
    ajoutes++;
  }
  const noms = [...ids.keys()].map((k) => `${guides.get(k)!.prenom} ${guides.get(k)!.nom}`.trim());
  return { ajoutes, ignores, pasteur: noms.join(', ') || `${data.pasteur.prenom} ${data.pasteur.nom}`.trim(), version: data.version ?? 1 };
}

/** Ancienne version (« Équipe Ame & Vie ») → le guide s'appelle désormais Jean. */
async function renommerGuide(id: string) {
  try {
    const { data } = await db().from('pastors').select('prenom').eq('id', id).maybeSingle();
    if (data && data.prenom !== 'Jean') {
      await db().from('pastors').update({
        prenom: 'Jean', nom: '', bio: 'Guide spirituel de la plateforme Ame & Vie. Il partage chaque semaine la Parole, des enseignements et des livres pour grandir dans la foi.',
      }).eq('id', id);
    }
  } catch { /* sans gravité */ }
}

/**
 * Import automatique (appelé à l'affichage de la bibliothèque) :
 *  - première visite : tout est importé ;
 *  - nouvelle version des exemples : seules les nouveautés sont ajoutées.
 * La version importée est notée dans la table settings (clé « exemples »).
 * Ne fait jamais échouer la page : en cas de problème, on réessaiera à la prochaine visite.
 */
let dejaVerifie = false;
let enCours: Promise<void> | null = null;
export async function importerSiPremiereFois(): Promise<void> {
  if (dejaVerifie) return;
  if (!enCours) {
    enCours = (async () => {
      try {
        const jean = await db().from('pastors').select('id').eq('email', EMAIL_JEAN).maybeSingle();
        if (jean.error) return;            // tables pas encore créées : on réessaiera
        if (jean.data) await renommerGuide(jean.data.id as string);
        const reglage = await db().from('settings').select('value').eq('key', 'exemples').maybeSingle();
        const fichier = await lireFichier();
        const cible = fichier.version ?? 1;
        // Sans table settings (ancien schéma) : on se contente de l'ancien comportement.
        const faite = reglage.error ? (jean.data ? cible : 0) : Number((reglage.data?.value as { version?: number } | undefined)?.version ?? (jean.data ? 1 : 0));
        if (faite < cible) {
          await importerExemples(faite);
          if (!reglage.error) {
            await db().from('settings').upsert({ key: 'exemples', value: { version: cible }, updated_at: new Date().toISOString() }, { onConflict: 'key' });
          }
        }
        dejaVerifie = true;
      } catch (e) {
        console.error('[exemples] import automatique impossible :', e instanceof Error ? e.message : e);
      } finally {
        enCours = null;
      }
    })();
  }
  await enCours;
}
