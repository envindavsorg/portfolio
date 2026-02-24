import type { ComponentType } from 'react';
import { NextJSIcon } from '@/components/blocks/icons/stack/Next';
import { ReactIcon } from '@/components/blocks/icons/stack/React';

export interface Cert {
	title: string;
	issuer: string;
	issueDate: string;
	credentialID: string;
	credentialURL: string;
	coverImageURL: string;
	icon: ComponentType<React.SVGProps<SVGSVGElement>>;
}

export const CERTS: Cert[] = [
	{
		title: 'Next.js Pages Router Fundamentals',
		issuer: 'Vercel',
		issueDate: '2025-10-07',
		credentialID: 'pages-router-99069-1759826128639',
		credentialURL:
			'https://nextjs.org/learn/certificate?course=pages-router&user=99069&certId=pages-router-99069-1759826128639',
		coverImageURL:
			'/assets/images/certifications/nextjs-pages-router-fundamentals.webp',
		icon: NextJSIcon,
	},
	{
		title: 'Next.js App Router Fundamentals',
		issuer: 'Vercel',
		issueDate: '2025-10-06',
		credentialID: 'dashboard-app-99069-1759757715131',
		credentialURL:
			'https://nextjs.org/learn/certificate?course=dashboard-app&user=99069&certId=dashboard-app-99069-1759757715131',
		coverImageURL:
			'/assets/images/certifications/nextjs-app-router-fundamentals.webp',
		icon: NextJSIcon,
	},
	{
		title: 'Next.js SEO Fundamentals',
		issuer: 'Vercel',
		issueDate: '2025-10-03',
		credentialID: 'seo-99069-1759756935192',
		credentialURL:
			'https://nextjs.org/learn/certificate?course=seo&user=99069&certId=seo-99069-1759756935192',
		coverImageURL: '/assets/images/certifications/nextjs-seo-fundamentals.webp',
		icon: NextJSIcon,
	},
	{
		title: 'React Foundations for Next.js',
		issuer: 'Vercel',
		issueDate: '2025-10-03',
		credentialID: 'react-foundations-99069-1759825479876',
		credentialURL:
			'https://nextjs.org/learn/certificate?course=react-foundations&user=99069&certId=react-foundations-99069-1759825479876',
		coverImageURL:
			'/assets/images/certifications/react-foundations-for-nextjs.webp',
		icon: ReactIcon,
	},
];
