import type React from 'react';
import { Panel } from '@/components/ui/Panel';
import { CurriculumVitaeContent } from './CurriculumVitaeContent';
import { CurriculumVitaeFooter } from './CurriculumVitaeFooter';
import { CurriculumVitaeTitle } from './CurriculumVitaeTitle';

const CurriculumVitae = (): React.JSX.Element => (
	<Panel>
		<CurriculumVitaeTitle />
		<CurriculumVitaeContent />
		<CurriculumVitaeFooter />
	</Panel>
);

CurriculumVitae.displayName = 'CV';

export { CurriculumVitae };
