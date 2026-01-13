import type React from 'react';
import { Prose } from '@/components/ui/Typography';

interface WritingsHeadingProps {
	title: string;
	description: string;
}

const WritingsHeading = ({ title, description }: WritingsHeadingProps): React.JSX.Element => (
	<>
		<div className="screen-line-before screen-line-after px-3">
			<h1 className="font-semibold text-3xl sm:text-4xl">{title}</h1>
		</div>
		<div className="screen-line-after px-3 py-1.5">
			<Prose>{description}</Prose>
		</div>
	</>
);

WritingsHeading.displayName = 'WritingsHeading';

export { WritingsHeading };
