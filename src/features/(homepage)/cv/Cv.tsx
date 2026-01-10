import type React from 'react';
import { Panel } from '@/components/ui/Panel';
import { CvContent } from './CvContent';
import { CvFooter } from './CvFooter';
import { CvTitle } from './CvTitle';

const Cv = (): React.JSX.Element => (
	<Panel>
		<CvTitle />
		<CvContent />
		<CvFooter />
	</Panel>
);

Cv.displayName = 'CurriculumVitae';

export { Cv };
