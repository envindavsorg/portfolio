import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { BlogPosting as PageSchema, WithContext } from 'schema-dts';
import { IsNew } from '@/components/blog/components/IsNew';
import { TopBar } from '@/components/blog/components/TopBar';
import { MDX } from '@/components/blog/markdown/mdx';
import { Divider } from '@/components/ui/Divider';
import { Prose } from '@/components/ui/Typography';
import { SITE_INFO } from '@/config/site';
import { USER } from '@/content/user';
import { getPostBySlug, getPostsByCategory } from '@/lib/blog/posts';
import { metadata } from '@/lib/blog/utils/metadata';
import { dayjs } from '@/lib/dayjs';
import { openGraphImage } from '@/lib/open-graph';

const { type } = metadata;

type Props = {
	params: Promise<{
		slug: string;
	}>;
};

export const generateStaticParams = async () => {
	const posts: Post[] = getPostsByCategory('utils');
	return posts.map(({ slug }) => ({ slug }));
};

export const generateMetadata = async ({
	params,
}: Props): Promise<Metadata> => {
	const { slug } = await params;
	const post = getPostBySlug(slug);

	if (!post) {
		return notFound();
	}

	const { title, description } = post.metadata;
	const postUrl = `/utils/${post.slug}`;

	const og = openGraphImage({
		title,
		description,
		ogImageParams: { type: 'utilsArticle', title, description },
	});

	return {
		...og,
		alternates: {
			canonical: postUrl,
		},
	};
};

const getPageJsonLd = (post: Post): WithContext<PageSchema> => ({
	'@context': 'https://schema.org',
	'@type': 'BlogPosting',
	headline: post.metadata.title,
	description: post.metadata.description,
	image:
		post.metadata.imageLight ||
		`/og/simple?title=${encodeURIComponent(post.metadata.title)}`,
	url: `${SITE_INFO.url}/utils/${post.slug}`,
	datePublished: dayjs(post.metadata.createdAt).toISOString(),
	dateModified: dayjs(post.metadata.updatedAt).toISOString(),
	author: {
		'@type': 'Person',
		name: USER.displayName,
		identifier: USER.username,
		image: USER.avatar,
	},
});

const Page = async ({ params }: Props) => {
	const { slug } = await params;
	const post = getPostBySlug(slug);

	if (!post) {
		notFound();
	}

	const { category } = post.metadata;
	if (category !== type) {
		notFound();
	}

	return (
		<>
			<script
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(getPageJsonLd(post)).replace(
						/</g,
						'\\u003c',
					),
				}}
				type="application/ld+json"
			/>

			<TopBar
				type="utils"
				slug={slug}
				baseUrl="/utils"
				postSlug={post.slug}
				title="Tous les outils"
			/>

			<Divider />

			<div className="screen-line-after flex items-center justify-between px-3">
				<h1 className="font-semibold text-2xl sm:text-3xl">
					{post.metadata.title}
				</h1>
				{post.metadata.new && <IsNew />}
			</div>

			<div className="px-3 py-1.5">
				<Prose>{post.metadata.description}</Prose>
			</div>

			<Prose className="px-3 pb-6">
				<MDX code={post.content} />
			</Prose>
		</>
	);
};

export default Page;
