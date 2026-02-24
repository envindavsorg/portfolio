import type { Metadata } from 'next';
import type React from 'react';
import { Divider } from '@/components/primitives/Divider';

export const metadata: Metadata = {
	title: {
		template: '%s | Articles, composants et outils web',
		default: 'Articles',
	},
	description:
		'Explorations techniques sur React, Next.js et TypeScript : articles, composants réutilisables et outils pour le développement web moderne.',
};

type DocsLayoutProps = Readonly<{
	children: React.ReactNode;
}>;

const WritingsLayout = ({ children }: DocsLayoutProps) => (
	<div className="mx-auto min-h-svh border-edge border-x md:max-w-3xl">
		<Divider before={false} border={false} type="half" />

		{children}
	</div>
);

export default WritingsLayout;
