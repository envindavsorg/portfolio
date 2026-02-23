import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { BlogPosting as PageSchema, WithContext } from 'schema-dts';
import { MDX } from '@/components/markdown/mdx';
import { Divider } from '@/components/primitives/Divider';
import { PixelHeading } from '@/components/text/PixelHeading';
import { Prose } from '@/components/text/Typography';
import GLOBAL_DATA from '@/content/data/global';
import { TopNav } from '@/features/(writings)/TopNav';
import { getPostBySlug, getPostsByCategory } from '@/lib/blog/posts';
import { openGraphImage } from '@/lib/open-graph';
import { dayjs } from '@/lib/utils';

interface Props {
	params: Promise<{
		slug: string;
	}>;
}

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
		post.metadata.image ||
		`/og/simple?title=${encodeURIComponent(post.metadata.title)}`,
	url: `https://cuzeacflorin.fr/utils/${post.slug}`,
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
	const { slug } = await params;
	const util = getPostBySlug(slug);

	if (!util) {
		notFound();
	}

	const utils = getPostsByCategory('utils');

	return (
		<>
			<script
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(getPageJsonLd(util)).replace(/</g, '\\u003c'),
				}}
				type="application/ld+json"
			/>

			<TopNav
				description="tous les composants"
				item={util}
				items={utils}
				slug={slug}
			/>

			<div className="screen-line-after flex w-full items-center justify-between gap-x-3 px-2 sm:px-4">
				<PixelHeading
					autoPlay
					className="text-balance font-extrabold text-[28px] lowercase leading-snug sm:text-4xl"
					mode="multi"
				>
					{util.metadata.title}
				</PixelHeading>
			</div>

			<div className="screen-line-after px-2 py-2 sm:px-4">
				<Prose className="lowercase">-- {util.metadata.description} --</Prose>
			</div>

			<Prose className="p-4 px-2 lowercase sm:px-4">
				<MDX code={util.content} />
			</Prose>

			<Divider border={false} />
		</>
	);
};

export default Page;
