import { getTableOfContents } from 'fumadocs-core/content/toc';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { BlogPosting as PageSchema, WithContext } from 'schema-dts';
import { PixelHeading } from '@/components/blocks/PixelHeading';
import { MDX } from '@/components/markdown/mdx';
import { Badge } from '@/components/primitives/Badge';
import { Divider } from '@/components/primitives/Divider';
import { Prose } from '@/components/primitives/Typography';
import GLOBAL_DATA from '@/data/global';
import {
	type Content,
	getContentByCategory,
	getContentBySlug,
} from '@/lib/content';
import { dayjs } from '@/lib/functions';
import { buildContentMetadata } from '@/lib/open-graph';
import { TableOfContents } from '../../_components/TableOfContents';
import { TopNav } from '../../_components/TopNav';

interface Props {
	params: Promise<{
		slug: string;
	}>;
}

export const generateStaticParams = async () => {
	const posts = getContentByCategory('components');
	return posts.map((post) => ({
		slug: post.slug,
	}));
};

export const generateMetadata = async ({
	params,
}: Props): Promise<Metadata> => {
	const slug = (await params).slug;
	const post = getContentBySlug(slug);

	if (!post) {
		return notFound();
	}

	const { title, description } = post.metadata;
	const postUrl = `/components/${post.slug}`;

	const og = buildContentMetadata({
		title,
		description,
		ogImageParams: {
			type: 'componentsArticle',
			title,
			description,
		},
	});

	return {
		...og,
		alternates: {
			canonical: postUrl,
		},
	};
};

const getPageJsonLd = (post: Content): WithContext<PageSchema> => ({
	'@context': 'https://schema.org',
	'@type': 'BlogPosting',
	headline: post.metadata.title,
	description: post.metadata.description,
	image:
		post.metadata.image ||
		`/og/simple?title=${encodeURIComponent(post.metadata.title)}`,
	url: `https://cuzeacflorin.fr/components/${post.slug}`,
	datePublished: dayjs(post.metadata.createdAt).toISOString(),
	dateModified: dayjs(post.metadata.updatedAt).toISOString(),
	author: {
		'@type': 'Person',
		name: GLOBAL_DATA.USER.firstName,
		identifier: GLOBAL_DATA.USER.username,
		image: GLOBAL_DATA.USER.avatar,
	},
});

const Page = async ({ params }: Props) => {
	const slug = (await params).slug;
	const component = getContentBySlug(slug);

	if (!component) {
		notFound();
	}

	const toc = getTableOfContents(component.content);
	const components = getContentByCategory('components');

	return (
		<>
			<script
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(getPageJsonLd(component)).replace(
						/</g,
						'\\u003c'
					),
				}}
				type="application/ld+json"
			/>

			<TopNav
				description="tous les composants"
				item={component}
				items={components}
				slug={slug}
				useLlm={false}
			/>

			<div className="screen-line-after flex w-full items-center justify-between gap-x-3 px-2 sm:px-4">
				<PixelHeading
					autoPlay
					className="text-balance font-extrabold text-[28px] lowercase leading-snug sm:text-4xl"
					mode="multi"
				>
					{component.metadata.title}
				</PixelHeading>
			</div>

			<div className="screen-line-after flex items-center justify-between gap-2 px-2 py-2 sm:gap-4 sm:px-4">
				<span className="text-theme">---</span>
				<div className="flex items-center gap-2 sm:gap-4">
					<Badge className="lowercase">{component.metadata.author}</Badge>
					<Badge className="lowercase max-sm:hidden">
						{dayjs(component.metadata.createdAt).format('dddd, DD MMM YYYY')}
					</Badge>
					{component.metadata.tags && (
						<Badge className="lowercase">{component.metadata.tags[0]}</Badge>
					)}
				</div>
			</div>

			<div className="screen-line-after px-2 py-2 sm:px-4">
				<Prose className="lowercase">
					-- {component.metadata.description} --
				</Prose>
			</div>

			<div className="screen-line-after px-2 py-2 sm:px-4">
				<TableOfContents items={toc} />
			</div>

			<Prose className="p-4 px-2 lowercase sm:px-4">
				<MDX code={component.content} />
			</Prose>

			<Divider border={false} />
		</>
	);
};

export default Page;
