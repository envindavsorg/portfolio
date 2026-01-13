import type React from 'react';
import type { SVGProps } from 'react';

export const MotionIcon = (
	props: SVGProps<SVGSVGElement>
): React.JSX.Element => (
	<svg
		height="1em"
		preserveAspectRatio="xMidYMid"
		viewBox="0 0 256 384"
		width="1em"
		xmlns="http://www.w3.org/2000/svg"
		{...props}
	>
		<title>Motion</title>
		<path
			className="fill-black dark:fill-white"
			d="M0 0h256v128H128L0 0Zm0 128h128l128 128H128v128L0 256V128Z"
		/>
	</svg>
);
