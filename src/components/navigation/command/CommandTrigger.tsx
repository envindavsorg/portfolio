import type React from 'react';
import { Button } from '@/components/ui/Button';
import { Kbd } from '@/components/ui/Kbd';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip';
import { SearchIcon } from '../../icons/animated/SearchIcon';

interface CommandTriggerProps {
	setOpenAction: (open: boolean) => void;
}

export const CommandTrigger = ({ setOpenAction }: CommandTriggerProps): React.JSX.Element => (
	<Tooltip>
		<TooltipTrigger asChild>
			<Button
				className="border dark:inset-shadow-[1px_1px_1px,0px_0px_2px] dark:inset-shadow-white/15 dark:border-0"
				onClick={() => setOpenAction(true)}
				size="icon"
				variant="outline"
			>
				<SearchIcon className="relative after:absolute after:-inset-2" />
				<span className="sr-only">Rechercher</span>
			</Button>
		</TooltipTrigger>

		<TooltipContent>
			Rechercher
			<Kbd>/</Kbd>
		</TooltipContent>
	</Tooltip>
);
