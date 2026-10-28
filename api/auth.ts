/**
 * /api/auth — authentification
 *  GET                               : session courante (vérifiée toutes les 30 s par le client).
 *  POST ?action=inscription-visiteur : { nom, prenom, email, telephone, password, password_confirm }
 *  POST ?action=inscription-pasteur  : { nom, prenom, email, telephone, password, password_confirm, eglise? } → en attente de validation
 *  POST ?action=connexion            : { email, password, role: 'visiteur' | 'pasteur' }
 *  POST ?action=connexion-admin      : { email, password } via Supabase Auth (comptes de admin_users uniquement)
 *  POST ?action=visite               : compte une visite anonyme (1 par visiteur et par jour, sans donnée personnelle)
 *  POST ?action=acces-guide          : administrateur → { pastor_id } → session du guide spirituel (8 h), journalisée
 */
import { createHash } from 'node:crypto';
import { route, clientIp, query, send, type Req } from './_lib/http.js';
import { ApiError, MSG_IDENTIFIANTS } from './_lib/errors.js';
import { body, requiredText, password as pwdRule, phone, text, email } from './_lib/validate.js';
import { db, authClient, check } from './_lib/supabase.js';
import { env } from './_lib/env.js';
import { hashPassword, verifyPassword, dummyVerify, signSession } from './_lib/crypto.js';
import { assertNotLimited, registerFailure, resetName, loginKeys } from './_lib/rateLimit.js';
import { getActor, publicUser, requireRole } from './_lib/auth.js';
import { requireUuid } from './_lib/validate.js';
import { logActivite } from './_lib/activity.js';


async function inscription(req: Req, role: 'visiteur' | 'pasteur') {
  const b = body(req.body);
  const limite = [{ key: `inscription-${role}:ip:${clientIp(req)}`, max: 10 }];
  await assertNotLimited(limite);
  const nom = requiredText(b.nom, 'Nom', { min: 1, max: 60 });
  const prenom = requiredText(b.prenom, 'Prénom', { min: 1, max: 60 });
  const mail = email(b.email);
  const telephone = phone(b.telephone);
  if (!telephone) throw new ApiError(400, 'Le numéro de téléphone est obligatoire.');
  const pwd = pwdRule(b.password);
  if (b.password_confirm !== undefined && b.password_confirm !== pwd) throw new ApiError(400, 'Les deux mots de passe ne correspondent pas.');
  const table = role === 'visiteur' ? 'users' : 'pastors';

  const exist = await db().from(table).select('id').eq('email', mail).maybeSingle();
  check(exist.error, table);
  if (exist.data) throw new ApiError(409, 'Un compte existe déjà avec cet email. Connectez-vous.', 'DOUBLON');

  const row: Record<string, unknown> = { nom, prenom, email: mail, telephone, password_hash: await hashPassword(pwd) };
  if (role === 'pasteur') {
    row.eglise = text(b.eglise, 'Église / ministère', { max: 120 });
    row.is_active = false;
  }
  const { data, error } = await db().from(table).insert(row).select('id').single();
  if (error?.code === '23505') throw new ApiError(409, 'Un compte existe déjà avec cet email. Connectez-vous.', 'DOUBLON');
  check(error, table);
  await registerFailure(limite); // compte chaque inscription (anti-abus par IP)

  await logActivite({ role, user_id: data!.id, nom: `${prenom} ${nom}`, action: role === 'visiteur' ? 'inscription_visiteur' : 'inscription_pasteur' });

  if (role === 'pasteur') {
    return { status: 'pending', message: "Votre compte de guide spirituel a été créé. Il sera actif dès sa validation par l'administration." };
  }
  // Le visiteur est connecté directement après son inscription
  const token = signSession({ sub: data!.id, role: 'visiteur', name: `${prenom} ${nom}` });
  req.headers.authorization = `Bearer ${token}`;
  return { status: 'ok', token, user: publicUser(await getActor(req)) };
}

