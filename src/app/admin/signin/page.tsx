import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { SignInButton } from "@/components/admin/SignInButton";
import {
  getAdminSession,
  missingAdminConfig,
} from "@/lib/admin/auth";

/**
 * Connexion. Hors du groupe protégé, sinon la garde renverrait ici en boucle.
 *
 * Dynamique pour la même raison que le groupe protégé : elle lit la session pour
 * éviter de proposer une connexion à quelqu'un qui est déjà entré.
 */
export const dynamic = "force-dynamic";

const SignInPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string }>;
}) => {
  const session = await getAdminSession(await headers());

  if (session) {
    redirect("/admin");
  }

  const { erreur } = await searchParams;
  const missing = missingAdminConfig();

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-md flex-col justify-center gap-y-6 px-4">
      <div className="flex flex-col gap-y-2">
        <h1 className="font-semibold text-2xl lowercase">
          administration
        </h1>
        <p className="text-muted-foreground text-sm">
          Cet espace n'est ouvert qu'au compte GitHub du propriétaire
          du site.
        </p>
      </div>

      {missing.length > 0 ? (
        /*
          On DIT ce qui manque plutôt que d'afficher un bouton qui échouera.
          Les noms de variables ne sont pas des secrets ; leurs valeurs, si.
        */
        <div className="rounded-md border border-input p-3 text-sm">
          <p className="font-medium">
            L'espace d'administration n'est pas configuré.
          </p>
          <p className="pt-1 text-muted-foreground">
            Variables manquantes : {missing.join(", ")}.
          </p>
        </div>
      ) : (
        <SignInButton />
      )}

      {erreur ? (
        <p className="text-destructive text-sm" role="alert">
          La connexion a échoué. Ce compte GitHub n'est pas celui du
          propriétaire du site.
        </p>
      ) : null}
    </main>
  );
};

export default SignInPage;
