import { DEFAULT_LANGUAGE_COLOR } from "./github-stats";

/**
 * Sélection des dépôts publics mis en avant sur la page d'accueil.
 *
 * Module sans dépendance, testable seul : c'est ici que se décide CE QUI est
 * montré et DANS QUEL ORDRE, et cette décision ne doit pas dépendre du rendu.
 *
 * L'ordre est entièrement déterministe. Un tri sur les seules étoiles paraît
 * suffisant jusqu'à ce qu'on regarde des dépôts personnels : ils en ont presque
 * tous zéro, l'égalité est donc la règle et non l'exception, et l'ordre affiché
 * serait alors celui — arbitraire — dans lequel l'API renvoie les nœuds. Les
 * cartes changeraient de place d'un build à l'autre sans qu'aucun contenu
 * change. D'où trois clés en cascade : étoiles, puis date de dernier push, puis
 * nom.
 */

export interface RepoCardLanguage {
  name: string;
  color: string;
}

export interface RepoCard {
  name: string;
  description: string | null;
  url: string;
  stars: number;
  forks: number;
  /** date ISO du dernier push, `null` si l'API ne l'a pas renvoyée */
  pushedAt: string | null;
  isArchived: boolean;
  language: RepoCardLanguage | null;
  topics: string[];
}

const DEFAULT_LIMIT = 6;

/** au-delà, la rangée de sujets déborde et concurrence la description */
const MAX_TOPICS = 3;

/** un dépôt affichable : celui dont on peut au moins construire le lien */
type LinkableRepo = GitHubRepoNode & { name: string; url: string };

/**
 * Un dépôt sans description ET sans langage n'a rien à montrer : la carte se
 * réduirait à un nom cliquable. Un seul des deux suffit — un dépôt de notes
 * n'a pas de langage, un bac à sable n'a pas de description.
 */
const hasSomethingToShow = (repo: GitHubRepoNode): boolean =>
  Boolean(repo.description?.trim() || repo.primaryLanguage?.name);

const isDisplayable = (repo: GitHubRepoNode): repo is LinkableRepo =>
  // un fork n'est pas son travail : le mettre en avant serait mentir
  !repo.isFork &&
  Boolean(repo.name?.trim()) &&
  Boolean(repo.url?.trim()) &&
  hasSomethingToShow(repo);

const toCard = (repo: LinkableRepo): RepoCard => {
  const description = repo.description?.trim();
  const languageName = repo.primaryLanguage?.name;

  return {
    description: description || null,
    forks: Math.max(0, repo.forkCount ?? 0),
    isArchived: Boolean(repo.isArchived),
    language: languageName
      ? {
          // GitHub renvoie une couleur nulle pour les langages exotiques
          color:
            repo.primaryLanguage?.color ?? DEFAULT_LANGUAGE_COLOR,
          name: languageName,
        }
      : null,
    name: repo.name,
    pushedAt: repo.pushedAt ?? null,
    stars: Math.max(0, repo.stargazerCount ?? 0),
    topics: (repo.repositoryTopics?.nodes ?? [])
      .map((node) => node?.topic?.name?.trim())
      .filter((name): name is string => Boolean(name))
      .slice(0, MAX_TOPICS),
    url: repo.url,
  };
};

const byInterest = (a: RepoCard, b: RepoCard): number =>
  b.stars - a.stars ||
  (b.pushedAt ?? "").localeCompare(a.pushedAt ?? "") ||
  a.name.localeCompare(b.name);

export const selectRepos = (
  repositories: GitHubRepoNode[],
  { limit = DEFAULT_LIMIT }: { limit?: number } = {}
): RepoCard[] =>
  repositories
    .filter(isDisplayable)
    .map(toCard)
    .toSorted(byInterest)
    .slice(0, Math.max(0, limit));
