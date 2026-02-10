import { memo, type RefObject, useRef } from 'react';
import { CommandItem } from '@/components/overlays/Command';
import type { CommandItemProps } from './types';

interface CommandRowProps {
	item: CommandItemProps;
	index: number;
	onSelect: (url: string, newTab?: boolean) => void;
}

export const CommandRow = memo(({ item, index, onSelect }: CommandRowProps) => {
	const iconRef = useRef<AnimatedIconHandle>(null);
	const Icon = item.icon;

	return (
		<CommandItem
			keywords={item.keywords}
			onMouseEnter={() => iconRef.current?.startAnimation?.()}
			onMouseLeave={() => iconRef.current?.stopAnimation?.()}
			onSelect={() => onSelect(item.url, item.openInNewTab)}
			value={item.title}
		>
			{Icon ? (
				<Icon ref={iconRef as RefObject<AnimatedIconHandle>} size={16} />
			) : (
				<span>{index + 1}.</span>
			)}
			<p>{item.title}</p>
		</CommandItem>
	);
});
