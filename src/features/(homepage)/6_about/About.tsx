'use client';

import type React from 'react';
import { useCallback, useState } from 'react';
import { Panel } from '@/components/ui/Panel';
import { AboutContent } from './AboutContent';
import { AboutFooter } from './AboutFooter';
import { AboutTitle } from './AboutTitle';

const About = (): React.JSX.Element => {
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
