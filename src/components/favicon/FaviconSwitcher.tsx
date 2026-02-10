'use client';

import { useTheme } from 'next-themes';
import { useEffect } from 'react';

export const FaviconSwitcher = (): null => {
	const { resolvedTheme } = useTheme();

	useEffect(() => {
		const faviconUrl =
			resolvedTheme === 'dark'
				? '/favicons/favicon-dark.ico'
				: '/favicons/favicon-light.ico';

		for (const link of document.querySelectorAll<HTMLLinkElement>(
			'link[rel="icon"]'
		)) {
			link.href = faviconUrl;
		}
	}, [resolvedTheme]);

	return null;
};
