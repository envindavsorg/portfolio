import { Octokit } from "octokit";

import { env } from "@/env";

/**
 * Écrire un fichier dans le dépôt, par l'API GitHub.
 *
 * C'est le seul endroit du dépôt qui ÉCRIT quelque part. Sur Vercel, le système
 * de fichiers est en lecture seule à l'exécution et un fichier modifié
 * disparaîtrait au redéploiement : le contenu ne peut donc pas être enregistré
 * en place. Un commit, en revanche, garde les MDX comme source de vérité, laisse
 * l'historique git comme trace, et déclenche le redéploiement — au prix des deux
 * minutes de build entre l'enregistrement et la mise en ligne.
 *
 * ⚠️ Le client REST est construit paresseusement, comme `getAuth()` et
 * `getResend()` : `new Octokit({ auth: undefined })` ne lance pas, mais
 * construire au niveau du module ferait porter au build une dépendance qu'il n'a
 * aucune raison d'avoir.
 */

let cached: Octokit | null = null;

const getClient = (): Octokit => {
  cached ??= new Octokit({ auth: env.GITHUB_API_TOKEN });

  return cached;
};

export interface CommitTarget {
  owner: string;
  repo: string;
}

/** ce qu'il manque pour pouvoir écrire */
export const missingCommitConfig = (): string[] => {
  const missing: string[] = [];

  if (!env.GITHUB_USERNAME) {
    missing.push("GITHUB_USERNAME");
  }
  if (!env.GITHUB_REPO_NAME) {
    missing.push("GITHUB_REPO_NAME");
  }

  return missing;
};

const target = (): CommitTarget => {
  const owner = env.GITHUB_USERNAME;
  const repo = env.GITHUB_REPO_NAME;

  if (!(owner && repo)) {
    throw new Error(
      `écriture impossible, variables manquantes : ${missingCommitConfig().join(", ")}`
    );
  }

  return { owner, repo };
};

export interface FileState {
  content: string;
  /** SHA du blob courant, exigé par GitHub pour toute mise à jour */
  sha: string;
}

/**
 * L'état actuel d'un fichier, ou `null` s'il n'existe pas encore.
 *
 * Le SHA n'est pas un détail : sans lui, GitHub refuse la mise à jour. C'est
 * aussi ce qui rend l'écriture SÛRE face à une modification concurrente — si le
 * fichier a changé depuis la lecture, le SHA ne correspond plus et l'API répond
 * 409 au lieu d'écraser.
 */
export const readFile = async (
  path: string
): Promise<FileState | null> => {
  const { owner, repo } = target();

  try {
    const response = await getClient().rest.repos.getContent({
      owner,
      path,
      repo,
    });

    const data = response.data;

    if (Array.isArray(data) || data.type !== "file") {
      return null;
    }

    return {
      content: Buffer.from(data.content, "base64").toString("utf8"),
      sha: data.sha,
    };
  } catch (error) {
    // 404 : le fichier n'existe pas encore, ce qui est un cas normal
    if (
      typeof error === "object" &&
      error !== null &&
      (error as { status?: number }).status === 404
    ) {
      return null;
    }

    throw error;
  }
};

export interface CommitResult {
  sha: string;
  url: string;
}

export const commitFile = async (options: {
  path: string;
  content: string;
  message: string;
  /**
   * SHA attendu du fichier courant. Omis pour une création.
   *
   * Transmis tel quel à GitHub : c'est lui qui fait échouer l'écriture si
   * quelqu'un — ou un autre onglet — a modifié le fichier entre-temps.
   */
  sha?: string;
}): Promise<CommitResult> => {
  const { owner, repo } = target();

  const response =
    await getClient().rest.repos.createOrUpdateFileContents({
      content: Buffer.from(options.content, "utf8").toString(
        "base64"
      ),
      message: options.message,
      owner,
      path: options.path,
      repo,
      sha: options.sha,
    });

  return {
    sha: response.data.commit.sha ?? "",
    url: response.data.commit.html_url ?? "",
  };
};
