import type { Metadata } from 'next';
import { cache } from 'react';
import { ToolItem } from '@/app/(content)/(root)/_components/tools/ToolItem';
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
import { type Content, getContentByCategory } from '@/lib/content';
import { dayjs } from '@/lib/functions';
import { buildContentMetadata } from '@/lib/open-graph';

const getCachedUtils = cache(() =>
	getContentByCategory('utils').sort((a, b) =>
		dayjs(b.metadata.createdAt).diff(dayjs(a.metadata.createdAt))
	)
);

export const generateMetadata = async (): Promise<Metadata> =>
	buildContentMetadata({
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
	const allUtils = getCachedUtils();
	const { tags, tagCounts, filtered, selectedTag } = filterByTag(allUtils, tag);

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
							<BreadcrumbPage>outils</BreadcrumbPage>
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
					suite d'outils web
				</PixelHeading>
			</div>

			<PanelContent className="screen-line-after">
				<Prose>
					-- optimisez votre workflow avec cette <i>suite d'outils web</i>{' '}
					gratuits pour développeurs --
				</Prose>
				<Prose>
					-- tous les outils sont <span>open-source</span> et conçus pour vous
					aider à gagner du temps et à améliorer votre productivité --
				</Prose>
			</PanelContent>

			<TagsFilter selectedTag={selectedTag} tagCounts={tagCounts} tags={tags} />

			<Divider after={false} before={false} border={false} type="half" />

			{filtered.map((util: Content) => (
				<ToolItem key={util.slug} tool={util} />
			))}
		</div>
	);
};

export default UtilsPage;
