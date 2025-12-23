'use client';

import {
	ExportIcon,
	LinkedinLogoIcon,
	LinkIcon,
	XIcon,
	XLogoIcon,
} from '@phosphor-icons/react';
import Link from 'next/link';
import posthog from 'posthog-js';
import type React from 'react';
import { memo, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { soundManager } from '@/lib/sound-manager';
import copyText from '@/lib/utils/copy';
import { getAbsoluteUrl } from '@/lib/utils/url';

interface ShareMenuProps {
	url: string;
}

export const ShareMenu = memo(({ url }: ShareMenuProps): React.JSX.Element => {
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
		toast.success('Lien copié dans le presse-papier !');
		posthog.capture('blog_link_copied', {
			url: absoluteUrl,
		});
	}, [absoluteUrl]);

	const handleShare = useCallback(
		(platform: 'x' | 'linkedin') => {
			posthog.capture('blog_article_shared', {
				platform,
				url: absoluteUrl,
			});
		},
		[absoluteUrl]
	);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					className="group/toggle border dark:inset-shadow-[1px_1px_1px,0px_0px_2px] dark:inset-shadow-white/15 dark:border-0"
					size="icon"
					variant="outline"
				>
					<ExportIcon className="group-data-[state=open]/toggle:hidden" />
					<XIcon className="group-data-[state=closed]/toggle:hidden" />
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
					Copier le lien
				</DropdownMenuItem>

				<DropdownMenuItem asChild className="font-medium">
					<Link
						href={x}
						onClick={() => handleShare('x')}
						rel="noopener noreferrer"
						target="_blank"
					>
						<XLogoIcon className="size-4 text-foreground" />
						Partager sur X
					</Link>
				</DropdownMenuItem>

				<DropdownMenuItem asChild className="font-medium">
					<Link
						href={linkedin}
						onClick={() => handleShare('linkedin')}
						rel="noopener noreferrer"
						target="_blank"
					>
						<LinkedinLogoIcon className="size-4 text-foreground" />
						Partager sur LinkedIn
					</Link>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
});
