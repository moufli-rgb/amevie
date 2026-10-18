/**
 * Import des contenus d'exemple (seed/contenus.json + seed/documents/*.pdf).
 * Appelé depuis l'administration : Base de données → « Ajouter les contenus d'exemple ».
 * Ré-exécutable : les contenus déjà présents (même titre) sont ignorés.
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
}
interface Fichier { pasteur: { prenom: string; nom: string; email: string; eglise: string; bio: string }; contenus: Exemple[] }

/** Dossier « seed » : à la racine du projet (inclus dans la fonction via vercel.json → includeFiles). */
function dossierSeed() {
  return path.join(process.cwd(), 'seed');
}

export async function importerExemples(): Promise<{ ajoutes: number; ignores: number; pasteur: string }> {
  let data: Fichier;
  try {
    data = JSON.parse(await readFile(path.join(dossierSeed(), 'contenus.json'), 'utf8'));
  } catch {
    throw new ApiError(500, 'Fichiers d’exemple introuvables sur le serveur (dossier « seed »).');
  }

  // 1. Pasteur « Équipe Ame & Vie » (créé s'il n'existe pas ; mot de passe aléatoire, modifiable par l'admin)
  const p = data.pasteur;
  let { data: pasteur, error } = await db().from('pastors').select('id').eq('email', p.email).maybeSingle();
  check(error, 'pastors');
  if (!pasteur) {
    const ins = await db().from('pastors').insert({
      nom: p.nom, prenom: p.prenom, email: p.email, eglise: p.eglise, bio: p.bio,
      password_hash: await hashPassword(randomBytes(24).toString('base64url')),
      is_active: true, created_by_admin: true, reviewed_at: new Date().toISOString(),
    }).select('id').single();
    check(ins.error, 'pastors');
    pasteur = ins.data!;
  }
  const pastorId = pasteur!.id as string;

  // 2. Contenus déjà présents
  const exist = await db().from('contents').select('title').eq('pastor_id', pastorId);
  check(exist.error, 'contents');
  const deja = new Set((exist.data ?? []).map((c) => c.title));

  let ajoutes = 0, ignores = 0;
  // Dates échelonnées pour un affichage naturel (du plus ancien au plus récent)
  const base = Date.now() - data.contenus.length * 3600_000;
  for (const [i, c] of data.contenus.entries()) {
    if (deja.has(c.title)) { ignores++; continue; }
    const row: Record<string, unknown> = {
      pastor_id: pastorId, type: c.type, title: c.title, description: c.description ?? null,
      content: c.content ?? null, bible_ref: c.bible_ref ?? null, category: c.category ?? null,
      access: c.access, is_published: true,
      created_at: new Date(base + i * 3600_000).toISOString(), updated_at: new Date(base + i * 3600_000).toISOString(),
    };
    if (c.file) {
      const contenu = await readFile(path.join(dossierSeed(), 'documents', c.file));
      const chemin = `${pastorId}/exemple-${c.file}`;
      const up = await db().storage.from('documents').upload(chemin, contenu, { contentType: 'application/pdf', upsert: true });
      if (up.error) throw new ApiError(503, `Envoi du fichier « ${c.file} » impossible : vérifiez le bucket « documents » (script supabase/schema.sql).`, 'STOCKAGE');
      Object.assign(row, { file_url: chemin, file_name: c.file, file_type: 'application/pdf', file_size: contenu.length });
    }
    const { error: e } = await db().from('contents').insert(row);
    check(e, 'contents');
    ajoutes++;
  }
  return { ajoutes, ignores, pasteur: `${p.prenom} ${p.nom}` };
}

/**
 * Import automatique : au premier affichage de la bibliothèque, si les tables existent
 * et que l'équipe Ame & Vie n'a encore jamais été créée, les contenus d'exemple sont ajoutés.
 * Si l'administrateur les supprime ensuite, ils ne reviennent pas (le pasteur « Équipe » sert de repère).
 * Ne fait jamais échouer la page : en cas de problème, on réessaiera à la prochaine visite.
 */
let dejaVerifie = false;
let enCours: Promise<void> | null = null;
export async function importerSiPremiereFois(): Promise<void> {
  if (dejaVerifie) return;
  if (!enCours) {
    enCours = (async () => {
      try {
        const { data, error } = await db().from('pastors').select('id').eq('email', 'equipe@ameetvie.org').maybeSingle();
        if (error) return;            // tables pas encore créées : on réessaiera
        if (!data) await importerExemples();
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
