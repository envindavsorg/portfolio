import {
	Panel,
	PanelContent,
	PanelHeader,
	PanelTitle,
} from '@/components/Panel';
import { TextAnimate } from '@/components/text/TextAnimate';
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
			<TextAnimate animation="slideUp" as="p" by="word" delay={0.4}>
				découvrez mon parcours professionnel à travers mon CV détaillé, qui
				retrace mes expériences, compétences techniques et réalisations dans le
				développement web full-stack.
			</TextAnimate>

			<TextAnimate animation="slideUp" as="p" by="word" delay={0.6} themed>
				pour recevoir une copie actualisée directement dans votre boîte e-mail,
				cliquez sur le bouton ci-dessous. Je serai ravi d'échanger avec vous sur
				d'éventuelles opportunités de collaboration.
			</TextAnimate>
		</PanelContent>

		<CvFooter />
	</Panel>
);
