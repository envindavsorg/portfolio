'use client';

import { useCallback, useState } from 'react';
import { Panel } from '@/components/Panel';
import { AboutContent } from './AboutContent';
import { AboutFooter } from './AboutFooter';
import { AboutTitle } from './AboutTitle';

const About = () => {
	const [isExpanded, setIsExpanded] = useState(false);
	const toggleExpanded = useCallback(() => setIsExpanded((prev) => !prev), []);

	return (
		<Panel id="about-me">
			<AboutTitle />
			<AboutContent expanded={isExpanded} />
			<AboutFooter expanded={isExpanded} onToggle={toggleExpanded} />
		</Panel>
	);
};

About.displayName = 'About';

export { About };
