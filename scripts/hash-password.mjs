/**
 * Utilitaire : génère un hachage scrypt compatible avec l'API.
 * Usage : npm run hash-password -- "MonMotDePasse"
 * (Utile seulement pour créer/réinitialiser un compte à la main dans Supabase.)
 */
import { randomBytes, scryptSync } from 'node:crypto';

const mdp = process.argv[2];
if (!mdp || mdp.length < 8) {
  console.error('Indiquez un mot de passe de 8 caractères minimum.');
  process.exit(1);
}
const N = 16384, r = 8, p = 1;
const sel = randomBytes(16);
const hash = scryptSync(mdp.normalize('NFKC'), sel, 64, { N, r, p, maxmem: 64 * 1024 * 1024 });
console.log(`scrypt$${N}$${r}$${p}$${sel.toString('base64')}$${hash.toString('base64')}`);
