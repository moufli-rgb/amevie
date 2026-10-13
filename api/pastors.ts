/**
 * /api/pastors — pasteurs
 *  GET ?scope=public : pasteurs actifs + nombre de publications (page publique « Pasteurs »).
 *  GET               : administrateur → tous les pasteurs, statistiques, dernière connexion, dernière activité.
 *  GET ?id=          : administrateur → profil, publications, documents, Paroles, enseignements, activités datées.
 *  POST              : administrateur → ajouter un pasteur (compte actif) { nom, prenom, email, telephone, password, eglise?, bio? }
 *  PATCH ?id=        : administrateur → { is_active?, nom?, prenom?, email?, telephone?, eglise?, bio?, new_password? }
 *  DELETE ?id=       : administrateur → supprimer le compte (et ses publications / fichiers).
 */
import { route, query, send } from './_lib/http.js';
import { ApiError } from './_lib/errors.js';
import { body, requireUuid, bool, text, phone, email, requiredText, password } from './_lib/validate.js';
import { db, check, isMissingTable } from './_lib/supabase.js';
import { requireRole } from './_lib/auth.js';
import { hashPassword } from './_lib/crypto.js';
import { logActivite } from './_lib/activity.js';
import { COLONNES_LISTE } from './_lib/contenus.js';

const COLS = 'id, nom, prenom, email, telephone, eglise, bio, is_active, created_by_admin, reviewed_at, created_at, updated_at, last_login_at';
type Stats = { parole: number; enseignement: number; document: number; contenu: number; vues: number; derniere_publication: string | null };

