import type React from 'react';
import { PanelContent } from '@/components/ui/Panel';
import { TextAnimate } from '@/components/ui/TextAnimate';

const CvContent = (): React.JSX.Element => (
	<PanelContent>
		<TextAnimate animation="slideUp" as="p" by="word" delay={0.4}>
			Découvrez mon parcours professionnel à travers mon CV détaillé, qui retrace mes expériences, compétences
			techniques et réalisations dans le développement web full-stack.
		</TextAnimate>

		<TextAnimate animation="slideUp" as="p" by="word" className="my-3" delay={0.6} themed>
			Vous y trouverez un aperçu complet de mon expertise et de ma progression dans le domaine.
		</TextAnimate>

		<TextAnimate animation="slideUp" as="p" by="word" delay={0.8}>
			Pour recevoir une copie actualisée directement dans votre boîte e-mail, cliquez sur le bouton ci-dessous. Je serai
			ravi d'échanger avec vous sur d'éventuelles opportunités de collaboration.
		</TextAnimate>
	</PanelContent>
);

CvContent.displayName = 'CurriculumVitaeContent';

export { CvContent };
