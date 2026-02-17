'use client';

import { useCallback, useState } from 'react';
import { Panel, PanelHeader, PanelTitle } from '@/components/Panel';
import { TextAnimate } from '@/components/text/TextAnimate';
import { AboutContent } from './AboutContent';
import { AboutFooter } from './AboutFooter';

export const About = () => {
	const [isExpanded, setIsExpanded] = useState(false);
	const toggleExpanded = useCallback(() => setIsExpanded((prev) => !prev), []);

	return (
		<Panel id="about-me">
			<PanelHeader>
				<PanelTitle>
					<TextAnimate animation="slideLeft" by="character" delay={0.2}>
						quelques mots sur moi
					</TextAnimate>
				</PanelTitle>
			</PanelHeader>

			<AboutContent expanded={isExpanded} />
			<AboutFooter expanded={isExpanded} onToggle={toggleExpanded} />
		</Panel>
	);
};
