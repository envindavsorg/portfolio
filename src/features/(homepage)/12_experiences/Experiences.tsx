import { Panel } from '@/components/Panel';
import { EXPERIENCES } from './content';
import { ExperiencesContent } from './ExperiencesContent';
import { ExperiencesTitle } from './ExperiencesTitle';

const Experiences = () => (
	<Panel id="my-experiences">
		<ExperiencesTitle />
		<ExperiencesContent content={EXPERIENCES} />
	</Panel>
);

Experiences.displayName = 'Experiences';

export { Experiences };
