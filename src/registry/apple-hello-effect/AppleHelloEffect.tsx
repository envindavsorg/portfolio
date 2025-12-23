'use client';

import type { TargetAndTransition } from 'motion/react';
import { motion } from 'motion/react';
import type React from 'react';
import { cn } from '@/lib/utils';

const initialProps: TargetAndTransition = {
	pathLength: 0,
	opacity: 0,
};

const animateProps: TargetAndTransition = {
	pathLength: 1,
	opacity: 1,
};

type Props = React.ComponentProps<typeof motion.svg> & {
	speed?: number;
	onAnimationComplete?: () => void;
};

export const AppleHelloEffect = ({
	className,
	speed = 1,
	onAnimationComplete,
	...props
}: Props): React.JSX.Element => {
	const calc = (x: number) => x * speed;

	return (
		<motion.svg
			className={cn('h-20', className)}
			exit={{ opacity: 0 }}
			fill="none"
			initial={{ opacity: 1 }}
			stroke="currentColor"
			strokeWidth="14.8883"
			transition={{ duration: 0.5 }}
			viewBox="0 0 949 279"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<title>bonjour</title>

			<motion.path
				animate={animateProps}
				d="M9.19238 175.057C49.8676 160.891 77.5425 132.302 106.244 72.1453C113.638 56.6466 116.24 42.3879 116.992 31.4563C117.742 17.5437 112.034 7.57344 100.868 7.57344C89.702 7.57344 82.2578 15.5982 74.0692 32.6206C64.3918 53.0474 58.6846 77.365 55.7069 101.683C48.0146 169.529 64.1437 194.576 91.1908 194.576C113.523 194.576 127.667 174.477 129.404 147.926C130.397 125.593 120.967 108.224 104.094 100.035"
				initial={initialProps}
				style={{ strokeLinecap: 'round' }}
				transition={{
					duration: calc(1),
					ease: 'easeInOut',
					opacity: { duration: 0.5 },
				}}
			/>

			<motion.path
				animate={animateProps}
				d="M118.874 111.734C143.812 142.68 184.423 120.495 203.273 106.463C211.531 100.316 218.814 98.0498 227.667 98.0498C247.27 98.0498 262.655 112.938 262.655 140.978C262.655 171.995 243.052 195.32 218.238 195.568C196.402 195.817 182.01 177.702 183.499 150.407C185.236 120.134 203.102 98.0498 226.675 98.0498C240.074 98.0498 249.504 102.764 260.422 110.953C291.084 133.885 321.93 122.792 329.404 99.2905"
				initial={initialProps}
				style={{ strokeLinecap: 'round' }}
				transition={{
					duration: calc(0.8),
					ease: 'easeInOut',
					delay: calc(0.9),
					opacity: { duration: 0.5, delay: calc(0.9) },
				}}
			/>

			<motion.path
				animate={animateProps}
				d="M329.404 99.2905C324.689 130.804 320.719 161.822 315.756 193.335"
				initial={initialProps}
				style={{ strokeLinecap: 'round' }}
				transition={{
					duration: calc(0.4),
					ease: 'easeInOut',
					delay: calc(1.6),
					opacity: { duration: 0.3, delay: calc(1.6) },
				}}
			/>

			<motion.path
				animate={animateProps}
				d="M319.139 171.014C325.97 124.383 346.774 97.3055 371.588 97.3055C388.957 97.3055 397.89 109.216 396.402 126.09C395.161 138.745 390.943 153.385 389.95 165.792C388.709 182.913 396.65 194.576 413.896 194.576C439.794 194.576 465.633 161.934 473.137 121.545C474.468 114.384 476.406 106.586 477.295 99.0424"
				initial={initialProps}
				style={{ strokeLinecap: 'round' }}
				transition={{
					duration: calc(0.8),
					ease: 'easeInOut',
					delay: calc(1.9),
					opacity: { duration: 0.5, delay: calc(1.9) },
				}}
			/>

			<motion.path
				animate={animateProps}
				d="M477.295 99.0425C472.663 138.331 468.031 177.62 463.399 216.908C458.805 255.881 447.27 271.499 429.901 271.499C418.238 271.499 409.801 264.072 409.801 252.144C409.801 236.207 421.896 224.765 448.806 216.456C495.218 202.125 529.113 174.741 540.25 143.091C550.248 114.675 561.91 98.0499 586.228 98.0499C606.327 98.0499 622.208 112.938 622.208 140.978C622.208 171.995 602.084 195.32 576.654 195.569C554.276 195.817 539.578 177.703 541.067 150.407C542.804 120.134 561.166 98.0499 585.236 98.0499C599.131 98.0499 608.809 102.765 619.975 110.953C653.989 135.766 682.245 124.004 692.281 99.4697"
				initial={initialProps}
				style={{ strokeLinecap: 'round' }}
				transition={{
					duration: calc(1.2),
					ease: 'easeInOut',
					delay: calc(2.6),
					opacity: { duration: 0.6, delay: calc(2.6) },
				}}
			/>

			<motion.path
				animate={animateProps}
				d="M692.281 99.4697C687.994 117.599 685.12 132.293 683.593 143.211C682.324 151.152 681.53 156.611 681.22 163.31C680.81 180.929 690.693 193.583 709.801 193.583C737.593 193.583 751.402 168.855 759.775 128.3C761.777 118.601 763.959 109.344 765.725 99.5989"
				initial={initialProps}
				style={{ strokeLinecap: 'round' }}
				transition={{
					duration: calc(0.7),
					ease: 'easeInOut',
					delay: calc(3.7),
					opacity: { duration: 0.4, delay: calc(3.7) },
				}}
			/>

			<motion.path
				animate={animateProps}
				d="M765.725 99.5989C759.521 133.842 754.466 154.377 754.466 165.792C754.466 182.913 761.166 194.576 779.435 194.576C808.93 194.576 834.111 152.772 846.774 96.0648"
				initial={initialProps}
				style={{ strokeLinecap: 'round' }}
				transition={{
					duration: calc(0.6),
					ease: 'easeInOut',
					delay: calc(4.3),
					opacity: { duration: 0.4, delay: calc(4.3) },
				}}
			/>

			<motion.path
				animate={animateProps}
				d="M844.813 104.491C875.583 105.98 889.206 112.194 889.206 126.834C889.206 137.008 884.243 152.64 882.754 164.055C880.024 183.906 887.347 194.824 903.101 194.824C922.259 194.824 935.515 182.097 940.687 169.167"
				initial={initialProps}
				onAnimationComplete={onAnimationComplete}
				style={{ strokeLinecap: 'round' }}
				transition={{
					duration: calc(0.7),
					ease: 'easeInOut',
					delay: calc(4.8),
					opacity: { duration: 0.4, delay: calc(4.8) },
				}}
			/>
		</motion.svg>
	);
};
