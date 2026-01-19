import { Panel } from '@/components/Panel';
import { CvContent } from './CvContent';
import { CvFooter } from './CvFooter';
import { CvTitle } from './CvTitle';

const Cv = () => (
	<Panel>
		<CvTitle />
		<CvContent />
		<CvFooter />
	</Panel>
);

Cv.displayName = 'CurriculumVitae';

export { Cv };
