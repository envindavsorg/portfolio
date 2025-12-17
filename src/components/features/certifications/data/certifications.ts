export type Certification = {
	title: string;
	issuer: string;
	issuerLogoURL?: string;
	issuerIconName?: string;
	issueDate: string;
	credentialID: string;
	credentialURL: string;
};

export const CERTIFICATIONS: Certification[] = [
	{
		title: 'Next.js Pages Router Fundamentals',
		issuer: 'Vercel',
		issuerIconName: 'vercel',
		issueDate: '2025-10-07',
		credentialID: 'pages-router-99069-1759826128639',
		credentialURL:
			'https://nextjs.org/learn/certificate?course=pages-router&user=99069&certId=pages-router-99069-1759826128639',
	},
	{
		title: 'Next.js App Router Fundamentals',
		issuer: 'Vercel',
		issuerIconName: 'vercel',
		issueDate: '2025-10-06',
		credentialID: 'dashboard-app-99069-1759757715131',
		credentialURL:
			'https://nextjs.org/learn/certificate?course=dashboard-app&user=99069&certId=dashboard-app-99069-1759757715131',
	},
	{
		title: 'Next.js SEO Fundamentals',
		issuer: 'Vercel',
		issuerIconName: 'vercel',
		issueDate: '2025-10-03',
		credentialID: 'seo-99069-1759756935192',
		credentialURL:
			'https://nextjs.org/learn/certificate?course=seo&user=99069&certId=seo-99069-1759756935192',
	},
	{
		title: 'React Foundations for Next.js',
		issuer: 'Vercel',
		issuerIconName: 'vercel',
		issueDate: '2025-10-03',
		credentialID: 'react-foundations-99069-1759825479876',
		credentialURL:
			'https://nextjs.org/learn/certificate?course=react-foundations&user=99069&certId=react-foundations-99069-1759825479876',
	},
];
