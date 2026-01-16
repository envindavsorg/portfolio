import Link from 'next/link';
import { Button } from '@/components/buttons/Button';
import { PanelContent, PanelFooter } from '@/components/ui/Panel';
import { TextAnimate } from '@/components/ui/TextAnimate';
import { ArticleItem } from './ArticleItem';

interface ArticlesContentProps {
	content: Post[];
}

const ArticlesContent = ({ content }: ArticlesContentProps) => {
	const keyExtractorAction = (item: Post) => item.slug;
	const getKey = (item: Post, index: number) => (keyExtractorAction ? keyExtractorAction(item) : index);

	return (
		<>
			<PanelContent>
				<TextAnimate animation="slideUp" as="p" by="word" delay={0.4}>
					Retrouvez tous mes articles de blog où je partage mon expérience en développement web.
				</TextAnimate>

				<TextAnimate animation="slideUp" as="p" by="word" className="mt-3" delay={0.6} themed>
					J'y aborde les bonnes pratiques, les patterns modernes, les solutions aux problèmes techniques du quotidien,
					et mes découvertes sur l'écosystème JavaScript. Chaque article est le fruit d'une expérience concrète, d'un
					bug résolu ou d'une technique apprise.
				</TextAnimate>

				<TextAnimate animation="slideUp" as="p" by="word" className="mt-3" delay={0.8}>
					Mon objectif : documenter mon apprentissage et aider d'autres développeurs qui rencontrent les mêmes défis.
				</TextAnimate>
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

			<PanelFooter>
				<Link aria-label="Voir tous les articles" href="/blog">
					<Button>Tous les articles</Button>
				</Link>
			</PanelFooter>
		</>
	);
};

ArticlesContent.displayName = 'ArticlesContent';

export { ArticlesContent };
