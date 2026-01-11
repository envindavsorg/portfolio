import type React from 'react';
import { Panel } from '@/components/ui/Panel';
import { ExperiencesContent } from './ExperiencesContent';
import { ExperiencesTitle } from './ExperiencesTitle';

export const Experiences = (): React.JSX.Element => (
	<Panel id="experience">
		<ExperiencesTitle />
		<ExperiencesContent />
	</Panel>
);
