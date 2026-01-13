import type React from 'react';
import { memo, useRef } from 'react';
import { CommandGroup, CommandItem } from '@/components/ui/Command';
import { cn } from '@/lib/utils';

interface AnimatedIconHandle {
	startAnimation?: () => void;
	stopAnimation?: () => void;
}

interface CommandLinkRowProps {
	title: string;
	url: string;
	icon?: React.ElementType;
	keywords?: string[];
	openInNewTab?: boolean;
	position: number;
	onSelect: (href: string, openInNewTab?: boolean) => void;
}

const CommandLinkRow = memo(
	({ title, url, keywords, onSelect, icon: Icon, position, openInNewTab }: CommandLinkRowProps) => {
		const iconRef = useRef<AnimatedIconHandle>(null);

		return (
			<CommandItem
				keywords={keywords}
				onMouseEnter={() => iconRef.current?.startAnimation?.()}
				onMouseLeave={() => iconRef.current?.stopAnimation?.()}
				onSelect={() => onSelect(url, openInNewTab)}
				value={title}
			>
				{Icon ? (
					<Icon ref={iconRef} size={16} />
				) : (
					<span className="font-bold text-sm text-theme">{position + 1}.</span>
				)}
				<span className={cn(Icon && 'ml-1')}>{title}</span>
			</CommandItem>
		);
	}
);

interface CommandLinkGroupProps {
	heading: string;
	links: CommandLinkItem[];
	onLinkSelect: (href: string, openInNewTab?: boolean) => void;
}

export const CommandLinkGroup = memo(
	({ heading, links, onLinkSelect }: CommandLinkGroupProps): React.JSX.Element | null => (
		<CommandGroup heading={heading}>
			{links.map(({ title, url, keywords, icon, openInNewTab }: CommandLinkItem, idx: number) => (
				<CommandLinkRow
					icon={icon}
					key={title}
					keywords={keywords}
					onSelect={onLinkSelect}
					openInNewTab={openInNewTab}
					position={idx}
					title={title}
					url={url}
				/>
			))}
		</CommandGroup>
	)
);
