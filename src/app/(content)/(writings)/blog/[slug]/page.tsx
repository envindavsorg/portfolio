import { getTableOfContents } from 'fumadocs-core/content/toc';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { BlogPosting as PageSchema, WithContext } from 'schema-dts';
import { MDX } from '@/components/markdown/mdx';
import { Badge } from '@/components/primitives/Badge';
import { Divider } from '@/components/primitives/Divider';
import { PixelHeading } from '@/components/text/PixelHeading';
import { Prose } from '@/components/text/Typography';
import GLOBAL_DATA from '@/content/data/global';
import { InlineToc } from '@/features/(writings)/InlineToc';
import { TopNav } from '@/features/(writings)/TopNav';
import {
	getAllPosts,
	getPostBySlug,
	getPostsByCategory,
} from '@/lib/blog/posts';
import { openGraphImage } from '@/lib/open-graph';
import { dayjs } from '@/lib/utils';

interface Props {
	params: Promise<{ slug: string }>;
}

export const generateStaticParams = async () => {
	const posts = getAllPosts();
	return posts.map((post) => ({
		slug: post.slug,
	}));
};

export const generateMetadata = async ({
	params,
}: Props): Promise<Metadata> => {
	const slug = (await params).slug;
	const post = getPostBySlug(slug);

	if (!post) {
		return notFound();
	}

	const { title, description } = post.metadata;
	const postUrl = getPostUrl(post);

	const og = openGraphImage({
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
			canonical: postUrl,
		},
	};
};

const getPostUrl = (post: Post) => {
	const isComponent = post.metadata.category === 'components';
	return isComponent ? `/components/${post.slug}` : `/blog/${post.slug}`;
};

const getPageJsonLd = (post: Post): WithContext<PageSchema> => ({
	'@context': 'https://schema.org',
	'@type': 'BlogPosting',
	headline: post.metadata.title,
	description: post.metadata.description,
	image:
		post.metadata.image ||
		`/og/simple?title=${encodeURIComponent(post.metadata.title)}`,
	url: `https://cuzeacflorin.fr${getPostUrl(post)}`,
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
	const article = getPostBySlug(slug);

	if (!article) {
		notFound();
	}

	const toc = getTableOfContents(article.content);
	const articles = getPostsByCategory('article').sort((a, b) =>
		dayjs(b.metadata.createdAt).diff(dayjs(a.metadata.createdAt))
	);

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
				path="/blog"
				slug={slug}
			/>

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
				<InlineToc items={toc} />
			</div>

			<Prose className="p-4 px-2 lowercase sm:px-4">
				<MDX code={article.content} />
			</Prose>

			<Divider border={false} />
		</>
	);
};

export default Page;
