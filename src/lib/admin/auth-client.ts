"use client";

import { createAuthClient } from "better-auth/react";

/**
 * Client better-auth, côté navigateur.
 *
 * Aucune URL de base n'est passée : le client parle à la même origine, ce qui
 * est déjà ce que la CSP autorise (`connect-src 'self'`). Coder l'origine en dur
 * casserait les déploiements de prévisualisation Vercel, dont le domaine change
 * à chaque branche.
 */
export const authClient = createAuthClient();

export const signInWithGitHub = async (): Promise<void> => {
  await authClient.signIn.social({
    callbackURL: "/admin",
    /**
     * Où revenir quand GitHub refuse, ou quand la garde de création rejette un
     * compte qui n'est pas celui du propriétaire. Sans ça, l'échec renvoie sur
     * une page d'erreur générique qui ne dit pas ce qui s'est passé.
     */
    errorCallbackURL: "/admin/signin?erreur=1",
    provider: "github",
  });
};

export const signOut = async (): Promise<void> => {
  await authClient.signOut();
};
