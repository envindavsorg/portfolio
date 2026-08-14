import { betterAuth } from "better-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Pool } from "pg";

import { env } from "@/env";

import { describeIdentity, isAdmin } from "./access";

/**
 * better-auth, GitHub uniquement, propriétaire uniquement.
 *
 * ⚠️ CONSTRUIT PARESSEUSEMENT, comme `getResend()` dans `send-cv.action.ts`.
 *
 * C'est la même leçon que celle déjà notée dans ce dépôt : `new Resend(undefined)`
 * lançait au niveau du MODULE, donc avant qu'aucune garde à l'intérieur de
 * l'action puisse s'exécuter. Ici l'équivalent serait un `new Pool()` sans URL et
 * un `betterAuth()` sans secret, évalués à l'import — ce qui casserait le build
 * de la CI, qui n'a aucune de ces variables. Rien n'est donc touché avant qu'une
 * requête n'arrive réellement sur `/api/auth/*` ou `/admin`.
 *
 * L'autorisation, elle, ne vit pas ici : elle est dans `access.ts`, module pur et
 * testé. Ce fichier ne fait que l'appeler aux deux moments qui comptent.
 */

export interface AdminSession {
  userId: string;
  email: string | null;
  name: string | null;
  image: string | null;
  githubId: string | null;
  githubLogin: string | null;
}

/** ce qu'il manque pour que l'espace admin puisse fonctionner */
export const missingAdminConfig = (): string[] => {
  const missing: string[] = [];

  if (!env.DATABASE_URL) {
    missing.push("DATABASE_URL");
  }
  if (!env.BETTER_AUTH_SECRET) {
    missing.push("BETTER_AUTH_SECRET");
  }
  if (!env.GITHUB_CLIENT_ID) {
    missing.push("GITHUB_CLIENT_ID");
  }
  if (!env.GITHUB_CLIENT_SECRET) {
    missing.push("GITHUB_CLIENT_SECRET");
  }
  if (!env.ADMIN_GITHUB_ID) {
    missing.push("ADMIN_GITHUB_ID");
  }

  return missing;
};

export const isAdminConfigured = (): boolean =>
  missingAdminConfig().length === 0;

let cachedPool: Pool | null = null;

/**
 * Pas d'annotation de retour, et pas de `ReturnType<typeof betterAuth>`.
 *
 * better-auth infère tout son type depuis l'objet d'options : le désigner par
 * `ReturnType<typeof betterAuth>` l'aplatit en `Auth<BetterAuthOptions>`, que le
 * type réel — porteur des champs additionnels et des crochets — ne satisfait
 * plus. On laisse donc l'inférence faire, et on nomme le type depuis CE
 * constructeur.
 */
const buildAuth = () => {
  cachedPool ??= new Pool({
    connectionString: env.DATABASE_URL,
    // la base ne stocke que des utilisateurs et des sessions : deux connexions
    // suffisent, et une limite basse évite d'épuiser le quota de Neon depuis des
    // fonctions serverless qui se multiplient
    max: 2,
  });

  const pool = cachedPool;

  return betterAuth({
    account: {
      accountLinking: { enabled: false },
    },
    database: pool,
    databaseHooks: {
      /**
       * LA porte. Un compte qui n'est pas celui du propriétaire n'est jamais créé.
       *
       * Refuser à la création plutôt qu'à l'affichage a deux effets : la base ne
       * se remplit pas d'inconnus qui ont cliqué, et il n'existe aucune session
       * valide pour quelqu'un d'autre — donc rien à révoquer plus tard.
       *
       * Ce n'est pas la seule barrière : `requireAdminSession()` revérifie à
       * chaque requête sur `/admin`. Les deux sont volontaires, et aucune ne
       * suppose l'autre correcte.
       */
      user: {
        create: {
          before: async (user) => {
            const identity = {
              githubId: (user as { githubId?: string }).githubId,
              githubLogin: (user as { githubLogin?: string })
                .githubLogin,
            };

            if (!isAdmin(identity, env.ADMIN_GITHUB_ID)) {
              throw new Error(
                `accès refusé : ${describeIdentity(identity)} n'est pas le propriétaire du site`
              );
            }

            return { data: user };
          },
        },
      },
    },
    emailAndPassword: { enabled: false },
    secret: env.BETTER_AUTH_SECRET,
    session: {
      // 7 jours, renouvelés à chaque jour d'activité
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
    },
    socialProviders: {
      github: {
        clientId: env.GITHUB_CLIENT_ID ?? "",
        clientSecret: env.GITHUB_CLIENT_SECRET ?? "",
        /**
         * L'identifiant numérique et le pseudo sont recopiés sur l'utilisateur
         * pour que la garde de création puisse décider, et pour que
         * `requireAdminSession()` puisse revérifier sans rappeler GitHub.
         */
        mapProfileToUser: (profile) => ({
          githubId: String(profile.id),
          githubLogin: profile.login,
        }),
      },
    },
    user: {
      additionalFields: {
        githubId: {
          input: false,
          required: false,
          type: "string",
        },
        githubLogin: {
          input: false,
          required: false,
          type: "string",
        },
      },
    },
  });
};

