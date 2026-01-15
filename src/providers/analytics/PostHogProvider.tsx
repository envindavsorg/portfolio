'use client';

import posthog from 'posthog-js';
import type React from 'react';
import { useEffect } from 'react';

interface PostHogProviderProps {
	children: React.ReactNode;
}

export const PostHogProvider = ({ children }: PostHogProviderProps): React.JSX.Element => {
	useEffect(() => {
		console.log(process.env.NEXT_PUBLIC_POSTHOG_KEY);

		// Initialize PostHog only once when component mounts
		if (typeof window !== 'undefined' && !posthog.__loaded) {
			posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY ?? '', {
				api_host: '/ingest',
				ui_host: 'https://eu.posthog.com',
				defaults: '2025-05-24',
				capture_exceptions: true,
				debug: process.env.NODE_ENV === 'development',
				loaded: () => {
					if (process.env.NODE_ENV === 'development') {
						console.log('[PostHog] Initialized successfully');
					}
				},
			});
		}
	}, []);

	return <>{children}</>;
};
