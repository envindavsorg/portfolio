'use client';

import { useIsClient } from '@uidotdev/usehooks';
import type React from 'react';
import { useMemo } from 'react';
import { Panel, PanelContent } from '@/components/ui/Panel';
import { USER } from '@/features/root/data/user';
import { cn } from '@/lib/utils';
import {
	decodeEmail,
	decodePhoneNumber,
	formatPhoneNumber,
} from '@/utils/string';

type OverviewItemProps = {
	icon: React.ElementType;
	content: React.ReactNode;
	id: string;
	className?: string;
};

const OverviewItem = ({
	icon: Icon,
	content,
	id,
	className,
}: OverviewItemProps): React.JSX.Element => {
	const isClient = useIsClient();

	const displayContent = useMemo(() => {
		if (id === 'phone-number') {
			return isClient
				? formatPhoneNumber(decodePhoneNumber(USER.phoneNumber))
				: '••••••••••';
		}

		if (id === 'email-address') {
			return isClient
				? decodeEmail(USER.email)
				: '•••••••@••••••••••••.••';
		}

		return content;
	}, [id, content, isClient]);

	return (
		<div
			className={cn(
				'flex items-center gap-3 font-mono text-sm sm:gap-4',
				className,
			)}
		>
			<div
				aria-hidden="true"
				className={cn(
					'flex size-7 shrink-0 items-center justify-center rounded-md sm:size-8',
					'border border-muted-foreground/15',
					'ring-1 ring-edge ring-offset-1 ring-offset-background',
				)}
			>
				<Icon className="size-4 text-theme sm:size-5" />
			</div>

			<div>{displayContent}</div>
		</div>
	);
};

export const Overview = (): React.JSX.Element => (
	<Panel>
		<PanelContent className="grid grid-cols-6 gap-3 sm:gap-4">
			{USER.overview.map((item) => (
				<OverviewItem key={item.id} {...item} />
			))}
		</PanelContent>
	</Panel>
);
