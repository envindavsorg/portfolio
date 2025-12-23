'use client';

import { AppProgressProvider } from '@bprogress/next';
import type React from 'react';

type AppProgressProviderProps = {
	children: React.ReactNode;
};

const ProgressProvider = ({
	children,
	...props
}: AppProgressProviderProps): React.JSX.Element => (
	<AppProgressProvider
		color="var(--color-theme)"
		delay={500}
		height="2px"
		options={{
			showSpinner: false,
		}}
		{...props}
	>
		{children}
	</AppProgressProvider>
);

export default ProgressProvider;
