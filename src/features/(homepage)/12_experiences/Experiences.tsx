import type React from 'react';
import { Panel } from '@/components/ui/Panel';
import { EXPERIENCES } from './content';
import { ExperiencesContent } from './ExperiencesContent';
import { ExperiencesTitle } from './ExperiencesTitle';

const Experiences = (): React.JSX.Element => (
	<Panel id="my-experiences">
		<ExperiencesTitle />
		<ExperiencesContent content={EXPERIENCES} />
	</Panel>
);

Experiences.displayName = 'Experiences';

export { Experiences };
