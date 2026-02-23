import type React from 'react';
import { Divider } from '@/components/primitives/Divider';

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
