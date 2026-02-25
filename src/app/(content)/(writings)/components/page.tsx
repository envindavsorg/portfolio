import { CheckIcon, InfoIcon } from '@phosphor-icons/react/ssr';
import type { Metadata } from 'next';
import { cache } from 'react';
import { ArticleItem } from '@/app/(content)/(root)/_components/articles/ArticleItem';
import { filterByTag } from '@/app/(content)/(writings)/_components/filter/filterByTag';
import { TagsFilter } from '@/app/(content)/(writings)/_components/filter/TagsFilter';
import { PixelHeading } from '@/components/blocks/PixelHeading';
import {
	AnimatedSpan,
	Terminal,
	TypingAnimation,
} from '@/components/blocks/Terminal';
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/primitives/Breadcrumb';
import { Divider } from '@/components/primitives/Divider';
import { PanelContent } from '@/components/primitives/Panel';
import { Prose } from '@/components/primitives/Typography';
import { type Content, getContentByCategory } from '@/lib/content';
import { buildContentMetadata } from '@/lib/open-graph';
import { dayjs } from '@/lib/utils';

const getCachedComponents = cache(() =>
	getContentByCategory('components').sort((a, b) =>
		dayjs(b.metadata.createdAt).diff(dayjs(a.metadata.createdAt))
	)
);

export const generateMetadata = async (): Promise<Metadata> =>
	buildContentMetadata({
		title: 'Composants React',
		description:
			'Ma collection de snippets React réutilisables dans tous vos projets.',
		ogImageParams: {
			type: 'components',
			title: 'Composants React',
			description:
				'Ma collection de snippets React réutilisables dans tous vos projets.',
		},
	});

type ComponentsPageProps = Readonly<{
	searchParams: Promise<{
		tag?: string;
	}>;
}>;

const ComponentsPage = async ({
	searchParams,
}: Readonly<ComponentsPageProps>) => {
	const { tag } = await searchParams;
	const allComponents = getCachedComponents();
	const { tags, tagCounts, filtered, selectedTag } = filterByTag(
		allComponents,
		tag
	);

	return (
		<div className="screen-line-after min-h-svh">
			<div className="screen-line-after px-3 py-0.5">
				<Breadcrumb>
					<BreadcrumbList>
						<BreadcrumbItem>
							<BreadcrumbLink href="/">accueil</BreadcrumbLink>
						</BreadcrumbItem>
						<BreadcrumbSeparator />
						<BreadcrumbItem>
							<BreadcrumbPage>composants</BreadcrumbPage>
						</BreadcrumbItem>
					</BreadcrumbList>
				</Breadcrumb>
			</div>

			<Divider before={false} border={false} type="half" />

			<div className="flex w-full items-center justify-between gap-x-3 px-3">
				<PixelHeading
					autoPlay
					className="text-balance font-extrabold text-[28px] leading-snug sm:text-4xl"
					mode="multi"
				>
					composants React réutilisables
				</PixelHeading>
			</div>

			<Terminal className="screen-line-before text-xs sm:text-sm">
				<TypingAnimation className="text-theme">
					&gt; pnpm dlx shadcn@latest add @envindavsorg/composant
				</TypingAnimation>
				<AnimatedSpan className="mt-2 flex items-center gap-x-2">
					<CheckIcon className="size-3 text-green-500" />
					<span>Vérification du registre ...</span>
				</AnimatedSpan>
				<AnimatedSpan className="mt-2 flex items-center gap-x-2">
					<CheckIcon className="size-3 text-green-500" />
					<span>Installation de votre composant ...</span>
				</AnimatedSpan>
				<AnimatedSpan className="mt-2 flex flex-col gap-y-1">
					<div className="flex items-center gap-x-2 text-green-500">
						<InfoIcon className="size-3" />
						<span>1 fichier crée :</span>
					</div>
					<span className="pl-4 text-muted-foreground">
						- components/ui/composant.tsx
					</span>
				</AnimatedSpan>
			</Terminal>

			<PanelContent className="screen-line-after screen-line-before">
				<Prose>
					-- accélérez vos développements avec une{' '}
					<i>collection complète de composants et hooks React optimisés</i>,
					conçus pour des applications modernes et performantes. --
				</Prose>
				<Prose>
					-- compatibles <span>App Router</span>, <span>Server Components</span>{' '}
					et <span>Server Actions</span>. Intégration transparente avec les
					dernières fonctionnalités de <i>Next.js 16</i> --
				</Prose>
			</PanelContent>

			<TagsFilter selectedTag={selectedTag} tagCounts={tagCounts} tags={tags} />

			<Divider after={false} before={false} border={false} type="half" />

			<div className="screen-line-before screen-line-after relative py-4">
				<div className="pointer-events-none absolute inset-0 -z-1 grid grid-cols-1 gap-4 max-sm:hidden sm:grid-cols-2">
					<div className="border-edge border-r" />
					<div className="border-edge border-l" />
				</div>

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					{filtered.map((component: Content) => (
						<ArticleItem article={component} key={component.slug} />
					))}
				</div>
			</div>
		</div>
	);
};

export default ComponentsPage;
