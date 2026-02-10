import { useCommandState } from 'cmdk';
import { memo } from 'react';
import { Kbd, KbdGroup } from '@/components/Kbd';
import { Separator } from '@/components/ui/Separator';
import { LABELS } from './content';
import type { CommandKind } from './types';

interface CommandFooterProps {
	kindMap: Map<string, CommandKind>;
}

export const CommandFooter = memo(({ kindMap }: CommandFooterProps) => {
	const kind = useCommandState((state) => kindMap.get(state.value) ?? 'page');

	return (
		<>
			<div className="h-12 w-full" />

			<div className="absolute inset-x-0 bottom-0 flex h-12 items-center justify-end gap-x-4 border-input border-t px-4">
				<KbdGroup>
					<span className="text-foreground text-xs">{LABELS[kind]}</span>
					<Kbd>↵</Kbd>
				</KbdGroup>

				<Separator
					className="data-[orientation=vertical]:h-4"
					orientation="vertical"
				/>

				<KbdGroup>
					<span className="text-destructive text-xs">Fermer</span>
					<Kbd>␛</Kbd>
				</KbdGroup>
			</div>
		</>
	);
});
