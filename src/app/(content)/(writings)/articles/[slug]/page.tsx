import { getTableOfContents } from 'fumadocs-core/content/toc';
import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { BlogPosting as PageSchema, WithContext } from 'schema-dts';
import { PixelHeading } from '@/components/blocks/PixelHeading';
import { MDX } from '@/components/markdown/mdx';
import { Badge } from '@/components/primitives/Badge';
import { Divider } from '@/components/primitives/Divider';
import { Prose } from '@/components/primitives/Typography';
import GLOBAL_DATA from '@/content/data/global';
import {
	type Content,
	getAllContent,
	getContentByCategory,
	getContentBySlug,
} from '@/lib/content';
import { buildContentMetadata } from '@/lib/open-graph';
import { dayjs } from '@/lib/utils';
import { TableOfContents } from '../../_components/TableOfContents';
import { TopNav } from '../../_components/TopNav';

interface Props {
	params: Promise<{ slug: string }>;
}

export const generateStaticParams = async () => {
	const posts = getAllContent();
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
	const og = buildContentMetadata({
		title,
		description,
		ogImageParams: {
			type: 'blogArticle',
			title,
			description,
		},
	});

	return {
		...og,
		alternates: {
			canonical: `https://cuzeacflorin.fr/${post.metadata.category}/${slug}`,
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
	url: `https://cuzeacflorin.fr/${post.metadata.category}`,
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
	const article = getContentBySlug(slug);

	if (!article) {
		notFound();
	}

	const toc = getTableOfContents(article.content);
	const articles = getContentByCategory(article?.metadata.category!);

	return (
		<>
			<script
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(getPageJsonLd(article)).replace(
						/</g,
						'\\u003c'
					),
				}}
				type="application/ld+json"
			/>

			<TopNav
				description="tous les articles"
				item={article}
				items={articles}
				slug={slug}
			/>

			<div className="screen-line-after p-2 sm:p-4">
				<figure className="relative [&_img]:rounded-lg">
					{article.metadata.image && (
						<Image
							alt={article.metadata.title}
							height={630}
							quality={75}
							sizes="(max-width: 640px) 100vw, 50vw"
							src={article.metadata.image}
							width={1200}
						/>
					)}
					<div className="pointer-events-none absolute inset-0 rounded-lg ring-1 ring-black/10 ring-inset dark:ring-white/10" />
				</figure>
			</div>

			<div className="screen-line-after flex w-full items-center justify-between gap-x-3 px-2 sm:px-4">
				<PixelHeading
					autoPlay
					className="text-balance font-extrabold text-[28px] lowercase leading-snug sm:text-4xl"
					mode="multi"
				>
					{article.metadata.title}
				</PixelHeading>
			</div>

			<div className="screen-line-after flex items-center justify-between gap-2 px-2 py-2 sm:gap-4 sm:px-4">
				<span className="text-theme">---</span>
				<div className="flex items-center gap-2 sm:gap-4">
					<Badge className="lowercase">{article.metadata.author}</Badge>
					<Badge className="lowercase max-sm:hidden">
						{dayjs(article.metadata.createdAt).format('dddd, DD MMM YYYY')}
					</Badge>
					<Badge className="lowercase">
						{article.reading?.time} de lecture
					</Badge>
					<Badge className="lowercase">{article.reading?.words} mots</Badge>
				</div>
			</div>

			<div className="screen-line-after px-2 py-2 sm:px-4">
				<Prose className="lowercase">
					-- {article.metadata.description} --
				</Prose>
			</div>

			<div className="screen-line-after px-2 py-2 sm:px-4">
				<TableOfContents items={toc} />
			</div>

			<Prose className="p-4 px-2 lowercase sm:px-4">
				<MDX code={article.content} />
			</Prose>

			<Divider border={false} />
		</>
	);
};

export default Page;
