import {
	Panel,
	PanelContent,
	PanelHeader,
} from '@/components/primitives/Panel';
import { Prose } from '@/components/text/Typography';
import { CertItem } from './CertItem';
import { CERTS } from './content';

export const Certs = () => (
	<Panel>
		<PanelHeader sticky title="mes certifications" />

		<PanelContent>
			<Prose>
				-- les technologies <span>évoluent</span> rapidement, et rester à jour
				est essentiel --
			</Prose>
			<Prose>
				-- ces <span>certifications</span> valident{' '}
				<i>mes compétences techniques</i> et démontrent mon engagement envers{' '}
				<span>l'excellence</span> et <span>l'apprentissage</span> continu dans
				le développement web moderne --
			</Prose>
		</PanelContent>

		{CERTS.map((item, idx) => (
			<CertItem
				cert={item}
				isLast={idx === CERTS.length - 1}
				key={item.credentialID}
			/>
		))}
	</Panel>
);