async function connexion(req: Req) {
  const b = body(req.body);
  const role = b.role === 'pasteur' ? 'pasteur' : 'visiteur';
  const mail = email(b.email);
  const pwd = typeof b.password === 'string' ? b.password.slice(0, 128) : '';
  const keys = loginKeys(role, clientIp(req), mail);
  await assertNotLimited(keys);

  const table = role === 'visiteur' ? 'users' : 'pastors';
  const cols = role === 'pasteur' ? 'id, nom, prenom, password_hash, is_active, reviewed_at' : 'id, nom, prenom, password_hash, is_active';
  const { data, error } = await db().from(table).select(cols).eq('email', mail).maybeSingle();
  check(error, table);
  const row = data as unknown as { id: string; nom: string; prenom: string; password_hash: string; is_active: boolean; reviewed_at?: string | null } | null;

  if (!row) {
    await dummyVerify(pwd); // temps de réponse homogène
    await registerFailure(keys);
    throw new ApiError(401, MSG_IDENTIFIANTS, 'IDENTIFIANTS');
  }
  if (!(await verifyPassword(pwd, row.password_hash))) {
    await registerFailure(keys);
    throw new ApiError(401, MSG_IDENTIFIANTS, 'IDENTIFIANTS');
  }
  if (!row.is_active) {
    if (role === 'pasteur' && !row.reviewed_at) throw new ApiError(403, 'Votre compte de guide spirituel attend la validation de l’administration.', 'EN_ATTENTE');
    throw new ApiError(403, 'Votre compte est désactivé. Contactez l’administration.', 'DESACTIVE');
  }

  await resetName(keys);
  await db().from(table).update({ last_login_at: new Date().toISOString() }).eq('id', row.id);
  const name = `${row.prenom} ${row.nom}`;
  await logActivite({ role, user_id: row.id, nom: name, action: 'connexion' });
  const token = signSession({ sub: row.id, role, name });
  req.headers.authorization = `Bearer ${token}`;
  return { token, user: publicUser(await getActor(req)) };
}

async function connexionAdmin(req: Req) {
  const b = body(req.body);
  const mail = email(b.email);
  const pwd = typeof b.password === 'string' ? b.password.slice(0, 128) : '';
  const keys = loginKeys('admin', clientIp(req), mail);
  await assertNotLimited(keys);
  const MSG = 'Email ou mot de passe incorrect.';
  if (pwd.length < 6) { await registerFailure(keys); throw new ApiError(401, MSG, 'IDENTIFIANTS'); }

  const { data, error } = await authClient().auth.signInWithPassword({ email: mail, password: pwd });
  if (error || !data.user) { await registerFailure(keys); throw new ApiError(401, MSG, 'IDENTIFIANTS'); }
  const admin = await db().from('admin_users').select('user_id, email, display_name').eq('user_id', data.user.id).maybeSingle();
  check(admin.error, 'admin_users');
  if (!admin.data) { await registerFailure(keys); throw new ApiError(401, MSG, 'IDENTIFIANTS'); }

  await resetName(keys);
  const name = admin.data.display_name || admin.data.email;
  await logActivite({ role: 'admin', user_id: admin.data.user_id, nom: name, action: 'connexion' });
  return {
    token: signSession({ sub: admin.data.user_id, role: 'admin', name }),
    user: { id: admin.data.user_id, role: 'admin', name, email: admin.data.email },
  };
}

/** L'administration ouvre l'espace d'un guide spirituel (sans son mot de passe). */
async function accesGuide(req: Req) {
  const admin = await requireRole(req, 'admin');
  const id = requireUuid(body(req.body).pastor_id, 'Guide spirituel');
  const { data, error } = await db().from('pastors').select('id, nom, prenom').eq('id', id).maybeSingle();
  check(error, 'pastors');
  if (!data) throw new ApiError(404, 'Guide spirituel introuvable.');
  const name = `${data.prenom} ${data.nom}`.trim();
  await logActivite({ role: 'admin', user_id: admin.id, nom: admin.name, action: 'acces_espace_guide', cible_type: 'pasteur', cible_id: data.id, cible_titre: name });
  const token = signSession({ sub: data.id, role: 'pasteur', name, adm: admin.id }, 8 * 3600);
  req.headers.authorization = `Bearer ${token}`;
  return { token, user: publicUser(await getActor(req)) };
}

/** Visite anonyme : empreinte SHA-256 (IP + navigateur + jour + secret), jamais réversible. */
async function visite(req: Req) {
  const jour = new Date().toISOString().slice(0, 10);
  const ua = String(req.headers['user-agent'] ?? '').slice(0, 300);
  const hash = createHash('sha256').update(`${clientIp(req)}|${ua}|${jour}|${env().PDG_AUTH_SECRET}`).digest('hex').slice(0, 32);
  // Doublon du jour ignoré ; table absente → ignoré silencieusement
  await db().from('site_visits').upsert({ visit_day: jour, visitor_hash: hash }, { onConflict: 'visit_day,visitor_hash', ignoreDuplicates: true });
  return { ok: true };
}

export default route({
  async GET(req) {
    return { user: publicUser(await getActor(req)) };
  },
  async POST(req, res) {
    switch (query(req, 'action')) {
      case 'visite': return visite(req);
      case 'inscription-visiteur': return send(res, 201, await inscription(req, 'visiteur'));
      case 'inscription-pasteur': return send(res, 201, await inscription(req, 'pasteur'));
      case 'connexion': return connexion(req);
      case 'connexion-admin': return connexionAdmin(req);
      case 'acces-guide': return accesGuide(req);
      default: throw new ApiError(400, 'Action inconnue.');
    }
  },
});
