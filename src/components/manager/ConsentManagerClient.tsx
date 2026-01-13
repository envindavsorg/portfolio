'use client';

import { ClientSideOptionsProvider } from '@c15t/nextjs/client';
import { posthog } from 'posthog-js';
import type React from 'react';

interface ConsentManagerClientProps {
	children: React.ReactNode;
}

export const ConsentManagerClient = ({ children }: ConsentManagerClientProps): React.JSX.Element => (
	<ClientSideOptionsProvider
		callbacks={{
			onConsentSet({ preferences }) {
				if (preferences.measurement) {
					posthog.opt_in_capturing();
				} else {
					posthog.opt_out_capturing();
				}
			},
		}}
	>
		{children}
	</ClientSideOptionsProvider>
);
