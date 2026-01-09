import type React from 'react';
import { Panel } from '@/components/ui/Panel';
import { ProjectsContent } from './ProjectsContent';
import { ProjectsTitle } from './ProjectsTitle';

const Projects = (): React.JSX.Element => (
	<Panel id="projects">
		<ProjectsTitle />
		<ProjectsContent />
	</Panel>
);

Projects.displayName = 'Projects';

export { Projects };
