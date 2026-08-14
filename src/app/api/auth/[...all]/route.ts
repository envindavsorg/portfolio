import { toNextJsHandler } from "better-auth/next-js";

import { getAuth, isAdminConfigured } from "@/lib/admin/auth";

/**
 * Point d'entrée de better-auth.
 *
 * Dynamique par nature : il lit des cookies et parle à la base. Il ne doit
 * SURTOUT pas être prérendu, sans quoi le build de la CI — qui n'a ni base ni
 * secret — échouerait sur une route qui n'a aucune raison d'être statique.
 */
export const dynamic = "force-dynamic";

const unconfigured = (): Response =>
  new Response("espace d'administration non configuré", {
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    status: 503,
  });

export const GET = async (request: Request): Promise<Response> => {
  if (!isAdminConfigured()) {
    return unconfigured();
  }

  return await toNextJsHandler(getAuth()).GET(request);
};

export const POST = async (request: Request): Promise<Response> => {
  if (!isAdminConfigured()) {
    return unconfigured();
  }

  return await toNextJsHandler(getAuth()).POST(request);
};
