'use client';

import { Tabs } from '@/components/primitives/Tabs';
import type { InstallationType } from '@/hooks/use-config';
import useConfig from '@/hooks/use-config';
import { ComponentProps } from 'react';

export const CodeTabs = (props: ComponentProps<typeof Tabs>) => {
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
