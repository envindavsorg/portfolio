import { Panel, PanelContent, PanelHeader } from '@/components/Panel';
import { Prose } from '@/components/ui/Typography';
import { CertificationItem } from './CertificationItem';
import { CERTIFICATIONS, type Certification } from './content';

export const Certifications = () => (
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

		{CERTIFICATIONS.map((item: Certification, idx: number) => (
			<CertificationItem
				certification={item}
				isLast={idx === CERTIFICATIONS.length - 1}
				key={item.credentialURL}
			/>
		))}
	</Panel>
);
