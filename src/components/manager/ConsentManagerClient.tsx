'use client';

import { ClientSideOptionsProvider } from '@c15t/nextjs/client';
import type React from 'react';

interface ConsentManagerClientProps {
	children: React.ReactNode;
}

export const ConsentManagerClient = ({
	children,
}: ConsentManagerClientProps) => (
	<ClientSideOptionsProvider>{children}</ClientSideOptionsProvider>
);
