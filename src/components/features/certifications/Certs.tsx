import type React from 'react';
import { PostsLength } from '@/components/blog/components/PostsLength';
import { CollapsibleList } from '@/components/ui/CollapsibleList';
import {
	Panel,
	PanelContent,
	PanelHeader,
	PanelTitle,
} from '@/components/ui/Panel';
import { Prose } from '@/components/ui/Typography';
import { CertItem } from './CertsItem';
import { CERTIFICATIONS } from './data/certifications';

export const Certs = (): React.JSX.Element => (
	<Panel id="certs">
		<PanelHeader className="flex items-center justify-between">
			<PanelTitle>Mes certifications</PanelTitle>
			<PostsLength items={CERTIFICATIONS} slug="obtenue" />
		</PanelHeader>

		<PanelContent className="screen-line-after">
			<Prose>
				La technologie évolue rapidement, et rester à jour est essentiel. Ces
				certifications valident mes compétences techniques et démontrent mon
				engagement envers l'excellence et l'apprentissage continu dans le
				développement web moderne.
			</Prose>
		</PanelContent>

		<CollapsibleList
			items={CERTIFICATIONS}
			keyExtractorAction={(item) => item.credentialID}
			labels={{
				showMore: 'Voir toutes les certifications',
				showLess: 'Fermer',
			}}
			max={2}
			renderItemAction={(item) => <CertItem certification={item} />}
		/>
	</Panel>
);
