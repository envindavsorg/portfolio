import { memo, useCallback, useRef } from 'react';
import { Button } from '@/components/Button';
import { ChevronDownIcon, type ChevronDownIconHandle } from '@/components/icons/animated/ChevronDownIcon';
import { ChevronUpIcon, type ChevronUpIconHandle } from '@/components/icons/animated/ChevronUpIcon';
import { PanelFooter } from '@/components/ui/Panel';

interface AboutFooterProps {
	expanded: boolean;
	onToggle: () => void;
}

const AboutFooter = memo(({ expanded, onToggle }: AboutFooterProps) => {
	const downRef = useRef<ChevronDownIconHandle>(null);
	const upRef = useRef<ChevronUpIconHandle>(null);

	const handleMouseEnter = useCallback(() => {
		downRef.current?.startAnimation();
		upRef.current?.startAnimation();
	}, []);

	const handleMouseLeave = useCallback(() => {
		downRef.current?.stopAnimation();
		upRef.current?.stopAnimation();
	}, []);

	return (
		<PanelFooter>
			<Button
				aria-controls="about-content-expanded"
				aria-expanded={expanded}
				id="about-content-expanded"
				onClick={onToggle}
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
			>
				{expanded ? 'Fermer le détail' : 'En savoir plus'}
				{expanded ? <ChevronUpIcon ref={upRef} /> : <ChevronDownIcon ref={downRef} />}
			</Button>
		</PanelFooter>
	);
});

AboutFooter.displayName = 'AboutFooter';

export { AboutFooter };
