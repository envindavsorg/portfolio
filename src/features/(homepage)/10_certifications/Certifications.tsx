import type React from 'react';
import { Panel } from '@/components/ui/Panel';
import { CertificationsContent } from './CertificationsContent';
import { CertificationsTitle } from './CertificationsTitle';
import { CERTIFICATIONS } from './content';

const Certifications = (): React.JSX.Element => (
	<Panel>
		<CertificationsTitle />
		<CertificationsContent content={CERTIFICATIONS} />
	</Panel>
);

Certifications.displayName = 'Certifications';

export { Certifications };
