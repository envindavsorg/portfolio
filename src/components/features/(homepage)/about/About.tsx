import type React from 'react';
import { Panel } from '@/components/ui/Panel';
import { AboutContent } from './AboutContent';
import { AboutTitle } from './AboutTitle';

const About = (): React.JSX.Element => (
	<Panel id="about">
		<AboutTitle />
		<AboutContent />
	</Panel>
);

About.displayName = 'About';

export { About };
