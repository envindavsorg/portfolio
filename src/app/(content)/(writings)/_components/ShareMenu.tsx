'use client';

import { LinkedinLogoIcon, LinkIcon, XLogoIcon } from '@phosphor-icons/react';
import Link from 'next/link';
import { memo, useCallback, useMemo, useRef } from 'react';
import { ShareIcon } from '@/components/blocks/icons/ShareIcon';
import { XIcon } from '@/components/blocks/icons/XIcon';
import { Button } from '@/components/primitives/Button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/primitives/DropdownMenu';
import { soundManager } from '@/lib/sound-manager';
import { copyText, getAbsoluteUrl } from '@/lib/utils';

interface ShareMenuProps {
	url: string;
}

export const ShareMenu = memo(({ url }: ShareMenuProps) => {
	const absoluteUrl = useMemo(() => getAbsoluteUrl(url), [url]);
	const shareUrls = useMemo(
		() => ({
			x: `https://x.com/intent/tweet?url=${encodeURIComponent(absoluteUrl)}`,
			linkedin: `https://www.linkedin.com/sharing/share-offsite?url=${encodeURIComponent(absoluteUrl)}`,
		}),
		[absoluteUrl]
	);

	const { x, linkedin } = shareUrls;
	const handleCopy = useCallback(() => {
		copyText(absoluteUrl);
		soundManager.playToastSound();
	}, [absoluteUrl]);

	const iconShareRef = useRef<AnimatedIconHandle>(null);
	const iconXRef = useRef<AnimatedIconHandle>(null);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					className="group/toggle"
					onMouseEnter={() => {
						iconShareRef.current?.startAnimation();
						iconXRef.current?.startAnimation();
					}}
					onMouseLeave={() => {
						iconShareRef.current?.stopAnimation();
						iconXRef.current?.stopAnimation();
					}}
					size="icon"
					variant="outline"
				>
					<ShareIcon
						className="group-data-[state=open]/toggle:hidden"
						ref={iconShareRef}
					/>
					<XIcon
						className="group-data-[state=closed]/toggle:hidden"
						ref={iconXRef}
					/>
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent
				align="start"
				className="w-fit py-2 *:cursor-pointer"
				collisionPadding={8}
				onCloseAutoFocus={(event: Event) => event.preventDefault()}
				sideOffset={8}
			>
				<DropdownMenuItem className="font-medium" onClick={handleCopy}>
					<LinkIcon className="size-4 text-foreground" />
					copier le lien
				</DropdownMenuItem>

				<DropdownMenuItem asChild className="font-medium">
					<Link href={x} rel="noopener noreferrer" target="_blank">
						<XLogoIcon className="size-4 text-foreground" />
						partager sur X
					</Link>
				</DropdownMenuItem>

				<DropdownMenuItem asChild className="font-medium">
					<Link href={linkedin} rel="noopener noreferrer" target="_blank">
						<LinkedinLogoIcon className="size-4 text-foreground" />
						partager sur LinkedIn
					</Link>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
});
