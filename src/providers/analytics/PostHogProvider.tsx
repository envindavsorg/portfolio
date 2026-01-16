'use client';

import posthog from 'posthog-js';
import type React from 'react';
import { useEffect } from 'react';

declare global {
	interface Window {
		__posthog_error_logged?: boolean;
	}
}

interface PostHogProviderProps {
	children: React.ReactNode;
}

export const PostHogProvider = ({ children }: PostHogProviderProps): React.JSX.Element => {
	useEffect(() => {
		if (typeof window !== 'undefined' && !posthog.__loaded) {
			posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY ?? '', {
				api_host: '/ingest',
				ui_host: 'https://eu.posthog.com',
				defaults: '2025-05-24',
				capture_exceptions: true,
				debug: false,
				disable_external_dependency_loading: true,
				loaded: () => {
					if (process.env.NODE_ENV === 'development') {
						console.log('[PostHog] Initialized successfully');
					}
				},
				on_request_error: (_error) => {
					if (process.env.NODE_ENV === 'development' && !window.__posthog_error_logged) {
						console.warn('[PostHog] Requests blocked (likely by ad blocker). Analytics disabled.');
						window.__posthog_error_logged = true;
					}
				},
			});
		}
	}, []);

	return <>{children}</>;
};
