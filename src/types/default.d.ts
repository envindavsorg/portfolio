import type React from 'react';

declare global {
	// types for theme switcher (using next-themes)
	type ThemeType = 'light' | 'dark' | 'system';

	// types for page layout and OG image generation
	type PageType =
		| 'homepage'
		| 'blog'
		| 'blogArticle'
		| 'components'
		| 'componentsArticle'
		| 'utils'
		| 'utilsArticle';

	// types for unist tree
	type UnistNode = {
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
	};

	type UnistTree = {
		type: string;
		children: UnistNode[];
	};

	// types for blog, components, and utils posts
	type PostMetadata = {
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
	};

	type Post = {
		metadata: PostMetadata;
		slug: string;
		content: string;
		reading?: {
			time: string;
			words: number;
		};
	};

	type PostReadingTime = {
		time: string;
		minutes: number;
		words: number;
	};

	// types for user profile
	type User = {
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
			icon: React.ElementType;
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
		about: string;
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
	};

	// types for navigation bar
	type NavigationItem = {
		title: string;
		href: string;
	};

	// types for navbar command menu
	type CommandLinkItem = {
		title: string;
		href: string;
		icon?: React.ElementType;
		iconImage?: StaticImageData;
		keywords?: string[];
		openInNewTab?: boolean;
	};

	type CommandKind =
		| 'command'
		| 'page'
		| 'link'
		| 'utils'
		| 'article'
		| 'components'
		| 'section'
		| 'download';

	type CommandMetaMap = Map<string, { commandKind: CommandKind }>;
}
