import { Panel } from '@/components/Panel';
import { CertificationsContent } from './CertificationsContent';
import { CertificationsTitle } from './CertificationsTitle';
import { CERTIFICATIONS } from './content';

const Certifications = () => (
	<Panel>
		<CertificationsTitle />
		<CertificationsContent content={CERTIFICATIONS} />
	</Panel>
);

Certifications.displayName = 'Certifications';

export { Certifications };
