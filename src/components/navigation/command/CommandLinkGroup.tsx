import type { Icon as PhosphorIcon } from '@phosphor-icons/react/dist/lib/types';
import Image from 'next/image';
import type React from 'react';
import { memo } from 'react';
import { CommandGroup, CommandItem } from '@/components/ui/Command';
import type { CommandLinkItem } from './types/types';

type CommandLinkGroupProps = {
	heading: string;
	links: CommandLinkItem[];
	fallbackIcon?: PhosphorIcon;
	onLinkSelect: (href: string, openInNewTab?: boolean) => void;
};

export const CommandLinkGroup = memo(
	({
		heading,
		links,
		fallbackIcon: FallbackIcon,
		onLinkSelect,
	}: CommandLinkGroupProps): React.JSX.Element | null => {
		if (!links || links.length === 0) {
			return null;
		}

		return (
			<CommandGroup heading={heading}>
				{links.map((link) => {
					const LinkIcon = link.icon ?? FallbackIcon;

					return (
						<CommandItem
							key={link.href}
							keywords={link.keywords}
							value={link.title}
							onSelect={() =>
								onLinkSelect(link.href, link.openInNewTab)
							}
						>
							{link.iconImage ? (
								<Image
									alt={link.title}
									className="rounded-md"
									height={22}
									width={22}
									src={link.iconImage}
									unoptimized
								/>
							) : (
								LinkIcon && (
									<LinkIcon className="size-4 text-theme" />
								)
							)}

							<span className="ml-1">{link.title}</span>
						</CommandItem>
					);
				})}
			</CommandGroup>
		);
	},
);
