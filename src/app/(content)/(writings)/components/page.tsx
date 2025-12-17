import { CheckIcon, InfoIcon } from '@phosphor-icons/react/ssr';
import type { Metadata } from 'next';
import {
	AnimatedSpan,
	Terminal,
	TypingAnimation,
} from '@/components/animations/Terminal';
import { Post } from '@/components/blog/components/Post';
import { TagsFilter } from '@/components/blog/components/TagsFilter';
import { ReactIcon } from '@/components/icons/content/React';
import { TailwindIcon } from '@/components/icons/content/Tailwind';
import { TypeScriptIcon } from '@/components/icons/content/TypeScript';
import { Badge } from '@/components/ui/Badge';
import { getPostsByCategory } from '@/lib/blog/posts';
import { dayjs } from '@/lib/dayjs';
import { openGraphImage } from '@/lib/open-graph';

export const generateMetadata = async (): Promise<Metadata> =>
	openGraphImage({
		title: 'Composants React',
		description: 'Ma collection de snippets React réutilisables.',
		ogImageParams: {
			type: 'components',
			title: 'Composants React',
			description: 'Ma collection de snippets React réutilisables.',
		},
	});

const metadata: Metadata = {
	title: 'Composants React',
	description:
		'Ma collection de snippets React réutilisables pour accélérer le développement de vos projets.',
};

type ComponentsPageProps = {
	searchParams: Promise<{
		tag?: string;
	}>;
};

const ComponentsPage = async ({
	searchParams,
}: Readonly<ComponentsPageProps>) => {
	const resolvedSearchParams = await searchParams;
	const components: Post[] = getPostsByCategory('components');

	const allTags = [
		'Tous les composants',
		...Array.from(
			new Set(
				components.flatMap(
					(article: Post) => article.metadata.tags || [],
				),
			),
		).sort(),
	];
	const selectedTag = resolvedSearchParams.tag || 'Tous les composants';
	const filteredComponents =
		selectedTag === 'Tous les composants'
			? components
			: components.filter((article: Post) =>
					article.metadata.tags?.includes(selectedTag),
				);

	const tagCounts = allTags.reduce(
		(acc, tag) => {
			if (tag === 'Tous les composants') {
				acc[tag] = components.length;
			} else {
				acc[tag] = components.filter((article: Post) =>
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
					{String(metadata.title)}
				</h1>
			</div>

			<Terminal>
				<TypingAnimation className="text-xs sm:text-sm">
					&gt; pnpm dlx shadcn@latest add @envindavsorg/composant
				</TypingAnimation>
				<AnimatedSpan className="mt-2 flex items-center gap-x-2 text-xs sm:text-sm">
					<CheckIcon
						className="size-3 text-green-500"
						weight="bold"
					/>
					<span>Vérification du registre ...</span>
				</AnimatedSpan>
				<AnimatedSpan className="mt-2 flex items-center gap-x-2 text-xs sm:text-sm">
					<CheckIcon
						className="size-3 text-green-500"
						weight="bold"
					/>
					<span>Installation de votre composant ...</span>
				</AnimatedSpan>
				<AnimatedSpan className="mt-2 flex flex-col gap-y-1 text-xs sm:text-sm">
					<div className="flex items-center gap-x-2 text-blue-500">
						<InfoIcon className="size-3" weight="bold" />
						<span>1 fichier crée :</span>
					</div>
					<span className="pl-4 text-muted-foreground">
						- components/votre-composant.tsx
					</span>
				</AnimatedSpan>
				<TypingAnimation className="mt-4 font-semibold text-green-500 text-xs sm:text-sm">
					Utilisez mes composants dans votre projet !
				</TypingAnimation>
			</Terminal>

			<div className="screen-line-after border-edge border-t p-4">
				<p className="font-mono text-muted-foreground text-sm">
					Accélérez vos développements avec une collection complète de
					composants et hooks React optimisés, conçus pour des
					applications modernes et performantes. Compatibles{' '}
					<span className="font-medium">App Router</span>,
					<span className="font-medium">Server Components</span> et{' '}
					<span className="font-medium">Server Actions</span>.
					Intégration transparente avec les dernières fonctionnalités
					de <span className="font-medium">Next.js 15+</span>.
				</p>
				<div className="mt-3 flex flex-wrap items-center gap-3">
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
				<div className="-z-1 absolute inset-0 grid grid-cols-1 gap-4 max-sm:hidden sm:grid-cols-2">
					<div className="border-edge border-r" />
					<div className="border-edge border-l" />
				</div>

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					{filteredComponents
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

export default ComponentsPage;
