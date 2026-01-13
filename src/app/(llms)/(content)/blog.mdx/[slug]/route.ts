import { notFound } from 'next/navigation';
import { getLLMText } from '@/lib/blog/llm';
import { getAllPosts } from '@/lib/blog/posts';

export const generateStaticParams = async (): Promise<{ slug: string }[]> => {
	const posts: Post[] = getAllPosts();
	return posts.map(({ slug }) => ({ slug }));
};

interface ParamsProps {
	params: Promise<{ slug: string }>;
}

export const GET = async (_request: Request, { params }: ParamsProps): Promise<Response> => {
	const { slug } = await params;

	const allPosts: Post[] = getAllPosts();
	const post = allPosts.find((article: Post) => article.slug === slug);

	if (!post) {
		notFound();
	}

	return new Response(await getLLMText(post), {
		headers: {
			'Content-Type': 'text/markdown;charset=utf-8',
		},
	});
};
