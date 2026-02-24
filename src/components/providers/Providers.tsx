'use client';

import { Provider as JotaiProvider } from 'jotai';
import dynamic from 'next/dynamic';
import type React from 'react';
import { FaviconSwitcher } from '@/components/composites/FaviconSwitcher';
import { Analytics } from './analytics/Analytics';
import ProgressProvider from './modules/ProgressProvider';
import ThemeProvider from './modules/ThemeProvider';
import { Compose, type Provider } from './utils/Compose';

const Toaster = dynamic(
	() => import('@/components/primitives/Sonner').then((mod) => mod.Toaster),
	{ ssr: false }
);

const AppProviders: Provider = Compose(
	JotaiProvider,
	ThemeProvider,
	ProgressProvider
);

interface ProvidersProps {
	children: React.ReactNode;
}

export const Providers = ({ children }: ProvidersProps) => (
	<AppProviders>
		<FaviconSwitcher />
		{children}
		<Toaster />

		{process.env.NODE_ENV === 'production' && <Analytics />}
	</AppProviders>
);
