import { ArrowRightIcon } from '@phosphor-icons/react/ssr';
import Link from 'next/link';
import type React from 'react';
import { Post } from '@/components/blog/components/Post';
import { PostsLength } from '@/components/blog/components/PostsLength';
import { Button } from '@/components/ui/Button';
import {
	Panel,
	PanelContent,
	PanelHeader,
	PanelTitle,
} from '@/components/ui/Panel';
import { Prose } from '@/components/ui/Typography';
import { getPostsByCategory } from '@/lib/blog/posts';
import { dayjs } from '@/lib/dayjs';

export const Articles = (): React.JSX.Element => {
	const articles: Post[] = getPostsByCategory('article')
		.sort((a: Post, b: Post) =>
			dayjs(b.metadata.createdAt).diff(dayjs(a.metadata.createdAt)),
		)
		.slice(0, 4);

	return (
		<Panel id="blog">
			<PanelHeader className="flex items-center justify-between">
				<PanelTitle>Mes articles de blog</PanelTitle>
				<PostsLength items={articles} slug="article" />
			</PanelHeader>

			<PanelContent className="screen-line-after">
				<Prose>
					Retrouvez tous mes <span>articles de blog</span> où je
					partage mon expérience en développement web. J'y aborde les{' '}
					<span>bonnes pratiques</span>, les{' '}
					<span>patterns modernes</span>, les solutions aux problèmes
					techniques du quotidien, et mes découvertes sur l'écosystème
					JavaScript. Chaque article est le fruit d'une{' '}
					<span>expérience concrète</span>, d'un{' '}
					<span>bug résolu</span> ou d'une technique apprise. Mon
					objectif : documenter mon apprentissage et aider d'autres
					développeurs qui rencontrent les mêmes défis.
				</Prose>
			</PanelContent>

			<div className="relative py-4">
				<div className="-z-1 pointer-events-none absolute inset-0 grid grid-cols-1 gap-4 max-sm:hidden sm:grid-cols-2">
					<div className="border-edge border-r" />
					<div className="border-edge border-l" />
				</div>

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					{articles.map((post) => (
						<Post key={post.slug} post={post} />
					))}
				</div>
			</div>

			<div className="screen-line-before flex justify-center py-2 md:justify-end md:pr-4">
				<Link aria-label="Voir tous les articles" href="/blog">
					<Button>
						Voir tous les articles
						<ArrowRightIcon />
					</Button>
				</Link>
			</div>
		</Panel>
	);
};
