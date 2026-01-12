import type React from 'react';
import { CertificationsContent } from '@/components/features/(homepage)/certifications/CertificationsContent';
import { Panel } from '@/components/ui/Panel';
import { CertificationsTitle } from './CertificationsTitle';
import { CERTIFICATIONS } from './content';

export const Certifications = (): React.JSX.Element => (
	<Panel id="certifications">
		<CertificationsTitle />
		<CertificationsContent content={CERTIFICATIONS} />
	</Panel>
);
