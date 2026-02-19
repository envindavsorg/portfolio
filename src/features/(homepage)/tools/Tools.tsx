import Link from 'next/link';
import { Button } from '@/components/buttons/Button';
import {
	Panel,
	PanelContent,
	PanelFooter,
	PanelHeader,
	PanelTitle,
} from '@/components/Panel';
import { TextAnimate } from '@/components/text/TextAnimate';
import { Prose } from '@/components/ui/Typography';
import { getPostsByCategory } from '@/lib/blog/posts';
import { dayjs } from '@/lib/utils';
import { ToolItem } from './ToolItem';

export const Tools = () => {
	const tools = getPostsByCategory('utils')
		.sort((a, b) =>
			dayjs(b.metadata.createdAt).diff(dayjs(a.metadata.createdAt))
		)
		.slice(0, 3);

	return (
		<Panel>
			<PanelHeader className="sticky top-0 z-10 bg-background">
				<PanelTitle>
					<TextAnimate animation="slideLeft" by="character" delay={0.2}>
						outils pour développeurs
					</TextAnimate>
				</PanelTitle>
			</PanelHeader>

			<PanelContent className="space-y-1.5">
				<Prose>
					-- une suite <span>d'outils web</span> gratuits pour simplifier votre
					quotidien de développeur --
				</Prose>
				<Prose>
					-- tous vos <span>utilitaires essentiels</span> réunis au même endroit
					pour un workflow plus efficace --
				</Prose>
				<Prose>
					-- moins de tâches <i>répétitives</i>, plus de <i>productivité</i>,
					sans aucune contrainte technique --
				</Prose>
			</PanelContent>

			{tools.map((tool, idx: number) => (
				<ToolItem
					isLast={idx === tools.length - 1}
					key={tool.slug}
					tool={tool}
				/>
			))}

			<PanelFooter className="flex max-sm:flex-col">
				<Button asChild variant="outline">
					<Link aria-label="Voir tous les outils" href="/utils">
						voir tous les outils
					</Link>
				</Button>
			</PanelFooter>
		</Panel>
	);
};
