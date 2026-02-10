'use client';

import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { type ReactNode, useMemo, useState } from 'react';
import useMeasure from 'react-use-measure';
import { cn } from '@/lib/utils';

interface Tab {
	id: number;
	label: string;
	content: ReactNode;
}

interface OgImageSectionProps {
	tabs: Tab[];
	onChangeAction?: () => void;
}

export const DirectionAwareTabs = ({
	tabs,
	onChangeAction,
}: OgImageSectionProps) => {
	const [activeTab, setActiveTab] = useState(0);
	const [direction, setDirection] = useState(0);
	const [isAnimating, setIsAnimating] = useState(false);
	const [ref, bounds] = useMeasure();

	const content = useMemo(() => {
		const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content;
		return activeTabContent || null;
	}, [activeTab, tabs]);

	const handleTabClick = (newTabId: number) => {
		if (newTabId !== activeTab && !isAnimating) {
			const newDirection = newTabId > activeTab ? 1 : -1;
			setDirection(newDirection);
			setActiveTab(newTabId);
			onChangeAction ? onChangeAction() : null;
		}
	};

	const variants = {
		initial: (variantDirection: number) => ({
			x: 300 * variantDirection,
			opacity: 0,
			filter: 'blur(4px)',
		}),
		active: {
			x: 0,
			opacity: 1,
			filter: 'blur(0px)',
		},
		exit: (variantDirection: number) => ({
			x: -300 * variantDirection,
			opacity: 0,
			filter: 'blur(4px)',
		}),
	};

	return (
		<div className="flex w-full flex-col items-center">
			<div className="screen-line-after grid w-full cursor-pointer grid-cols-2 gap-x-3 py-3">
				{tabs.map((tab) => (
					<button
						className={cn(
							'relative flex items-center justify-center gap-x-2 rounded-md border px-3.5 py-2 font-medium text-sm transition focus-visible:outline-none focus-visible:outline-1 focus-visible:ring-1',
							'cursor-pointer',
							activeTab === tab.id
								? 'text-theme'
								: 'text-foreground hover:text-muted-foreground'
						)}
						key={tab.id}
						onClick={() => handleTabClick(tab.id)}
						style={{ WebkitTapHighlightColor: 'transparent' }}
						type="button"
					>
						{activeTab === tab.id && (
							<motion.span
								className="absolute inset-0 z-10 rounded-md border border-theme"
								layoutId="bubble"
								transition={{
									type: 'spring',
									bounce: 0.19,
									duration: 0.4,
								}}
							/>
						)}

						{tab.label}
					</button>
				))}
			</div>

			<MotionConfig transition={{ duration: 0.4, type: 'spring', bounce: 0.2 }}>
				<motion.div
					animate={{ height: bounds.height }}
					className="relative mx-auto h-full w-full overflow-hidden"
					initial={false}
				>
					<div ref={ref}>
						<AnimatePresence
							custom={direction}
							mode="popLayout"
							onExitComplete={() => setIsAnimating(false)}
						>
							<motion.div
								animate="active"
								custom={direction}
								exit="exit"
								initial="initial"
								key={activeTab}
								onAnimationComplete={() => setIsAnimating(false)}
								onAnimationStart={() => setIsAnimating(true)}
								variants={variants}
							>
								{content}
							</motion.div>
						</AnimatePresence>
					</div>
				</motion.div>
			</MotionConfig>
		</div>
	);
};
