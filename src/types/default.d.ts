import type { ElementType } from 'react';

declare global {
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
	type ContributionLevel = 'NONE' | 'FIRST_QUARTILE' | 'SECOND_QUARTILE' | 'THIRD_QUARTILE' | 'FOURTH_QUARTILE';

	interface ContributionDay {
		date: string;
		count: number;
		level: number;
	}

	export interface GitHubData {
		login: string;
		name: string;
		avatar: string;
		followers: number;
		following: number;
		stars: number;
		contributions: ContributionDay[];
	}

	export interface GitHubDataResponse {
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
	type ThemeType = 'light' | 'dark' | 'system';

	// types for page layout and OG image generation
	type PageType = 'homepage' | 'blog' | 'blogArticle' | 'components' | 'componentsArticle' | 'utils' | 'utilsArticle';

	// types for unist tree
	interface UnistNode {
		type: string;
		name?: string;
		tagName?: string;
		value?: string;
		properties?: {
			__rawString__?: string;
			[key: string]: unknown;
		} & {
			__pnpm__?: string;
			__yarn__?: string;
			__npm__?: string;
			__bun__?: string;
		};
		attributes?: {
			name: string;
			value: unknown;
			type?: string;
		}[];
		children?: UnistNode[];
	}

	interface UnistTree {
		type: string;
		children: UnistNode[];
	}

	// types for blog, components, and utils posts
	interface PostMetadata {
		title: string;
		description: string;
		imageDark?: string;
		imageLight?: string;
		category?: string;
		createdAt: string;
		updatedAt: string;
		tags?: string[];
		author?: string;
		new?: boolean;
	}

	interface Post {
		metadata: PostMetadata;
		slug: string;
		content: string;
		reading?: {
			time: string;
			words: number;
		};
	}

	interface PostReadingTime {
		time: string;
		minutes: number;
		words: number;
	}

	// types for user profile
	interface User {
		firstName: string;
		lastName: string;
		username: string;
		gender: string;
		pronouns: string;
		bio: string;
		phoneNumber: string;
		emailAddress: string;
		overview: {
			id: string;
			content: string;
			icon: ElementType;
			className: string;
		}[];
		location: {
			city: string;
		};
		website: string;
		jobTitle: string;
		jobs: {
			title: string;
			company: string;
			website: string;
		}[];
		photo: string;
		avatar: string;
		ogImage: string;
		namePronunciationUrl: string;
		documents: {
			cv: {
				content: string;
				url: string;
				name: string;
				title: string;
			};
		};
		keywords: string[];
		dateCreated: string;
	}

	// types for navigation bar
	interface NavigationItem {
		title: string;
		description: string;
		href: string;
	}

	// types for navbar command menu
	interface CommandLinkItem {
		title: string;
		url: string;
		icon?: ElementType;
		keywords?: string[];
		openInNewTab?: boolean;
	}

	type CommandKind = 'command' | 'page' | 'link' | 'utils' | 'article' | 'components' | 'section' | 'download';

	type CommandMetaMap = Map<string, { commandKind: CommandKind }>;

	// types for browser hook
	type Browser = 'Arc Browser' | 'Mozilla Firefox' | 'Google Chrome' | 'Apple Safari' | 'Microsoft Edge';

	interface BrowserInfo {
		name: Browser;
		image: string;
		comment: string;
	}

	// types for footer metadata
	interface FooterMeta {
		image: string | undefined;
		label: string;
		value: Browser | undefined;
		comment: string | undefined;
	}

	// types for GitHub contribution graph
	type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6; // Type for weekday (0 = Sunday, 6 = Saturday)

	interface CommitActivity {
		date: string;
		count: number;
		level: number;
	}

	type Week = Array<CommitActivity | undefined>;

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
}
