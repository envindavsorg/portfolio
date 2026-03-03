'use client';

import { useCallback, useRef, useState } from 'react';
import { ChevronDownIcon } from '@/components/blocks/icons/ChevronDownIcon';
import { ChevronUpIcon } from '@/components/blocks/icons/ChevronUpIcon';
import { Button } from '@/components/primitives/Button';
import { Panel, PanelFooter, PanelHeader } from '@/components/primitives/Panel';
import { AboutContent } from './AboutContent';

export const About = () => {
	const [isExpanded, setIsExpanded] = useState(false);
	const toggleExpanded = useCallback(() => setIsExpanded((prev) => !prev), []);

	const iconRef = useRef<AnimatedIconHandle>(null);
	const handleMouseEnter = () => iconRef.current?.startAnimation();
	const handleMouseLeave = () => iconRef.current?.stopAnimation();

	return (
		<Panel>
			<PanelHeader sticky title="quelques mots sur moi" />

			<AboutContent expanded={isExpanded} />

			<PanelFooter>
				<Button
					aria-controls="about-content-expanded"
					aria-expanded={isExpanded}
					onClick={toggleExpanded}
					onMouseEnter={handleMouseEnter}
					onMouseLeave={handleMouseLeave}
					variant="outline"
				>
					{isExpanded ? 'réduire le texte' : 'en savoir plus'}
					{isExpanded ? <ChevronUpIcon ref={iconRef} /> : <ChevronDownIcon ref={iconRef} />}
				</Button>
			</PanelFooter>
		</Panel>
	);
};
