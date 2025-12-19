'use client';

import {
	ClockClockwiseIcon,
	GitCommitIcon,
	MonitorIcon,
	PlanetIcon,
} from '@phosphor-icons/react';
import { useWindowSize } from '@uidotdev/usehooks';
import type React from 'react';
import { memo, useMemo } from 'react';
import { Panel } from '@/components/ui/Panel';
import useBrowser from '@/hooks/use-browser';
import { dayjs } from '@/lib/dayjs';

type MetadataItemProps = {
	icon: React.ElementType;
	label: string;
	value: string;
};

const MetadataItem = memo<MetadataItemProps>(({ icon: Icon, label, value }) => (
	<div className="flex items-center gap-x-3">
		<Icon className="size-5" />
		<div className="flex flex-col gap-y-0.5">
			<span className="text-muted-foreground text-xs">{label}</span>
			<p className="font-medium text-xs">{value}</p>
		</div>
	</div>
));

export type MetadataProps = {
	commit?: {
		branch: string | undefined;
		hash: string | undefined;
		update: string | undefined;
	};
};

const Metadata = ({ commit }: MetadataProps) => {
	const { name, icon: BrowserIcon } = useBrowser();
	const { width = 0, height = 0 } = useWindowSize();

	const items = useMemo(
		() => [
			{
				icon: BrowserIcon || PlanetIcon,
				label: 'Navigateur actuel :',
				value: name,
			},
			{
				icon: GitCommitIcon,
				label: 'Dernier commit :',
				value: `${commit?.hash} (${commit?.branch})`,
			},
			{
				icon: ClockClockwiseIcon,
				label: 'Mise à jour :',
				value: dayjs(commit?.update).format('ddd DD MMM YYYY'),
			},
			{
				icon: MonitorIcon,
				label: 'Résolution :',
				value: `${width}x${height} pixels`,
			},
		],
		[BrowserIcon, name, commit, width, height],
	);

	return (
		<Panel>
			<div className="grid grid-cols-2 divide-x divide-edge *:p-4 max-lg:divide-y lg:grid-cols-4">
				{items.map((item) => (
					<MetadataItem
						icon={item.icon}
						key={item.label}
						label={item.label}
						value={item.value}
					/>
				))}
			</div>
		</Panel>
	);
};

export { Metadata };
