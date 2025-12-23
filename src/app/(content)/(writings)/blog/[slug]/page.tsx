import { ArrowLeftIcon, ArrowRightIcon } from '@phosphor-icons/react/ssr';
import { getTableOfContents } from 'fumadocs-core/content/toc';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { BlogPosting as PageSchema, WithContext } from 'schema-dts';
import { LLMCopyButtonWithViewOptions } from '@/components/blog/actions/post.action';
import { InlineToc } from '@/components/blog/components/InlineToc';
import { KeyboardShortcuts } from '@/components/blog/components/KeyboardShortcuts';
import { ShareMenu } from '@/components/blog/components/ShareMenu';
import { MDX } from '@/components/blog/markdown/mdx';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { Prose } from '@/components/ui/Typography';
import { findNeighbour, getAllPosts, getPostBySlug } from '@/lib/blog/posts';
import { dayjs } from '@/lib/dayjs';
import { openGraphImage } from '@/lib/open-graph';
import { USER } from '@/lib/user';
import { cn } from '@/lib/utils';

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
		post.metadata.imageLight ||
		`/og/simple?title=${encodeURIComponent(post.metadata.title)}`,
	url: `https://cuzeacflorin.fr${getPostUrl(post)}`,
	datePublished: dayjs(post.metadata.createdAt).toISOString(),
	dateModified: dayjs(post.metadata.updatedAt).toISOString(),
	author: {
		'@type': 'Person',
		name: USER.firstName,
		identifier: USER.username,
		image: USER.avatar,
	},
});

const Page = async ({ params }: Props) => {
	const slug = (await params).slug;
	const post = getPostBySlug(slug);

	if (!post) {
		notFound();
	}

	const toc = getTableOfContents(post.content);

	const allPosts = getAllPosts();
	const { previous, next } = findNeighbour(allPosts, slug);

	return (
		<>
			<script
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(getPageJsonLd(post)).replace(/</g, '\\u003c'),
				}}
				type="application/ld+json"
			/>

			<KeyboardShortcuts basePath="/blog" next={next} previous={previous} />

			<div className="screen-line-before flex items-center justify-between px-3 py-2">
				<Button
					asChild
					className="h-7 gap-2 rounded-lg px-0 font-mono text-muted-foreground"
					variant="link"
				>
					<Link href="/blog">
						<ArrowLeftIcon className="size-4" />
						Tous les articles
					</Link>
				</Button>

				<div className="flex items-center gap-2">
					<LLMCopyButtonWithViewOptions
						isComponent={post.metadata.category === 'components'}
						markdownUrl={`${getPostUrl(post)}.mdx`}
					/>

					<ShareMenu url={getPostUrl(post)} />

					{previous && (
						<Button asChild size="icon:sm" variant="secondary">
							<Link href={`/blog/${previous.slug}`}>
								<ArrowLeftIcon className="size-4" />
								<span className="sr-only">Précédent</span>
							</Link>
						</Button>
					)}

					{next && (
						<Button asChild size="icon:sm" variant="secondary">
							<Link href={`/blog/${next.slug}`}>
								<span className="sr-only">Suivant</span>
								<ArrowRightIcon className="size-4" />
							</Link>
						</Button>
					)}
				</div>
			</div>

			<div className="screen-line-before screen-line-after">
				<div
					className={cn(
						'h-8',
						'before:absolute before:-left-[100vw] before:-z-1 before:h-full before:w-[200vw]',
						'before:bg-[repeating-linear-gradient(315deg,var(--pattern-foreground)_0,var(--pattern-foreground)_1px,transparent_0,transparent_50%)] before:bg-size-[10px_10px] before:[--pattern-foreground:var(--color-edge)]/56'
					)}
				/>
			</div>

			<Prose className="px-4">
				<h1 className="screen-line-after mb-1 font-semibold">
					{post.metadata.title}
				</h1>

				<div className="screen-line-after flex gap-x-2 pb-1 text-muted-foreground text-sm">
					<time dateTime={dayjs(post.metadata.createdAt).toISOString()}>
						{dayjs(post.metadata.createdAt).format('dddd DD MMMM YYYY')}
					</time>
					<span>•</span>
					<span>{post.reading?.time}</span>
					<span>•</span>
					<span>{post.reading?.words} mots</span>
				</div>

				<p className="lead my-6">{post.metadata.description}</p>

				<InlineToc items={toc} />

				<div>
					<MDX code={post.content} />
				</div>
			</Prose>

			<div className="screen-line-before w-full" />
			<Divider className="border-x-0" />
		</>
	);
};

export default Page;
