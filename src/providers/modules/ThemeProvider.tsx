'use client';

import { ThemeProvider as AppThemeProvider } from 'next-themes';
import type React from 'react';

type AppThemeProviderProps = {
	children: React.ReactNode;
};

const ThemeProvider = ({
	children,
	...props
}: AppThemeProviderProps): React.JSX.Element => (
	<AppThemeProvider
		attribute="class"
		defaultTheme="system"
		disableTransitionOnChange
		enableColorScheme
		enableSystem
		storageKey="theme"
		{...props}
	>
		{children}
	</AppThemeProvider>
);

export default ThemeProvider;
