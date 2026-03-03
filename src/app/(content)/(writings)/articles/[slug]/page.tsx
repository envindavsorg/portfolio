import { getTableOfContents } from 'fumadocs-core/content/toc';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { BlogPosting as PageSchema, WithContext } from 'schema-dts';
import { ArticleNavBar } from '@/components/blog/ArticleNavBar';
import { ArticleTitle } from '@/components/blog/ArticleTitle';
import { TableOfContents } from '@/components/blog/toc/TableOfContents';
import { MDX } from '@/components/markdown/mdx';
import GLOBAL_DATA from '@/data/global';
import { type Content, getContentByCategory, getContentBySlug } from '@/lib/content';
import { dayjs } from '@/lib/functions';
import { buildContentMetadata } from '@/lib/open-graph';

interface Props {
	params: Promise<{ slug: string }>;
}

export const generateStaticParams = async () => {
	const articles = getContentByCategory('articles');
	return articles.map(({ slug }) => ({ slug }));
};

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
	const { slug } = await params;
	const article = getContentBySlug(slug);
	if (!article) {
		return notFound();
	}

	const { title, description, category } = article.metadata;
	return {
		...buildContentMetadata({
			title,
			description,
			ogImageParams: { type: 'blogArticle', title, description },
		}),
		alternates: {
			canonical: `https://cuzeacflorin.fr/${category}/${slug}`,
		},
	};
};

const getPageJsonLd = ({ metadata, slug }: Content): WithContext<PageSchema> => ({
	'@context': 'https://schema.org',
	'@type': 'BlogPosting',
	headline: metadata.title,
	description: metadata.description,
	image: metadata.image || `/og/simple?title=${encodeURIComponent(metadata.title)}`,
	url: `https://cuzeacflorin.fr/${metadata.category}/${slug}`,
	datePublished: dayjs(metadata.createdAt).toISOString(),
	dateModified: dayjs(metadata.updatedAt).toISOString(),
	author: {
		'@type': 'Person',
		name: GLOBAL_DATA.USER.firstName,
		identifier: GLOBAL_DATA.USER.username,
		image: GLOBAL_DATA.USER.avatar,
	},
});

const Page = async ({ params }: Props) => {
	const { slug } = await params;
	const article = getContentBySlug(slug);

	if (!article) {
		notFound();
	}

	const { content, metadata } = article;
	const toc = getTableOfContents(content);
	const articles = metadata.category ? getContentByCategory(metadata.category) : [];

	return (
		<>
			<script
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(getPageJsonLd(article)).replace(/</g, '\\u003c'),
				}}
				type="application/ld+json"
			/>
			<ArticleNavBar description="tous les articles" item={article} items={articles} slug={slug} />
			<ArticleTitle title={metadata.title} />
			<TableOfContents items={toc} />
			<MDX code={content} />
		</>
	);
};

export default Page;
