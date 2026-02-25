import { notFound } from 'next/navigation';
import { type Content, getAllContent, getLLMText } from '@/lib/content';

export const generateStaticParams = async (): Promise<{ slug: string }[]> => {
	const posts: Content[] = getAllContent();
	return posts.map(({ slug }) => ({ slug }));
};

interface ParamsProps {
	params: Promise<{ slug: string }>;
}

export const GET = async (
	_request: Request,
	{ params }: ParamsProps
): Promise<Response> => {
	const { slug } = await params;

	const allPosts: Content[] = getAllContent();
	const post = allPosts.find((article: Content) => article.slug === slug);

	if (!post) {
		notFound();
	}

	return new Response(await getLLMText(post), {
		headers: {
			'Content-Type': 'text/markdown;charset=utf-8',
		},
	});
};
