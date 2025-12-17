'use client';

import type React from 'react';
import { Tabs } from '@/components/ui/Tabs';
import type { InstallationType } from '@/hooks/use-config';
import useConfig from '@/hooks/use-config';

export const CodeTabs = (props: React.ComponentProps<typeof Tabs>) => {
	const [config, setConfig] = useConfig();

	const installationType = config.installationType || 'cli';

	return (
		<Tabs
			onValueChange={(value) => {
				setConfig((prev) => ({
					...prev,
					installationType: value as InstallationType,
				}));
			}}
			value={installationType}
			{...props}
		/>
	);
};
