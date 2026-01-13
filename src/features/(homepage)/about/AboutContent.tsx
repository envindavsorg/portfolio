'use client';

import { CaretDownIcon } from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'motion/react';
import type React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { PanelContent, PanelFooter } from '@/components/ui/Panel';
import { TextAnimate } from '@/components/ui/TextAnimate';
import { cn } from '@/lib/utils';

const AboutContent = (): React.JSX.Element => {
	const [isExpanded, setIsExpanded] = useState(false);

	return (
		<>
			<PanelContent className="screen-line-after *:prose *:prose-sm *:prose-zinc dark:*:prose-invert space-y-2 *:max-w-none *:font-mono *:text-foreground">
				<TextAnimate animation="fadeIn" as="p" by="word" delay={0.4}>
					Mon parcours a commencé simplement — un ami m'a montré comment créer un site web basique
					avec HTML et CSS. Au début, c'était de l'expérimentation pure. Je copiais du code depuis
					Stack Overflow sans totalement le comprendre. Mes premiers sites étaient bruts : des divs
					excessives, du CSS inline, aucune responsivité. JavaScript m'a défié pendant des semaines,
					particulièrement avec les callbacks et les promises. J'ai dû relire les mêmes explications
					10 fois avant de comprendre. Mais voir le code prendre vie dans le navigateur était
					immédiatement gratifiant.
				</TextAnimate>

				<AnimatePresence initial={false}>
					{isExpanded && (
						<motion.div
							animate={{ opacity: 1, height: 'auto' }}
							className="overflow-hidden"
							exit={{ opacity: 0, height: 0 }}
							id="about-content-expanded"
							initial={{ opacity: 0, height: 0 }}
							transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
						>
							<TextAnimate animation="fadeIn" as="p" by="word" delay={0.6}>
								Un collègue m'a suggéré : "Essaie React, tu verras, c'est génial !" Initialement, je
								trouvais ça inutilement complexe. Après quelques projets, j'ai compris la valeur :
								plus de manipulation manuelle du DOM, les composants réutilisables sont devenus un
								vrai changement de paradigme. TypeScript a suivi peu après. J'étais sceptique
								jusqu'à perdre 3 heures à déboguer une faute de frappe dans un nom de propriété.
								Désormais, coder sans TypeScript me semble incomplet — il détecte les erreurs avant
								qu'elles ne deviennent des problèmes. Next.js a été transformateur. Plus d'heures à
								configurer Webpack. Routing automatique, SSR, API routes — tout prêt dès le départ.
								Tailwind CSS a d'abord divisé mon opinion. "Ça encombre le HTML", "Ce n'est pas
								maintenable". Une fois adapté, impossible de revenir en arrière.
							</TextAnimate>
							<TextAnimate animation="fadeIn" as="p" by="word" delay={0.8}>
								Finis les fichiers CSS de 2000 lignes où personne ne savait ce qui servait encore.
								Aujourd'hui, je construis des projets Next.js/TypeScript/Tailwind efficacement. Ce
								qui prenait des jours prend maintenant des heures. Les composants sont optimisés, le
								code est propre, les performances sont au top. Le meilleur ? Je continue d'apprendre
								quotidiennement : un nouveau hook, une meilleure structure de composants, une
								technique pour réduire les re-renders. Même après des années, voir le code se
								transformer en application fonctionnelle reste profondément satisfaisant.
							</TextAnimate>
						</motion.div>
					)}
				</AnimatePresence>
			</PanelContent>

			<PanelFooter className="before:bg-transparent">
				<Button
					aria-controls="about-content-expanded"
					aria-expanded={isExpanded}
					className="group flex items-center gap-2"
					onClick={() => setIsExpanded(!isExpanded)}
				>
					{isExpanded ? 'Voir moins' : 'Voir plus'}
					<CaretDownIcon
						aria-hidden="true"
						className={cn(
							'size-4 transition-transform duration-300 ease-in-out',
							isExpanded && 'rotate-180'
						)}
					/>
				</Button>
			</PanelFooter>
		</>
	);
};

AboutContent.displayName = 'AboutContent';

export { AboutContent };
