import { memo } from 'react';
import { PanelContent } from '@/components/ui/Panel';
import { TextAnimate } from '@/components/ui/TextAnimate';
import { AboutPointer } from '@/features/(homepage)/6_about/AboutPointer';

interface AboutContentProps {
	expanded: boolean;
}

const AboutContent = memo(({ expanded }: AboutContentProps) => (
	<PanelContent>
		<AboutPointer />

		<TextAnimate animation="slideUp" as="p" by="word" delay={0.4}>
			Tout a commencé lorsqu'un ami m'a initié aux bases du HTML et du CSS. Ce qui n'était au départ qu'une
			expérimentation ludique est vite devenu une passion dévorante.
		</TextAnimate>

		<TextAnimate animation="slideUp" as="p" by="word" className="mt-3" delay={0.5}>
			J'ai appris "à la dure", en passant de sites statiques bruts à la complexité de JavaScript. J'ai passé des
			semaines à décortiquer la logique des Promises et de l'asynchrone jusqu'au déclic. Cette courbe d'apprentissage
			m'a enseigné une leçon précieuse : chaque erreur est une opportunité de comprendre le "pourquoi" derrière le
			"comment". C'est cette gratification de voir une idée abstraite devenir une réalité interactive qui me motive
			chaque jour.
		</TextAnimate>

		{expanded && (
			<>
				<TextAnimate animation="slideUp" as="p" by="word" className="mt-3" delay={0.6}>
					La transition vers l'écosystème moderne a marqué un véritable tournant. D'abord sceptique, j'ai rapidement
					adopté la logique modulaire de React et la robustesse de TypeScript, qui ont remplacé la manipulation manuelle
					du DOM et le débogage fastidieux par une architecture fiable. L'ajout de Next.js et Tailwind CSS a ensuite
					décuplé ma productivité : fini les configurations lourdes et le CSS ingérable.
				</TextAnimate>

				<TextAnimate animation="slideUp" as="p" by="word" className="mt-3" delay={0.7} themed>
					Aujourd'hui, je maîtrise cette stack (Next.js/TS/Tailwind) pour déployer rapidement des applications
					performantes et propres, animé par une veille technique constante pour optimiser chaque ligne de code.
				</TextAnimate>
			</>
		)}
	</PanelContent>
));

AboutContent.displayName = 'AboutContent';

export { AboutContent };
