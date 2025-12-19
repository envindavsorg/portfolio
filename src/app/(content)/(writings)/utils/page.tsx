import type { Metadata } from 'next';
import { TagsFilter } from '@/components/blog/components/TagsFilter';
import { UtilsItem } from '@/components/features/tools/UtilsItem';
import { WritingsHeading } from '@/components/features/writings/Heading';
import { Divider } from '@/components/ui/Divider';
import { getPostsByCategory } from '@/lib/blog/posts';
import { dayjs } from '@/lib/dayjs';
import { openGraphImage } from '@/lib/open-graph';

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
	const selectedTag = tag?.toLowerCase() || 'Tout';

	const allPosts: Post[] = getPostsByCategory('utils').sort(
		(a: Post, b: Post) =>
			dayjs(b.metadata.createdAt).diff(dayjs(a.metadata.createdAt)),
	);

	const tagCounts: Record<string, number> = {};
	for (const post of allPosts) {
		for (const tag of post.metadata.tags || []) {
			tagCounts[tag] = (tagCounts[tag] || 0) + 1;
		}
	}

	const sortedTags = Object.keys(tagCounts).sort();
	const allTags = ['Tout', ...sortedTags];
	const finalTagCounts = {
		Tout: allPosts.length,
		...tagCounts,
	};

	const utils =
		selectedTag === 'Tout'
			? allPosts
			: allPosts.filter((article: Post) =>
					article.metadata.tags?.some(
						(tag) => tag.toLowerCase() === selectedTag,
					),
				);

	return (
		<>
			<WritingsHeading
				title="Outils pour développeurs"
				description="Optimisez votre workflow avec cette suite d'outils web gratuits pour développeurs."
			/>

			<TagsFilter
				selectedTag={selectedTag}
				tagCounts={finalTagCounts}
				tags={allTags}
			/>

			<Divider className="screen-line-after" />

			{utils.map((post: Post) => (
				<UtilsItem key={post.slug} post={post} />
			))}
		</>
	);
};

export default UtilsPage;
