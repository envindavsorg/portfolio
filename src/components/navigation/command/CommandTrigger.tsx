import type React from 'react';
import { Button } from '@/components/Button';
import { Kbd } from '@/components/ui/Kbd';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip';
import { SearchIcon } from '../../icons/SearchIcon';

interface CommandTriggerProps {
	setOpenAction: (open: boolean) => void;
}

export const CommandTrigger = ({ setOpenAction }: CommandTriggerProps): React.JSX.Element => (
	<Tooltip>
		<TooltipTrigger asChild>
			<Button onClick={() => setOpenAction(true)} size="icon" variant="outline">
				<SearchIcon />
				<span className="sr-only">Rechercher</span>
			</Button>
		</TooltipTrigger>

		<TooltipContent>
			Rechercher
			<Kbd>/</Kbd>
		</TooltipContent>
	</Tooltip>
);
