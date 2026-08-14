import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type React from "react";

import { AdminNav } from "@/components/admin/AdminNav";
import { getAdminSession } from "@/lib/admin/auth";

/**
 * La garde, côté SERVEUR, sur chaque requête.
 *
 * `force-dynamic` n'est pas décoratif : sans lui, Next tenterait de prérendre
 * ces pages au build — donc sans cookies, donc sans session — et le résultat
 * mis en cache servirait un espace d'administration à tout le monde. C'est le
 * mode de défaillance classique d'une page protégée dans l'App Router.
 *
 * `getAdminSession` revérifie l'identité contre `ADMIN_GITHUB_ID` à chaque
 * appel ; ce n'est pas un simple « existe-t-il une session ? ».
 */
export const dynamic = "force-dynamic";

const ProtectedLayout = async ({
  children,
}: Readonly<{ children: React.ReactNode }>) => {
  const session = await getAdminSession(await headers());

  if (!session) {
    redirect("/admin/signin");
  }

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-5xl flex-col">
      <AdminNav session={session} />

      <main className="flex-1 px-3 py-6">{children}</main>
    </div>
  );
};

export default ProtectedLayout;
