import type React from 'react';
import { PanelContent } from '@/components/ui/Panel';
import { TextAnimate } from '@/components/ui/TextAnimate';

const CvContent = (): React.JSX.Element => (
	<PanelContent className="*:prose *:prose-sm *:prose-zinc dark:*:prose-invert space-y-2 *:max-w-none *:font-mono *:text-foreground">
		<TextAnimate animation="fadeIn" as="p" by="word" delay={0.4}>
			Découvrez mon parcours professionnel à travers mon CV détaillé, qui retrace mes expériences, compétences
			techniques et réalisations dans le développement web full-stack.
		</TextAnimate>
		<TextAnimate animation="fadeIn" as="p" by="word" className="!text-theme !font-medium" delay={0.6}>
			Vous y trouverez un aperçu complet de mon expertise et de ma progression dans le domaine.
		</TextAnimate>
		<TextAnimate animation="fadeIn" as="p" by="word" delay={0.8}>
			Pour recevoir une copie actualisée directement dans votre boîte e-mail, cliquez sur le bouton ci-dessous. Je serai
			ravi d'échanger avec vous sur d'éventuelles opportunités de collaboration.
		</TextAnimate>
	</PanelContent>
);

CvContent.displayName = 'CurriculumVitaeContent';

export { CvContent };