export default route({
  async GET(req) {
    // ---- Page publique -------------------------------------------------------
    if (query(req, 'scope') === 'public') {
      const [p, c] = await Promise.all([
        db().from('pastors').select('id, prenom, nom, eglise, bio').eq('is_active', true).order('created_at'),
        db().from('contents').select('pastor_id').eq('is_published', true),
      ]);
      if (isMissingTable(p.error)) return { pastors: [] };
      check(p.error, 'pastors');
      const n = new Map<string, number>();
      for (const r of c.data ?? []) n.set(r.pastor_id, (n.get(r.pastor_id) ?? 0) + 1);
      return { pastors: (p.data ?? []).map((x) => ({ ...x, publications: n.get(x.id) ?? 0 })) };
    }

    await requireRole(req, 'admin');
    const id = query(req, 'id');
    if (id) {
      const pid = requireUuid(id);
      const [p, c, a] = await Promise.all([
        db().from('pastors').select(COLS).eq('id', pid).maybeSingle(),
        db().from('contents').select(COLONNES_LISTE).eq('pastor_id', pid).order('created_at', { ascending: false }),
        db().from('activity_logs').select('id, action, target_title, created_at').eq('user_id', pid).order('created_at', { ascending: false }).limit(100),
      ]);
      check(p.error, 'pastors'); check(c.error, 'contents'); check(a.error, 'activity_logs');
      if (!p.data) throw new ApiError(404, 'Pasteur introuvable.');
      const contents = (c.data ?? []).map(({ file_url, ...rest }) => ({ ...rest, has_file: !!file_url, locked: false }));
      return { pastor: p.data, contents, activites: a.data ?? [] };
    }

    const [p, c, a] = await Promise.all([
      db().from('pastors').select(COLS).order('created_at', { ascending: false }),
      db().from('contents').select('pastor_id, type, views, created_at'),
      db().from('activity_logs').select('user_id, action, created_at').eq('actor_role', 'pasteur').order('created_at', { ascending: false }).limit(5000),
    ]);
    check(p.error, 'pastors'); check(c.error, 'contents'); check(a.error, 'activity_logs');
    const stats = new Map<string, Stats>();
    for (const r of c.data ?? []) {
      const s = stats.get(r.pastor_id) ?? { parole: 0, enseignement: 0, document: 0, contenu: 0, vues: 0, derniere_publication: null };
      s[r.type as 'parole'] += 1;
      s.vues += r.views ?? 0;
      if (!s.derniere_publication || r.created_at > s.derniere_publication) s.derniere_publication = r.created_at;
      stats.set(r.pastor_id, s);
    }
    const derniere = new Map<string, { action: string; created_at: string }>();
    for (const r of a.data ?? []) if (r.user_id && !derniere.has(r.user_id)) derniere.set(r.user_id, r);
    return {
      pastors: (p.data ?? []).map((x) => ({
        ...x,
        en_attente: !x.is_active && !x.reviewed_at,
        stats: stats.get(x.id) ?? { parole: 0, enseignement: 0, document: 0, contenu: 0, vues: 0, derniere_publication: null },
        derniere_activite: derniere.get(x.id) ?? null,
      })),
    };
  },

  async POST(req, res) {
    const admin = await requireRole(req, 'admin');
    const b = body(req.body);
    const row = {
      nom: requiredText(b.nom, 'Nom', { min: 1, max: 60 }),
      prenom: requiredText(b.prenom, 'Prénom', { min: 1, max: 60 }),
      email: email(b.email),
      telephone: phone(b.telephone),
      eglise: text(b.eglise, 'Église / ministère', { max: 120 }),
      bio: text(b.bio, 'Présentation', { max: 1000, multiline: true }),
      password_hash: await hashPassword(password(b.password)),
      is_active: true, created_by_admin: true, reviewed_at: new Date().toISOString(),
    };
    const { data, error } = await db().from('pastors').insert(row).select(COLS).single();
    if (error?.code === '23505') throw new ApiError(409, 'Un pasteur utilise déjà cet email.', 'DOUBLON');
    check(error, 'pastors');
    await logActivite({ role: 'admin', user_id: admin.id, nom: admin.name, action: 'ajout_pasteur', cible_type: 'pasteur', cible_id: data!.id, cible_titre: `${row.prenom} ${row.nom}` });
    send(res, 201, { pastor: data });
  },

  async PATCH(req) {
    const admin = await requireRole(req, 'admin');
    const id = requireUuid(query(req, 'id'));
    const b = body(req.body);
    const maj: Record<string, unknown> = {};
    if ('is_active' in b) { maj.is_active = bool(b.is_active, 'Statut'); maj.reviewed_at = new Date().toISOString(); }
    if ('nom' in b) maj.nom = text(b.nom, 'Nom', { min: 1, max: 60, required: true });
    if ('prenom' in b) maj.prenom = text(b.prenom, 'Prénom', { min: 1, max: 60, required: true });
    if ('email' in b) maj.email = email(b.email);
    if ('telephone' in b) maj.telephone = phone(b.telephone);
    if ('eglise' in b) maj.eglise = text(b.eglise, 'Église / ministère', { max: 120 });
    if ('bio' in b) maj.bio = text(b.bio, 'Présentation', { max: 1000, multiline: true });
    if (b.new_password) maj.password_hash = await hashPassword(password(b.new_password, 'Nouveau mot de passe'));
    if (!Object.keys(maj).length) throw new ApiError(400, 'Aucune modification à enregistrer.');
    maj.updated_at = new Date().toISOString();
    const { data, error } = await db().from('pastors').update(maj).eq('id', id).select(COLS).maybeSingle();
    if (error?.code === '23505') throw new ApiError(409, 'Un pasteur utilise déjà cet email.');
    check(error, 'pastors');
    if (!data) throw new ApiError(404, 'Pasteur introuvable.');
    await logActivite({
      role: 'admin', user_id: admin.id, nom: admin.name,
      action: 'is_active' in maj ? (maj.is_active ? 'activation_pasteur' : 'desactivation_pasteur') : 'modification_pasteur',
      cible_type: 'pasteur', cible_id: id, cible_titre: `${data.prenom} ${data.nom}`,
    });
    return { pastor: data };
  },

  async DELETE(req) {
    const admin = await requireRole(req, 'admin');
    const id = requireUuid(query(req, 'id'));
    const files = await db().from('contents').select('file_url').eq('pastor_id', id).not('file_url', 'is', null);
    const paths = (files.data ?? []).map((f) => f.file_url as string);
    if (paths.length) await db().storage.from('documents').remove(paths);
    const { data, error } = await db().from('pastors').delete().eq('id', id).select('nom, prenom').maybeSingle();
    check(error, 'pastors');
    if (!data) throw new ApiError(404, 'Pasteur introuvable.');
    await logActivite({ role: 'admin', user_id: admin.id, nom: admin.name, action: 'suppression_pasteur', cible_type: 'pasteur', cible_titre: `${data.prenom} ${data.nom}` });
    return { ok: true };
  },
});
