import type { Metadata } from 'next';
import { TagsFilter } from '@/components/blog/components/TagsFilter';
import { UtilsItem } from '@/components/features/tools/UtilsItem';
import { Divider } from '@/components/ui/Divider';
import { Prose } from '@/components/ui/Typography';
import { getPostsByCategory } from '@/lib/blog/posts';
import { metadata } from '@/lib/blog/utils/metadata';
import { dayjs } from '@/lib/dayjs';
import { openGraphImage } from '@/lib/open-graph';

const { title, description, type } = metadata;

export const generateMetadata = async (): Promise<Metadata> =>
	openGraphImage({
		title,
		description,
		ogImageParams: { type, title, description },
	});

type UtilsPageProps = Readonly<{
	searchParams: Promise<{
		tag?: string;
	}>;
}>;

const UtilsPage = async ({ searchParams }: UtilsPageProps) => {
	const { tag } = await searchParams;
	const selectedTag = tag?.toLowerCase() || 'Tout';

	const allPosts: Post[] = getPostsByCategory(type).sort((a: Post, b: Post) =>
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
			<div className="screen-line-after px-3">
				<h1 className="font-semibold text-2xl sm:text-3xl">
					{metadata.title}{' '}
					<sup className="font-normal text-sm text-theme">
						{allPosts.length}
					</sup>
				</h1>
			</div>

			<div className="screen-line-after px-3 py-1.5">
				<Prose>{metadata.description}</Prose>
			</div>

			<TagsFilter
				selectedTag={selectedTag}
				tagCounts={finalTagCounts}
				tags={allTags}
			/>

			<Divider />

			{utils.map((post: Post) => (
				<UtilsItem key={post.slug} post={post} />
			))}
		</>
	);
};

export default UtilsPage;
