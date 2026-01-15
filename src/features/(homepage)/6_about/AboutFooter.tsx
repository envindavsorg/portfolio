import { memo, useCallback, useRef } from 'react';
import { Button } from '@/components/Button';
import { ChevronDownIcon } from '@/components/icons/ChevronDownIcon';
import { ChevronUpIcon } from '@/components/icons/ChevronUpIcon';
import { PanelFooter } from '@/components/ui/Panel';

interface AboutFooterProps {
	expanded: boolean;
	onToggle: () => void;
}

const AboutFooter = memo(({ expanded, onToggle }: AboutFooterProps) => {
	const downRef = useRef<AnimatedIconHandle>(null);
	const upRef = useRef<AnimatedIconHandle>(null);

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
