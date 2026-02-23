import type { Icon } from '@phosphor-icons/react';
import {
	BriefcaseIcon,
	EnvelopeIcon,
	FlaskIcon,
	PhoneIcon,
} from '@phosphor-icons/react/dist/ssr';
import GLOBAL_DATA from '@/content/data/global';
import { cn } from '@/lib/utils';

interface OverviewItemProps {
	icon: Icon;
	children: React.ReactNode;
}

const OVERVIEW_ROWS: OverviewItemProps[][] = [
	[
		{ icon: BriefcaseIcon, children: GLOBAL_DATA.WORK.title },
		{ icon: FlaskIcon, children: GLOBAL_DATA.WORK.experience },
	],
	[
		{ icon: PhoneIcon, children: GLOBAL_DATA.USER.phoneNumber },
		{ icon: EnvelopeIcon, children: GLOBAL_DATA.USER.emailAddress },
	],
];

const OverviewItem = ({ icon: Icon, children }: OverviewItemProps) => (
	<div className="flex items-center">
		<div className="m-2 flex aspect-square size-8 shrink-0 cursor-default items-center justify-center">
			<Icon className="size-6 text-theme" weight="duotone" />
		</div>
		<p className="w-full flex-1 border-edge border-l p-3 max-sm:text-sm">
			-- {children} --
		</p>
	</div>
);

export const OverviewContent = () => (
	<>
		{OVERVIEW_ROWS.map((row, rowIndex) => (
			<div
				className={cn(
					'screen-line-after grid grid-cols-1 sm:grid-cols-2 sm:gap-4',
					rowIndex === 0 && 'screen-line-before'
				)}
				key={rowIndex}
			>
				{row.map(({ icon, children }, itemIndex) => (
					<div
						className={cn(
							itemIndex === 0 &&
								rowIndex < OVERVIEW_ROWS.length - 1 &&
								'max-sm:screen-line-after'
						)}
						key={itemIndex}
					>
						<OverviewItem icon={icon}>{children}</OverviewItem>
					</div>
				))}
			</div>
		))}
	</>
);
