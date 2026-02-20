import Link from 'next/link';
import { Button } from '@/components/buttons/Button';
import {
	Panel,
	PanelContent,
	PanelFooter,
	PanelHeader,
} from '@/components/primitives/Panel';
import { Prose } from '@/components/text/Typography';
import { getPostsByCategory } from '@/lib/blog/posts';
import { dayjs } from '@/lib/utils';
import { ArticleItem } from './ArticleItem';

export const Articles = () => {
	const articles = getPostsByCategory('article').sort((a, b) =>
		dayjs(b.metadata.createdAt).diff(dayjs(a.metadata.createdAt))
	);

	return (
		<Panel>
			<PanelHeader sticky title="mes articles de blog" />

			<PanelContent>
				<Prose>
					-- des articles issus d'expériences concrètes sur le{' '}
					<span>développement web</span> : bonnes pratiques,{' '}
					<span>patterns modernes</span> et solutions techniques sur
					l'écosystème <span>JavaScript</span> --
				</Prose>
				<Prose>
					-- un objectif simple : <i>documenter</i>, <i>partager</i> et{' '}
					<i>aider</i> les développeurs qui rencontrent les mêmes défis --
				</Prose>
			</PanelContent>

			<div className="screen-line-before relative py-4">
				<div className="pointer-events-none absolute inset-0 -z-1 grid grid-cols-1 gap-4 max-sm:hidden sm:grid-cols-2">
					<div className="border-edge border-r" />
					<div className="border-edge border-l" />
				</div>

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					{articles.map((item) => (
						<ArticleItem article={item} key={item.slug} />
					))}
				</div>
			</div>

			<PanelFooter>
				<Button asChild variant="outline">
					<Link aria-label="Voir tous les articles" href="/blog">
						voir tous mes articles
					</Link>
				</Button>
			</PanelFooter>
		</Panel>
	);
};
