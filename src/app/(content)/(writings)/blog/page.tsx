import type { Metadata } from 'next';
import { cache } from 'react';
import { Divider } from '@/components/primitives/Divider';
import { TextAnimate } from '@/components/text/TextAnimate';
import { ArticleItem } from '@/features/(root)/articles/ArticleItem';
import { TagsFilter } from '@/features/(writings)/TagsFilter';
import { getPostsByCategory } from '@/lib/blog/posts';
import { openGraphImage } from '@/lib/open-graph';
import { dayjs } from '@/lib/utils';

const getCachedPosts = cache(() =>
	getPostsByCategory('article').sort((a, b) =>
		dayjs(b.metadata.createdAt).diff(dayjs(a.metadata.createdAt))
	)
);

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
	const selectedTag = tag?.toLowerCase();

	const allArticles = getCachedPosts();

	const tagCounts: Record<string, number> = {
		Tout: allArticles.length,
	};

	for (const post of allArticles) {
		for (const tagName of post.metadata.tags || []) {
			tagCounts[tagName] = (tagCounts[tagName] || 0) + 1;
		}
	}

	const allTags = [
		'Tout',
		...Object.keys(tagCounts)
			.filter((k) => k !== 'Tout')
			.sort(),
	];

	const articles =
		!selectedTag || selectedTag === 'tout'
			? allArticles
			: allArticles.filter((article) =>
					article.metadata.tags?.some((t) => t.toLowerCase() === selectedTag)
				);

	return (
		<div className="min-h-svh">
			<div className="screen-line-before screen-line-after px-3">
				<h1 className="font-semibold text-3xl sm:text-4xl">
					<TextAnimate animation="slideLeft" by="character" delay={0.2}>
						Mes articles de blog
					</TextAnimate>
				</h1>
			</div>

			<div className="screen-line-after p-3">
				<TextAnimate animation="slideUp" as="p" by="word" delay={0.4}>
					Retrouvez tous mes articles de blog où je partage mon expérience en
					développement web. J'y aborde les bonnes pratiques, les patterns
					modernes, les solutions aux problèmes techniques du quotidien, et mes
					découvertes sur l'écosystème JavaScript.
				</TextAnimate>

				<TextAnimate
					animation="slideUp"
					as="p"
					by="word"
					className="mt-3"
					delay={0.5}
				>
					Chaque article est le fruit d'une expérience concrète, d'un bug résolu
					ou d'une technique apprise.
				</TextAnimate>

				<TextAnimate
					animation="slideUp"
					as="p"
					by="word"
					className="mt-3"
					delay={0.6}
					themed
				>
					Mon objectif : documenter mon apprentissage et aider d'autres
					développeurs qui rencontrent les mêmes défis.
				</TextAnimate>
			</div>

			<TagsFilter
				selectedTag={selectedTag || 'Tout'}
				tagCounts={tagCounts}
				tags={allTags}
			/>

			<Divider />

			<div className="screen-line-before screen-line-after relative py-4">
				<div className="pointer-events-none absolute inset-0 -z-1 grid grid-cols-1 gap-4 max-sm:hidden sm:grid-cols-2">
					<div className="border-edge border-r" />
					<div className="border-edge border-l" />
				</div>

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					{articles.map((post: Post) => (
						<ArticleItem article={post} key={post.slug} />
					))}
				</div>
			</div>

			<div className="h-8" />
		</div>
	);
};

export default BlogPage;
