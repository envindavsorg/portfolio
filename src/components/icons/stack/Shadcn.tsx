import type React from 'react';
import type { SVGProps } from 'react';

export const ShadcnIcon = (
	props: SVGProps<SVGSVGElement>
): React.JSX.Element => (
	<svg
		height="1em"
		viewBox="0 0 256 256"
		width="1em"
		xmlns="http://www.w3.org/2000/svg"
		{...props}
	>
		<title>Shadcn</title>
		<path d="M0 0h256v256H0z" fill="none" />
		<path
			className="stroke-foreground"
			d="M208 128l-80 80M192 40L40 192"
			fill="none"
			strokeLinecap="round"
			strokeWidth={25}
		/>
	</svg>
);
