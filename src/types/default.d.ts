// SERVER ACTION TYPES
// types for GitHub commit data
interface CommitData {
  branch?: string;
  hash?: string;
  updated?: string;
}

interface CommitResponse {
  repository: {
    defaultBranchRef: {
      name: string;
      target: {
        oid: string;
        committedDate: string;
      };
    } | null;
  } | null;
}

// types for GitHub data
type ContributionLevel =
  | "NONE"
  | "FIRST_QUARTILE"
  | "SECOND_QUARTILE"
  | "THIRD_QUARTILE"
  | "FOURTH_QUARTILE";

interface ContributionDay {
  date: string;
  count: number;
  level: number;
}

/** répartition des langages d'un dépôt, telle que renvoyée par l'API GraphQL */
interface GitHubLanguageNode {
  /** un fork fausserait les statistiques avec du code écrit par d'autres */
  isFork?: boolean;
  languages?: {
    edges: ({
      size: number;
      node: { name: string; color: string | null };
    } | null)[];
  } | null;
}

/**
 * un dépôt public, tel qu'il est affiché en carte sur la page d'accueil
 *
 * Tout est optionnel : ces champs viennent d'une API distante, et un `null`
 * inattendu ne doit pas casser le rendu de la page d'accueil. `src/lib/repos.ts`
 * écarte les nœuds inexploitables.
 */
interface GitHubRepoNode extends GitHubLanguageNode {
  name?: string | null;
  description?: string | null;
  url?: string | null;
  stargazerCount?: number | null;
  forkCount?: number | null;
  /** date ISO du dernier push */
  pushedAt?: string | null;
  isArchived?: boolean;
  primaryLanguage?: { name: string; color: string | null } | null;
  repositoryTopics?: {
    nodes: ({ topic: { name: string } } | null)[] | null;
  } | null;
}

interface GitHubData {
  login: string;
  name: string;
  avatar: string;
  followers: number;
  following: number;
  stars: number;
  contributions: ContributionDay[];
  /** dépôts publics : agrégat des langages et cartes de la page d'accueil */
  repositories: GitHubRepoNode[];
}

interface GitHubDataResponse {
  user: {
    login: string;
    name: string;
    avatarUrl: string;
    followers: { totalCount: number };
    following: { totalCount: number };
    repositories: {
      nodes: GitHubRepoNode[];
    };
    contributionsCollection: {
      contributionCalendar: {
        totalContributions: number;
        weeks: {
          contributionDays: {
            contributionCount: number;
            date: string;
            contributionLevel: ContributionLevel;
          }[];
        }[];
      };
    };
  };
}

// types for LinkedIn followers
interface LinkedInData {
  count: number;
  updatedAt: string;
}

// types for theme switcher (using next-themes)
type ThemeType = "light" | "dark" | "system";

// types for page layout and OG image generation
type PageType =
  | "homepage"
  | "project"
  | "experience"
  | "blog"
  | "blogArticle"
  | "components"
  | "componentsArticle"
  | "utils"
  | "utilsArticle";

// types for browser hook
type Browser =
  | "Arc Browser"
  | "Mozilla Firefox"
  | "Google Chrome"
  | "Apple Safari"
  | "Microsoft Edge";

interface BrowserInfo {
  name: Browser;
  image: string;
  comment: string;
}

// types for footer metadata
interface FooterMeta {
  image: string | undefined;
  label: string;
  value: string | undefined;
  comment: string | null;
}

// types for GitHub contribution graph
// Type for weekday (0 = Sunday, 6 = Saturday)
type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

interface CommitActivity {
  date: string;
  count: number;
  level: number;
}

type Week = (CommitActivity | undefined)[];

interface Labels {
  months?: string[];
  weekdays?: string[];
  totalCount?: string;
  legend?: {
    less?: string;
    more?: string;
  };
}

interface MonthLabel {
  weekIndex: number;
  label: string;
}
