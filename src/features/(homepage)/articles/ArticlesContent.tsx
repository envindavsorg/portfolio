import Link from 'next/link';
import { Button } from '@/components/buttons/Button';
import { PanelContent, PanelFooter } from '@/components/Panel';
import { Prose } from '@/components/ui/Typography';
import { ArticleItem } from './ArticleItem';

interface ArticlesContentProps {
	content: Post[];
}

export const ArticlesContent = ({ content }: ArticlesContentProps) => {
	const keyExtractorAction = (item: Post) => item.slug;
	const getKey = (item: Post, index: number) =>
		keyExtractorAction ? keyExtractorAction(item) : index;

	return (
		<>
			<PanelContent className="space-y-3">
				<Prose>
					retrouvez tous mes articles de blog où je partage mon expérience en{' '}
					<span>développement web</span>. j'y aborde les{' '}
					<span>bonnes pratiques</span>, les <span>patterns modernes</span>, les
					solutions aux problèmes techniques du quotidien, et mes découvertes
					sur l'écosystème <span>JavaScript</span>. chaque article est le fruit
					d'une expérience concrète, d'un bug résolu ou d'une technique apprise.
				</Prose>
				<Prose>
					mon objectif :{' '}
					<span>
						documenter mon apprentissage et aider d'autres développeurs qui
						rencontrent les mêmes défis.
					</span>
				</Prose>
			</PanelContent>

			<div className="screen-line-before relative py-4">
				<div className="pointer-events-none absolute inset-0 -z-1 grid grid-cols-1 gap-4 max-sm:hidden sm:grid-cols-2">
					<div className="border-edge border-r" />
					<div className="border-edge border-l" />
				</div>

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					{content.map((post: Post, idx: number) => (
						<ArticleItem article={post} key={getKey(post, idx)} />
					))}
				</div>
			</div>

			<PanelFooter className="flex max-sm:flex-col">
				<Button variant="outline">
					<Link aria-label="Voir tous les articles" href="/blog">
						voir tous mes articles
					</Link>
				</Button>
			</PanelFooter>
		</>
	);
};
