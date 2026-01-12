import type { Metadata } from 'next';
import { PostItem } from '@/components/blog/components/PostItem';
import { TagsFilter } from '@/components/blog/components/TagsFilter';
import { WritingsHeading } from '@/components/features/writings/Heading';
import { WritingsTerminal } from '@/components/features/writings/Terminal';
import { ReactIcon } from '@/components/icons/content/React';
import { TailwindIcon } from '@/components/icons/content/Tailwind';
import { TypeScriptIcon } from '@/components/icons/content/TypeScript';
import { Badge } from '@/components/ui/Badge';
import { Divider } from '@/components/ui/Divider';
import { getPostsByCategory } from '@/lib/blog/posts';
import { dayjs } from '@/lib/dayjs';
import { openGraphImage } from '@/lib/open-graph';

export const generateMetadata = async (): Promise<Metadata> =>
	openGraphImage({
		title: 'Composants React',
		description: 'Ma collection de snippets React réutilisables dans tous vos projets.',
		ogImageParams: {
			type: 'components',
			title: 'Composants React',
			description: 'Ma collection de snippets React réutilisables dans tous vos projets.',
		},
	});

type ComponentsPageProps = Readonly<{
	searchParams: Promise<{
		tag?: string;
	}>;
}>;

const ComponentsPage = async ({ searchParams }: Readonly<ComponentsPageProps>) => {
	const { tag } = await searchParams;
	const selectedTag = tag?.toLowerCase() || 'Tout';

	const allComponents: PostItem[] = getPostsByCategory('components').sort(
		(a: PostItem, b: PostItem) => dayjs(b.metadata.createdAt).diff(dayjs(a.metadata.createdAt))
	);

	const tagCounts: Record<string, number> = {};
	for (const post of allComponents) {
		for (const tagName of post.metadata.tags || []) {
			tagCounts[tagName] = (tagCounts[tagName] || 0) + 1;
		}
	}

	const sortedTags = Object.keys(tagCounts).sort();
	const allTags = ['Tout', ...sortedTags];
	const finalTagCounts = {
		Tout: allComponents.length,
		...tagCounts,
	};

	const components =
		selectedTag === 'Tout'
			? allComponents
			: allComponents.filter((article: PostItem) =>
					article.metadata.tags?.some((tagName) => tagName.toLowerCase() === selectedTag)
				);

	return (
		<div className="min-h-svh">
			<WritingsTerminal />

			<WritingsHeading
				description="Accélérez vos développements avec une collection complète de
					composants et hooks React optimisés, conçus pour des
					applications modernes et performantes. Compatibles App
					Router, Server Components et Server Actions. Intégration
					transparente avec les dernières fonctionnalités de Next.js
					16."
				title="Composants React"
			/>

			<div className="screen-line-after px-3 py-2">
				<div className="flex flex-wrap items-center gap-3">
					<Badge variant="secondary">
						<ReactIcon />
						<span className="leading-none">React 19+</span>
					</Badge>
					<Badge variant="secondary">
						<TypeScriptIcon />
						<span className="leading-none">TypeScript 5+</span>
					</Badge>
					<Badge variant="secondary">
						<TailwindIcon />
						<span className="leading-none">Tailwind 4+</span>
					</Badge>
				</div>
			</div>

			<TagsFilter selectedTag={selectedTag} tagCounts={finalTagCounts} tags={allTags} />

			<Divider />

			<div className="relative">
				<div className="absolute inset-0 -z-1 grid grid-cols-1 gap-4 max-sm:hidden sm:grid-cols-2">
					<div className="border-edge border-r" />
					<div className="border-edge border-l" />
				</div>

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					{components
						.slice()
						.sort((a, b) => dayjs(b.metadata.createdAt).diff(dayjs(a.metadata.createdAt)))
						.map((post: PostItem, idx: number) => (
							<PostItem key={post.slug} post={post} shouldPreloadImage={idx <= 4} />
						))}
				</div>
			</div>

			<Divider />
		</div>
	);
};

export default ComponentsPage;
