declare global {
	// types for theme switcher (using next-themes)
	export type ThemeType = 'light' | 'dark' | 'system';

	export type PageType =
		| 'homepage'
		| 'blog'
		| 'blogArticle'
		| 'components'
		| 'componentsArticle'
		| 'utils'
		| 'utilsArticle';

	export type PageMetadata = {
		title: string;
		description: string;
		type: PageType;
	};

	// types fo blog
	export type PostMetadata = {
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

	export type Post = {
		metadata: PostMetadata;
		slug: string;
		content: string;
		reading?: {
			time: string;
			words: number;
		};
	};

	export type PostReadingTime = {
		time: string;
		minutes: number;
		words: number;
	};
}

export {};
