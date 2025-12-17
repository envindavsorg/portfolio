import type { Metadata } from 'next';
import { metadata } from '@/app/(app)/(docs)/blog/metadata';
import { Post } from '@/components/blog/components/Post';
import { TagsFilter } from '@/components/blog/components/TagsFilter';
import { getPostsByCategory } from '@/lib/blog/posts';
import { dayjs } from '@/lib/dayjs';
import { openGraphImage } from '@/lib/open-graph';

export const generateMetadata = async (): Promise<Metadata> =>
	openGraphImage({
		title: 'Mes articles de blog',
		description: 'Retrouvez tous mes articles de blog.',
		ogImageParams: {
			type: 'blog',
			title: 'Mes articles de blog',
			description: 'Retrouvez tous mes articles de blog.',
		},
	});

type BlogArticlesPageProps = {
	searchParams: Promise<{
		tag?: string;
	}>;
};

const BlogArticlesPage = async ({
	searchParams,
}: Readonly<BlogArticlesPageProps>) => {
	const resolvedSearchParams = await searchParams;
	const articles: Post[] = getPostsByCategory('article');

	const allTags = [
		'Tous les articles',
		...Array.from(
			new Set(
				articles.flatMap(
					(article: Post) => article.metadata.tags || [],
				),
			),
		).sort(),
	];
	const selectedTag = resolvedSearchParams.tag || 'Tous les articles';
	const filteredArticles =
		selectedTag === 'Tous les articles'
			? articles
			: articles.filter((article: Post) =>
					article.metadata.tags?.includes(selectedTag),
				);

	const tagCounts = allTags.reduce(
		(acc, tag) => {
			if (tag === 'Tous les articles') {
				acc[tag] = articles.length;
			} else {
				acc[tag] = articles.filter((article: Post) =>
					article.metadata.tags?.includes(tag),
				).length;
			}
			return acc;
		},
		{} as Record<string, number>,
	);

	return (
		<div className="min-h-svh">
			<div className="screen-line-after px-4">
				<h1 className="font-semibold text-3xl sm:text-4xl">
					{metadata.title}
				</h1>
			</div>

			<div className="screen-line-after p-4">
				<p className="text-balance font-mono text-muted-foreground text-sm">
					{metadata.description}
				</p>
			</div>

			<div className="screen-line-after p-4">
				{allTags.length > 0 && (
					<div className="mx-auto w-full max-w-7xl">
						<TagsFilter
							selectedTag={selectedTag}
							tagCounts={tagCounts}
							tags={allTags}
						/>
					</div>
				)}
			</div>

			<div className="relative pt-4">
				<div className="absolute inset-0 -z-1 grid grid-cols-1 gap-4 max-sm:hidden sm:grid-cols-2">
					<div className="border-edge border-r" />
					<div className="border-edge border-l" />
				</div>

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					{filteredArticles
						.slice()
						.sort((a, b) =>
							dayjs(b.metadata.createdAt).diff(
								dayjs(a.metadata.createdAt),
							),
						)
						.map((post: Post, idx: number) => (
							<Post
								key={post.slug}
								post={post}
								shouldPreloadImage={idx <= 4}
							/>
						))}
				</div>
			</div>

			<div className="h-8" />
		</div>
	);
};

export default BlogArticlesPage;
