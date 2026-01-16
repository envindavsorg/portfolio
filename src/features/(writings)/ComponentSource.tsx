import type React from 'react';
import { CodeCollapsibleWrapper } from '@/features/(writings)/CodeCollapsibleWrapper';

interface ComponentSourceProps {
	name: string;
	src?: string;
	title?: string;
	showLineNumbers?: boolean;
	collapsible?: boolean;
}

export const ComponentSource = ({
	className,
	collapsible = true,
	children,
}: React.ComponentProps<'div'> & ComponentSourceProps) => {
	if (!collapsible) {
		return <div className={className}>{children}</div>;
	}

	return <CodeCollapsibleWrapper className={className}>{children}</CodeCollapsibleWrapper>;
};
