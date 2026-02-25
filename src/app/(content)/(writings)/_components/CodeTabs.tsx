'use client';

import type { ComponentProps } from 'react';
import { Tabs } from '@/components/primitives/Tabs';
import type { InstallationType } from '@/hooks/useConfig';
import useConfig from '@/hooks/useConfig';

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
