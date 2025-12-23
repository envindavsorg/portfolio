import type { Metadata } from 'next';
import { Post } from '@/components/blog/components/Post';
import { TagsFilter } from '@/components/blog/components/TagsFilter';
import { WritingsHeading } from '@/components/features/writings/Heading';
import { Divider } from '@/components/ui/Divider';
import { getPostsByCategory } from '@/lib/blog/posts';
import { dayjs } from '@/lib/dayjs';
import { openGraphImage } from '@/lib/open-graph';

export const generateMetadata = async (): Promise<Metadata> =>
	openGraphImage({
		title: 'Mes articles de blog',
		description:
			'Retrouvez tous mes articles de blog où je partage mon expérience en développement web.',
		ogImageParams: {
			type: 'blog',
			title: 'Mes articles de blog',
			description:
				'Retrouvez tous mes articles de blog où je partage mon expérience en développement web.',
		},
	});

type BlogPageProps = Readonly<{
	searchParams: Promise<{
		tag?: string;
	}>;
}>;

const BlogPage = async ({ searchParams }: Readonly<BlogPageProps>) => {
	const { tag } = await searchParams;
	const selectedTag = tag?.toLowerCase() || 'Tout';

	const allArticles: Post[] = getPostsByCategory('article').sort(
		(a: Post, b: Post) =>
			dayjs(b.metadata.createdAt).diff(dayjs(a.metadata.createdAt))
	);

	const tagCounts: Record<string, number> = {};
	for (const post of allArticles) {
		for (const tagName of post.metadata.tags || []) {
			tagCounts[tagName] = (tagCounts[tagName] || 0) + 1;
		}
	}

	const sortedTags = Object.keys(tagCounts).sort();
	const allTags = ['Tout', ...sortedTags];
	const finalTagCounts = {
		Tout: allArticles.length,
		...tagCounts,
	};

	const articles =
		selectedTag === 'Tout'
			? allArticles
			: allArticles.filter((article: Post) =>
					article.metadata.tags?.some(
						(tagName) => tagName.toLowerCase() === selectedTag
					)
				);

	return (
		<div className="min-h-svh">
			<WritingsHeading
				description="Retrouvez tous mes articles de blog où je partage mon expérience en développement web. J'y aborde les bonnes pratiques, les patterns modernes, les solutions aux problèmes techniques du quotidien, et mes découvertes sur l'écosystème JavaScript. Chaque article est le fruit d'une expérience concrète, d'un bug résolu ou d'une technique apprise. Mon objectif : documenter mon apprentissage et aider d'autres développeurs qui rencontrent les mêmes défis."
				title="Mes articles de blog"
			/>

			<TagsFilter
				selectedTag={selectedTag}
				tagCounts={finalTagCounts}
				tags={allTags}
			/>

			<Divider />

			<div className="relative">
				<div className="absolute inset-0 -z-1 grid grid-cols-1 gap-4 max-sm:hidden sm:grid-cols-2">
					<div className="border-edge border-r" />
					<div className="border-edge border-l" />
				</div>

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					{articles
						.slice()
						.sort((a, b) =>
							dayjs(b.metadata.createdAt).diff(dayjs(a.metadata.createdAt))
						)
						.map((post: Post, idx: number) => (
							<Post key={post.slug} post={post} shouldPreloadImage={idx <= 4} />
						))}
				</div>
			</div>

			<div className="h-8" />
		</div>
	);
};

export default BlogPage;
