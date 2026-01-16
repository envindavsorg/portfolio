import { useIsClient } from '@uidotdev/usehooks';
import type React from 'react';
import { useMemo } from 'react';
import GLOBAL_DATA from '@/content/data/global';
import { cn, decodeEmail, decodePhoneNumber, formatPhoneNumber } from '@/lib/utils';

interface OverviewItemProps {
	icon: React.ElementType;
	content: React.ReactNode;
	id: string;
	className?: string;
}

const OverviewItem = ({ icon: Icon, content, id, className }: OverviewItemProps): React.JSX.Element => {
	const isClient = useIsClient();

	const displayContent = useMemo(() => {
		if (id === 'phone-number') {
			return isClient ? formatPhoneNumber(decodePhoneNumber(GLOBAL_DATA.USER.phoneNumber)) : '••••••••••';
		}

		if (id === 'email-address') {
			return isClient ? decodeEmail(GLOBAL_DATA.USER.emailAddress) : '•••••••@••••••••••••.••';
		}

		return content;
	}, [id, content, isClient]);

	return (
		<div className={cn('flex items-center gap-3 font-medium text-sm sm:gap-4', className)}>
			<div
				aria-hidden="true"
				className={cn(
					'flex size-8 shrink-0 items-center justify-center rounded-md sm:size-8',
					'border border-muted-foreground/15 ring-1 ring-edge ring-offset-1 ring-offset-background'
				)}
			>
				<Icon className="size-4 text-theme" />
			</div>

			<div>{displayContent}</div>
		</div>
	);
};

OverviewItem.displayName = 'OverviewItem';

export { OverviewItem };