type Auth = ReturnType<typeof buildAuth>;

let cached: Auth | null = null;

/**
 * L'instance, construite au premier appel seulement.
 *
 * Lance si la configuration manque : mieux vaut une erreur explicite sur
 * `/admin` qu'un espace d'administration à moitié fonctionnel.
 */
export const getAuth = (): Auth => {
  const missing = missingAdminConfig();

  if (missing.length > 0) {
    throw new Error(
      `espace d'administration non configuré, variables manquantes : ${missing.join(", ")}`
    );
  }

  cached ??= buildAuth();

  return cached;
};

/**
 * La garde à appeler EN PREMIÈRE LIGNE de chaque page protégée.
 *
 * ⚠️ Une garde dans le layout NE SUFFIT PAS, et c'est contre-intuitif.
 *
 * Next rend le layout et la page en PARALLÈLE. Un `redirect()` levé par le
 * layout n'interrompt donc pas la page : elle calcule ses données et son JSX
 * atterrit dans le payload RSC de la réponse de redirection. Mesuré sur ce
 * dépôt — `curl` sur `/admin` sans session rendait un 307 dont le corps
 * contenait l'inventaire complet du contenu et le tableau des poids. Le
 * navigateur suit la redirection et n'affiche rien ; le corps est lisible quand
 * même.
 *
 * Appeler cette garde avant toute lecture de données fait lever la page
 * elle-même, avant d'avoir rien calculé ni rendu. Le layout garde la sienne :
 * deux barrières, aucune ne suppose l'autre correcte.
 */
export const requireAdminSession =
  async (): Promise<AdminSession> => {
    const session = await getAdminSession(await headers());

    if (!session) {
      redirect("/admin/signin");
    }

    return session;
  };

/**
 * La session courante, REVÉRIFIÉE contre `ADMIN_GITHUB_ID`.
 *
 * Deuxième barrière, indépendante de la première. La garde de création empêche
 * qu'un compte étranger existe ; celle-ci ne le suppose pas. Une session peut
 * survivre à un changement de configuration — si `ADMIN_GITHUB_ID` change, les
 * sessions déjà émises doivent cesser de valoir, et c'est ici que ça se joue.
 *
 * Rend `null` plutôt que de lancer : l'appelant décide s'il redirige ou s'il
 * rend un 404.
 */
export const getAdminSession = async (
  headers: Headers
): Promise<AdminSession | null> => {
  if (!isAdminConfigured()) {
    return null;
  }

  const session = await getAuth()
    .api.getSession({ headers })
    .catch(() => null);

  if (!session?.user) {
    return null;
  }

  const user = session.user as typeof session.user & {
    githubId?: string | null;
    githubLogin?: string | null;
  };

  if (
    !isAdmin(
      { githubId: user.githubId, githubLogin: user.githubLogin },
      env.ADMIN_GITHUB_ID
    )
  ) {
    return null;
  }

  return {
    email: user.email ?? null,
    githubId: user.githubId ?? null,
    githubLogin: user.githubLogin ?? null,
    image: user.image ?? null,
    name: user.name ?? null,
    userId: user.id,
  };
};
