import type React from 'react';

interface AnimatedDotProps {
	label?: string;
}

export const AnimatedDot = ({ label }: AnimatedDotProps): React.JSX.Element => (
	<span className="relative flex items-center justify-center">
		<span className="absolute inline-flex size-3 animate-ping rounded-full bg-theme opacity-50" />
		<span className="relative inline-flex size-2 rounded-full bg-theme" />
		{label && <span className="sr-only">{label}</span>}
	</span>
);
