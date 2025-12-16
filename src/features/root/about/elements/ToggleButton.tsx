import { CaretDownIcon, CaretUpIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/Button';

type ToggleButtonProps = {
	isExpanded: boolean;
	setIsExpanded: (value: boolean) => void;
};

export const ToggleButton = ({
	isExpanded,
	setIsExpanded,
}: ToggleButtonProps) => (
	<div className="screen-line-before flex justify-center py-2 md:justify-end">
		<Button onClick={() => setIsExpanded(!isExpanded)}>
			Voir {isExpanded ? 'moins' : 'plus'}
			{isExpanded ? (
				<CaretUpIcon className="transition-transform duration-300 ease-in-out" />
			) : (
				<CaretDownIcon className="transition-transform duration-300 ease-in-out" />
			)}
		</Button>
	</div>
);
