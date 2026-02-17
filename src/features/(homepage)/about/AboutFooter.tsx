import { memo, useRef } from 'react';
import { Button } from '@/components/buttons/Button';
import { ChevronDownIcon } from '@/components/icons/ChevronDownIcon';
import { ChevronUpIcon } from '@/components/icons/ChevronUpIcon';
import { PanelFooter } from '@/components/Panel';

interface AboutFooterProps {
	expanded: boolean;
	onToggle: () => void;
}

export const AboutFooter = memo(({ expanded, onToggle }: AboutFooterProps) => {
	const iconRef = useRef<AnimatedIconHandle>(null);

	const handleMouseEnter = () => iconRef.current?.startAnimation();
	const handleMouseLeave = () => iconRef.current?.stopAnimation();

	return (
		<PanelFooter className="flex max-sm:flex-col">
			<Button
				aria-controls="about-content-expanded"
				aria-expanded={expanded}
				onClick={onToggle}
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
				variant="outline"
			>
				{expanded ? 'réduire le texte' : 'en savoir plus'}
				{expanded ? (
					<ChevronUpIcon ref={iconRef} />
				) : (
					<ChevronDownIcon ref={iconRef} />
				)}
			</Button>
		</PanelFooter>
	);
});
