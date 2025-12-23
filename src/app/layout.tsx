import '@/app/globals.css';
import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import type React from 'react';
import type { WebSite, WithContext } from 'schema-dts';
import ConsentManager from '@/components/manager/ConsentManager';
import { mono, sans } from '@/lib/fonts';
import { META_THEME_COLORS } from '@/lib/theme';
import { USER } from '@/lib/user';
import { cn } from '@/lib/utils';
import { Providers } from '@/providers/Providers';

const getWebSiteJsonLd = (): WithContext<WebSite> => ({
	'@context': 'https://schema.org',
	'@type': 'WebSite',
	name: USER.firstName,
	url: 'https://cuzeacflorin.fr',
	alternateName: [USER.username],
});

const darkModeScript = `
	try {
        const isDark = localStorage.theme === 'dark' || ((!('theme' in localStorage) || localStorage.theme === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches);

        if (isDark) {
            document.querySelector('meta[name="theme-color"]').setAttribute('content', '${META_THEME_COLORS.dark}')
        }

        // Change all favicon links based on theme
        const faviconUrl = isDark ? '/favicons/favicon-dark.ico' : '/favicons/favicon-light.ico';
        document.querySelectorAll('link[rel="icon"]').forEach(function(link) {
            link.href = faviconUrl;
        });
    } catch (_) {}

    try {
        if (/(Mac|iPhone|iPod|iPad)/i.test(navigator.platform)) {
            document.documentElement.classList.add('os-macos')
        }
    } catch (_) {}
`;

export const metadata: Metadata = {
	metadataBase: 'https://cuzeacflorin.fr',
	alternates: {
		canonical: '/',
	},
	title: {
		template: `%s – ${USER.firstName} ${USER.lastName}`,
		default: `${USER.firstName} – ${USER.jobTitle}`,
	},
	description: USER.bio,
	keywords: USER.keywords,
	authors: [
		{
			name: 'envindavsorg',
			url: 'https://cuzeacflorin.fr',
		},
	],
	creator: 'envindavsorg',
	openGraph: {
		siteName: `${USER.firstName} ${USER.lastName}`,
		url: '/',
		type: 'profile',
		firstName: USER.firstName,
		lastName: USER.lastName,
		username: USER.username,
		gender: USER.gender,
		images: [
			{
				url: USER.ogImage,
				width: 1200,
				height: 630,
				alt: `${USER.firstName} ${USER.lastName}`,
			},
		],
	},
	icons: {
		icon: [
			{
				url: '/favicons/favicon-light.ico',
				media: '(prefers-color-scheme: light)',
			},
			{
				url: '/favicons/favicon-dark.ico',
				media: '(prefers-color-scheme: dark)',
			},
		],
		apple: {
			url: '/apple-touch-icon.png',
			type: 'image/png',
			sizes: '180x180',
		},
	},
};

export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
	viewportFit: 'cover',
	themeColor: META_THEME_COLORS.light,
};

interface RootLayoutProps {
	children: React.ReactNode;
}

const RootLayout = ({ children }: RootLayoutProps) => (
	<html
		className={cn(
			'no-scrollbar h-full antialiased',
			sans.variable,
			mono.variable
		)}
		lang="en"
		suppressHydrationWarning
	>
		<head>
			<script
				dangerouslySetInnerHTML={{ __html: darkModeScript }}
				type="text/javascript"
			/>
			<Script src={`data:text/javascript;base64,${btoa(darkModeScript)}`} />
			<script
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(getWebSiteJsonLd()).replace(/</g, '\\u003c'),
				}}
				type="application/ld+json"
			/>
		</head>

		<body>
			<Providers>
				<ConsentManager>{children}</ConsentManager>
			</Providers>
		</body>
	</html>
);

export default RootLayout;
