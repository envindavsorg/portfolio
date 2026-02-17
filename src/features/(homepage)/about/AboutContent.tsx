import { AnimatePresence, motion } from 'motion/react';
import { memo } from 'react';
import { PanelContent } from '@/components/Panel';
import { Prose } from '@/components/ui/Typography';
import { AboutPointer } from '@/features/(homepage)/about/AboutPointer';

interface AboutContentProps {
	expanded: boolean;
}

export const AboutContent = memo(({ expanded }: AboutContentProps) => (
	<PanelContent className="space-y-3">
		<AboutPointer />

		<Prose>
			Tout a commencé lorsqu'un ami m'a initié aux bases du HTML et du CSS. Ce
			qui n'était au départ qu'une expérimentation ludique est vite devenu une
			passion dévorante.
		</Prose>

		<AnimatePresence initial={false}>
			{expanded && (
				<motion.div
					animate={{ height: 'auto', opacity: 1 }}
					className="space-y-3 overflow-hidden"
					exit={{ height: 0, opacity: 0 }}
					initial={{ height: 0, opacity: 0 }}
					key="about-expanded"
					transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
				>
					<Prose>
						J'ai appris "à la dure", en passant de sites statiques bruts à la
						complexité de JavaScript. J'ai passé des semaines à décortiquer la
						logique des Promises et de l'asynchrone jusqu'au déclic. Cette
						courbe d'apprentissage m'a enseigné une leçon précieuse : chaque
						erreur est une opportunité de comprendre le "pourquoi" derrière le
						"comment". C'est cette gratification de voir une idée abstraite
						devenir une réalité interactive qui me motive chaque jour.
					</Prose>

					<Prose>
						La transition vers l'écosystème moderne a marqué un véritable
						tournant. D'abord sceptique, j'ai rapidement adopté la logique
						modulaire de React et la robustesse de TypeScript, qui ont remplacé
						la manipulation manuelle du DOM et le débogage fastidieux par une
						architecture fiable. L'ajout de Next.js et Tailwind CSS a ensuite
						décuplé ma productivité : fini les configurations lourdes et le CSS
						ingérable.
					</Prose>

					<Prose>
						Aujourd'hui, je maîtrise cette stack (Next.js/TS/Tailwind) pour
						déployer rapidement des applications performantes et propres, animé
						par une veille technique constante pour optimiser chaque ligne de
						code.
					</Prose>
				</motion.div>
			)}
		</AnimatePresence>
	</PanelContent>
));
