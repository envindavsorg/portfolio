import { Panel } from '@/components/ui/Panel';
import { PROJECTS } from './content';
import { ProjectsContent } from './ProjectsContent';
import { ProjectsTitle } from './ProjectsTitle';

const Projects = () => (
	<Panel id="my-projects">
		<ProjectsTitle />
		<ProjectsContent content={PROJECTS} />
	</Panel>
);

Projects.displayName = 'Projects';

export { Projects };
