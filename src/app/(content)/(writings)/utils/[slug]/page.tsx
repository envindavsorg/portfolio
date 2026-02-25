import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { BlogPosting as PageSchema, WithContext } from 'schema-dts';
import { PixelHeading } from '@/components/blocks/PixelHeading';
import { MDX } from '@/components/markdown/mdx';
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
import { TopNav } from '../../_components/TopNav';

interface Props {
	params: Promise<{
		slug: string;
	}>;
}

export const generateStaticParams = async () => {
	const posts: Content[] = getContentByCategory('utils');
	return posts.map(({ slug }) => ({ slug }));
};

export const generateMetadata = async ({
	params,
}: Props): Promise<Metadata> => {
	const { slug } = await params;
	const post = getContentBySlug(slug);

	if (!post) {
		return notFound();
	}

	const { title, description } = post.metadata;
	const postUrl = `/utils/${post.slug}`;

	const og = buildContentMetadata({
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

const getPageJsonLd = (post: Content): WithContext<PageSchema> => ({
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
	const util = getContentBySlug(slug);

	if (!util) {
		notFound();
	}

	const utils = getContentByCategory('utils');

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
				useLlm={false}
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
