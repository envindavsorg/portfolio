'use client';

import Link from 'next/link';
import { memo, type ReactNode, useCallback, useMemo, useRef } from 'react';
import { toast } from 'sonner';
import { LinkedinIcon } from '@/components/blocks/icons/LinkedInIcon';
import { LinkIcon } from '@/components/blocks/icons/LinkIcon';
import { ShareIcon } from '@/components/blocks/icons/ShareIcon';
import { TwitterIcon } from '@/components/blocks/icons/TwitterIcon';
import { XIcon } from '@/components/blocks/icons/XIcon';
import { Button } from '@/components/primitives/Button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/primitives/DropdownMenu';
import { copyText, getAbsoluteUrl } from '@/lib/functions';
import { soundManager } from '@/lib/sound-manager';

const preventAutoFocus = (event: Event) => event.preventDefault();

interface AnimatedMenuItemProps {
	icon: React.ForwardRefExoticComponent<AnimatedIconProps & React.RefAttributes<AnimatedIconHandle>>;
	children: ReactNode;
	href?: string;
	onClick?: () => void;
}

const AnimatedMenuItem = ({ icon: Icon, children, href, onClick }: AnimatedMenuItemProps) => {
	const iconRef = useRef<AnimatedIconHandle>(null);

	const handleMouseEnter = useCallback(() => {
		iconRef.current?.startAnimation();
	}, []);

	const handleMouseLeave = useCallback(() => {
		iconRef.current?.stopAnimation();
	}, []);

	const content = (
		<>
			<Icon ref={iconRef} />
			{children}
		</>
	);

	if (href) {
		return (
			<DropdownMenuItem asChild onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
				<Link href={href} rel="noopener noreferrer" target="_blank">
					{content}
				</Link>
			</DropdownMenuItem>
		);
	}

	return (
		<DropdownMenuItem onClick={onClick} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
			{content}
		</DropdownMenuItem>
	);
};

interface ShareMenuProps {
	url: string;
}

export const ShareMenu = memo(({ url }: ShareMenuProps) => {
	const absoluteUrl = useMemo(() => getAbsoluteUrl(url), [url]);

	const shareUrls = useMemo(() => {
		const encoded = encodeURIComponent(absoluteUrl);
		return {
			x: `https://x.com/intent/tweet?url=${encoded}`,
			linkedin: `https://www.linkedin.com/sharing/share-offsite?url=${encoded}`,
		};
	}, [absoluteUrl]);

	const handleCopy = useCallback(() => {
		copyText(absoluteUrl);

		toast.success('', {
			id: 'copy-hint',
			description: 'lien copié avec succès !',
			duration: 3000,
		});

		soundManager.playToastSound();
	}, [absoluteUrl]);

	const iconShareRef = useRef<AnimatedIconHandle>(null);
	const iconXRef = useRef<AnimatedIconHandle>(null);

	const handleMouseEnter = useCallback(() => {
		iconShareRef.current?.startAnimation();
		iconXRef.current?.startAnimation();
	}, []);

	const handleMouseLeave = useCallback(() => {
		iconShareRef.current?.stopAnimation();
		iconXRef.current?.stopAnimation();
	}, []);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					className="group/toggle"
					onMouseEnter={handleMouseEnter}
					onMouseLeave={handleMouseLeave}
					size="icon"
					variant="outline"
				>
					<ShareIcon className="group-data-[state=open]/toggle:hidden" ref={iconShareRef} />
					<XIcon className="group-data-[state=closed]/toggle:hidden" ref={iconXRef} />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="start"
				className="w-fit py-2 *:cursor-pointer"
				collisionPadding={8}
				onCloseAutoFocus={preventAutoFocus}
				sideOffset={8}
			>
				<AnimatedMenuItem icon={LinkIcon} onClick={handleCopy}>
					copier le lien
				</AnimatedMenuItem>
				<AnimatedMenuItem href={shareUrls.x} icon={TwitterIcon}>
					partager sur X
				</AnimatedMenuItem>
				<AnimatedMenuItem href={shareUrls.linkedin} icon={LinkedinIcon}>
					partager sur LinkedIn
				</AnimatedMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
});
