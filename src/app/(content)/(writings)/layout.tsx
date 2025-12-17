import type React from 'react';
import { Divider } from '@/components/ui/Divider';

type DocsLayoutProps = Readonly<{
	children: React.ReactNode;
}>;

const DocsLayout = ({ children }: DocsLayoutProps) => (
	<div className="mx-auto min-h-svh border-edge border-x md:max-w-3xl">
		<Divider />

		{children}
	</div>
);

export default DocsLayout;
