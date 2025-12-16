'use client';

import Link from 'next/link';
import { CurriculumVitaeOverlay } from '@/components/features/cv/CurriculumVitaeOverlay';
import { Button } from '@/components/ui/Button';
import {
	Panel,
	PanelContent,
	PanelFooter,
	PanelHeader,
	PanelTitle,
} from '@/components/ui/Panel';
import { Prose } from '@/components/ui/Typography';
import { USER } from '@/features/root/data/user';

export const CurriculumVitae = () => (
	<Panel>
		<PanelHeader>
			<PanelTitle>Découvrir mon CV</PanelTitle>
		</PanelHeader>

		<PanelContent className="space-y-2">
			<Prose>
				Découvrez mon parcours professionnel à travers mon{' '}
				<span>CV détaillé</span>, qui retrace mes expériences,
				compétences techniques et réalisations dans le développement web
				full-stack. Vous y trouverez un <span>aperçu complet</span> de
				mon expertise et de ma progression dans le domaine.
			</Prose>
			<Prose>
				Pour recevoir une <span>copie actualisée</span> directement dans
				votre boîte e-mail, cliquez sur le bouton ci-dessous. Je serai
				ravi d'échanger avec vous sur d'éventuelles opportunités de
				collaboration.
			</Prose>
		</PanelContent>

		<PanelFooter>
			<Link
				aria-label={USER.documents.cv.title}
				href={USER.documents.cv.url}
				rel="noopener noreferrer"
				target="_blank"
			>
				<Button variant="outline">Voir et télécharger</Button>
			</Link>

			<CurriculumVitaeOverlay />

			{/*<EmailCVDialog className="max-sm:hidden">
				<Button>Recevoir par mail</Button>
			</EmailCVDialog>

			<EmailCVDrawer className="min-sm:hidden">
				Recevoir par mail
			</EmailCVDrawer>*/}
		</PanelFooter>
	</Panel>
);
