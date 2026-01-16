'use client';

import type React from 'react';
import { Panel, PanelContent } from '@/components/ui/Panel';
import GLOBAL_DATA from '@/content/data/global';
import { OverviewItem } from './OverviewItem';

const Overview = (): React.JSX.Element => (
	<Panel>
		<PanelContent className="grid grid-cols-6 gap-3 sm:gap-4">
			{GLOBAL_DATA.OVERVIEW.content.map((item) => (
				<OverviewItem key={item.id} {...item} />
			))}
		</PanelContent>
	</Panel>
);

Overview.displayName = 'Overview';

export { Overview };
