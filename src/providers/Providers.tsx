'use client';

import { Provider as JotaiProvider } from 'jotai';
import dynamic from 'next/dynamic';
import type React from 'react';
import { FaviconSwitcher } from '@/components/favicon/FaviconSwitcher';
import { Analytics } from '@/providers/analytics/Analytics';
import ProgressProvider from '@/providers/modules/ProgressProvider';
import ThemeProvider from '@/providers/modules/ThemeProvider';
import { Compose, type Provider } from '@/providers/utils/Compose';

const Toaster = dynamic(
	() => import('@/components/overlays/Sonner').then((mod) => mod.Toaster),
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
