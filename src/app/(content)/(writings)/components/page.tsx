import { CheckIcon, InfoIcon } from '@phosphor-icons/react/ssr';
import type { Metadata } from 'next';
import { cache } from 'react';
import { AnimatedSpan, Terminal, TypingAnimation } from '@/components/animations/Terminal';
import { ReactIcon } from '@/components/stack/React';
import { TailwindIcon } from '@/components/stack/Tailwind';
import { TypeScriptIcon } from '@/components/stack/TypeScript';
import { Badge } from '@/components/ui/Badge';
import { Divider } from '@/components/ui/Divider';
import { TextAnimate } from '@/components/ui/TextAnimate';
import { ArticleItem } from '@/features/(homepage)/9_articles/ArticleItem';
import { TagsFilter } from '@/features/(writings)/TagsFilter';
import { getPostsByCategory } from '@/lib/blog/posts';
import { dayjs } from '@/lib/dayjs';
import { openGraphImage } from '@/lib/open-graph';

const getCachedPosts = cache(() =>
	getPostsByCategory('components').sort((a, b) => dayjs(b.metadata.createdAt).diff(dayjs(a.metadata.createdAt)))
);

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
	const selectedTag = tag?.toLowerCase();

	const allComponents = getCachedPosts();

	const tagCounts: Record<string, number> = {
		Tout: allComponents.length,
	};

	for (const post of allComponents) {
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

	const components =
		!selectedTag || selectedTag === 'tout'
			? allComponents
			: allComponents.filter((article) => article.metadata.tags?.some((t) => t.toLowerCase() === selectedTag));

	return (
		<div className="min-h-svh">
			<div className="screen-line-before screen-line-after px-3">
				<h1 className="font-semibold text-3xl sm:text-4xl">
					<TextAnimate animation="slideLeft" by="character" delay={0.2}>
						Composants React réutilisables
					</TextAnimate>
				</h1>
			</div>

			<Terminal className="screen-line-before screen-line-after">
				<TypingAnimation className="text-xs sm:text-sm">
					&gt; pnpm dlx shadcn@latest add @envindavsorg/composant
				</TypingAnimation>
				<AnimatedSpan className="mt-2 flex items-center gap-x-2 text-xs sm:text-sm">
					<CheckIcon className="size-3 text-green-500" weight="bold" />
					<span>Vérification du registre ...</span>
				</AnimatedSpan>
				<AnimatedSpan className="mt-2 flex items-center gap-x-2 text-xs sm:text-sm">
					<CheckIcon className="size-3 text-green-500" weight="bold" />
					<span>Installation de votre composant ...</span>
				</AnimatedSpan>
				<AnimatedSpan className="mt-2 flex flex-col gap-y-1 text-xs sm:text-sm">
					<div className="flex items-center gap-x-2 text-blue-500">
						<InfoIcon className="size-3" weight="bold" />
						<span>1 fichier crée :</span>
					</div>
					<span className="pl-4 text-muted-foreground">- components/votre-composant.tsx</span>
				</AnimatedSpan>
			</Terminal>

			<div className="screen-line-after p-3">
				<TextAnimate animation="slideUp" as="p" by="word" delay={0.4}>
					Accélérez vos développements avec une collection complète de composants et hooks React optimisés, conçus pour
					des applications modernes et performantes.
				</TextAnimate>

				<TextAnimate animation="slideUp" as="p" by="word" className="mt-3" delay={0.4}>
					Chaque article est le fruit d'une expérience concrète, d'un bug résolu ou d'une technique apprise.
				</TextAnimate>

				<TextAnimate animation="slideUp" as="p" by="word" className="mt-3" delay={0.5} themed>
					Compatibles App Router, Server Components et Server Actions. Intégration transparente avec les dernières
					fonctionnalités de Next.js 16.
				</TextAnimate>
			</div>

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

			<TagsFilter selectedTag={selectedTag || 'Tout'} tagCounts={tagCounts} tags={allTags} />

			<Divider />

			<div className="screen-line-before screen-line-after relative py-4">
				<div className="pointer-events-none absolute inset-0 -z-1 grid grid-cols-1 gap-4 max-sm:hidden sm:grid-cols-2">
					<div className="border-edge border-r" />
					<div className="border-edge border-l" />
				</div>

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					{components.map((component: Post) => (
						<ArticleItem article={component} key={component.slug} />
					))}
				</div>
			</div>

			<div className="h-8" />
		</div>
	);
};

export default ComponentsPage;
