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

interface GitHubData {
  login: string;
  name: string;
  avatar: string;
  followers: number;
  following: number;
  stars: number;
  contributions: ContributionDay[];
}

interface GitHubDataResponse {
  user: {
    login: string;
    name: string;
    avatarUrl: string;
    followers: { totalCount: number };
    following: { totalCount: number };
    repositories: {
      nodes: { stargazers: { totalCount: number } }[];
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
