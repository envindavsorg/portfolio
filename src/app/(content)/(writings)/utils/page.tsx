import type { Metadata } from 'next';
import { cache } from 'react';
import { TextAnimate } from '@/components/text/TextAnimate';
import { Divider } from '@/components/primitives/Divider';
import { ToolItem } from '@/features/(navigation)/tools/ToolsItem';
import { TagsFilter } from '@/features/(writings)/TagsFilter';
import { getPostsByCategory } from '@/lib/blog/posts';
import { openGraphImage } from '@/lib/open-graph';
import { dayjs } from '@/lib/utils';

const getCachedPosts = cache(() =>
	getPostsByCategory('utils').sort((a, b) =>
		dayjs(b.metadata.createdAt).diff(dayjs(a.metadata.createdAt))
	)
);

export const generateMetadata = async (): Promise<Metadata> =>
	openGraphImage({
		title: 'Outils pour développeurs',
		description:
			"Optimisez votre workflow avec cette suite d'outils web gratuits pour développeurs.",
		ogImageParams: {
			type: 'utils',
			title: 'Outils pour développeurs',
			description:
				"Optimisez votre workflow avec cette suite d'outils web gratuits pour développeurs.",
		},
	});

type UtilsPageProps = Readonly<{
	searchParams: Promise<{
		tag?: string;
	}>;
}>;

const UtilsPage = async ({ searchParams }: UtilsPageProps) => {
	const { tag } = await searchParams;
	const selectedTag = tag?.toLowerCase();

	const allUtils = getCachedPosts();

	const tagCounts: Record<string, number> = {
		Tout: allUtils.length,
	};

	for (const post of allUtils) {
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

	const utils =
		!selectedTag || selectedTag === 'tout'
			? allUtils
			: allUtils.filter((article) =>
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
					Optimisez votre workflow avec cette suite d'outils web gratuits pour
					développeurs.
				</TextAnimate>

				<TextAnimate
					animation="slideUp"
					as="p"
					by="word"
					className="mt-3"
					delay={0.5}
					themed
				>
					Tous les outils sont open source et conçus pour vous aider à gagner du
					temps et à améliorer votre productivité.
				</TextAnimate>
			</div>

			<TagsFilter
				selectedTag={selectedTag || 'Tout'}
				tagCounts={tagCounts}
				tags={allTags}
			/>

			<Divider />

			{utils.map((util: Post) => (
				<ToolItem key={util.slug} post={util} />
			))}

			<div className="h-8" />
		</div>
	);
};

export default UtilsPage;
