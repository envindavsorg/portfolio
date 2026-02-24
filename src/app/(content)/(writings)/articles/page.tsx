import type { Metadata } from 'next';
import { cache } from 'react';
import { ArticleItem } from '@/app/(content)/(root)/_components/articles/ArticleItem';
import { filterByTag } from '@/app/(content)/(writings)/_components/filter/filterByTag';
import { TagsFilter } from '@/app/(content)/(writings)/_components/filter/TagsFilter';
import { PixelHeading } from '@/components/blocks/PixelHeading';
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
import { getPostsByCategory } from '@/lib/blog/posts';
import { openGraphImage } from '@/lib/open-graph';
import { dayjs } from '@/lib/utils';

const getCachedArticles = cache(() =>
	getPostsByCategory('articles').sort((a, b) =>
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

const ArticlesPage = async ({ searchParams }: BlogPageProps) => {
	const { tag } = await searchParams;
	const allArticles = getCachedArticles();
	const { tags, tagCounts, filtered, selectedTag } = filterByTag(
		allArticles,
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
							<BreadcrumbPage>articles de blog</BreadcrumbPage>
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
					mes articles de blog
				</PixelHeading>
			</div>

			<PanelContent className="screen-line-after screen-line-before">
				<Prose>
					-- retrouvez tous mes <span>articles de blog</span> où je partage mon
					expérience en développement web --
				</Prose>
				<Prose>
					-- j'y aborde les <i>bonnes pratiques</i>, les{' '}
					<i>patterns modernes</i>, les solutions aux problèmes techniques du
					quotidien, et mes découvertes sur l'écosystème <i>JavaScript</i> --
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
					{filtered.map((item) => (
						<ArticleItem article={item} key={item.slug} />
					))}
				</div>
			</div>
		</div>
	);
};

export default ArticlesPage;
