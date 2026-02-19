import Link from 'next/link';
import { Button } from '@/components/buttons/Button';
import { PanelContent, PanelFooter } from '@/components/Panel';
import { Prose } from '@/components/ui/Typography';
import { ToolItem } from './ToolItem';

interface ToolsContentProps {
	tools: Post[];
}

export const ToolsContent = ({ tools }: ToolsContentProps) => (
	<>
		<PanelContent className="screen-line-after space-y-3">
			<Prose className="max-sm:text-xs!">
				Découvrez une suite <span>d'outils web</span> entièrement gratuits,
				conçue pour simplifier le quotidien des développeurs. En regroupant ces{' '}
				<span>utilitaires essentiels</span> au même endroit, optimisez votre
				workflow et réduisez le temps passé sur les tâches répétitives.
			</Prose>
			<Prose className="max-sm:text-xs!">
				Explorez dès maintenant cette boîte à outils numérique pour accélérer
				vos projets et booster votre productivité, sans la moindre contrainte
				technique.
			</Prose>
		</PanelContent>

		{tools.map((item) => (
			<ToolItem key={item.slug} tool={item} />
		))}

		<PanelFooter className="flex max-sm:flex-col">
			<Button variant="outline">
				<Link aria-label="Voir tous les outils" href="/utils">
					voir tous les outils
				</Link>
			</Button>
		</PanelFooter>
	</>
);
