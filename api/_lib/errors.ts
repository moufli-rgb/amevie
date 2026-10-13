/** Erreur « prévue » renvoyée telle quelle au client (message en français). */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
    public extra?: Record<string, unknown>,
  ) {
    super(message);
  }
}

export const MSG_IDENTIFIANTS = 'Email ou mot de passe incorrect.';
export const MSG_SESSION = 'Votre session a expiré. Veuillez vous reconnecter.';
export const MSG_INTERDIT = "Vous n'avez pas accès à cette ressource.";
