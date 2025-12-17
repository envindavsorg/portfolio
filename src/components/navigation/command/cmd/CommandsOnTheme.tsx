import { useTheme } from 'next-themes';
import type React from 'react';
import { memo, useCallback } from 'react';
import { CommandGroup, CommandItem } from '@/components/ui/Command';
import { THEME_OPTIONS } from '../data/data';

type CommandsOnThemeProps = {
	setOpen: (open: boolean) => void;
};

export const CommandsOnTheme = memo(
	({ setOpen }: CommandsOnThemeProps): React.JSX.Element => {
		const { setTheme } = useTheme();

		const handleThemeSelect = useCallback(
			(theme: string) => {
				setTheme(theme);
				setOpen(false);
			},
			[setTheme, setOpen],
		);

		return (
			<CommandGroup heading="Thème de l'interface :">
				{THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
					<CommandItem
						key={value}
						value={label}
						keywords={['theme', value]}
						onSelect={() => handleThemeSelect(value)}
					>
						<Icon className="size-4 text-foreground" />
						<span className="ml-2">{label}</span>
					</CommandItem>
				))}
			</CommandGroup>
		);
	},
);
