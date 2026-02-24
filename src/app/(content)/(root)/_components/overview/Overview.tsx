'use client';

import { Panel } from '@/components/primitives/Panel';
import { OverviewContent } from './OverviewContent';

export const Overview = () => (
	<Panel className="relative py-4">
		<div className="pointer-events-none absolute inset-0 -z-1 grid grid-cols-1 gap-4 max-sm:hidden sm:grid-cols-2">
			<div className="border-edge border-r" />
			<div className="border-edge border-l" />
		</div>

		<OverviewContent />
	</Panel>
);
