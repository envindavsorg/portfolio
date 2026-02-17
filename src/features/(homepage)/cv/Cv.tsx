import {
	Panel,
	PanelContent,
	PanelHeader,
	PanelTitle,
} from '@/components/Panel';
import { TextAnimate } from '@/components/text/TextAnimate';
import { Prose } from '@/components/ui/Typography';
import { CvFooter } from './CvFooter';

export const Cv = () => (
	<Panel>
		<PanelHeader>
			<PanelTitle>
				<TextAnimate animation="slideLeft" by="character" delay={0.2}>
					découvrez mon nouveau CV
				</TextAnimate>
			</PanelTitle>
		</PanelHeader>

		<PanelContent className="space-y-3">
			<Prose>
				découvrez mon parcours professionnel à travers mon CV détaillé, qui
				retrace mes expériences, compétences techniques et réalisations dans le
				développement web full-stack.
			</Prose>
			<Prose>
				pour recevoir une <span>copie actualisée</span> directement dans votre
				boîte e-mail, cliquez sur le bouton ci-dessous. Je serai ravi d'échanger
				avec vous sur d'éventuelles <span>opportunités</span> de collaboration.
			</Prose>
		</PanelContent>

		<CvFooter />
	</Panel>
);
