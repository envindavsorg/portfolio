'use client';

import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { Tabs as Primitive } from 'radix-ui';
import {
	type ComponentProps,
	type ReactNode,
	useCallback,
	useMemo,
	useState,
} from 'react';
import useMeasure from 'react-use-measure';
import { cn } from '@/lib/utils';

export const Tabs = ({
	className,
	...props
}: ComponentProps<typeof Primitive.Root>) => (
	<Primitive.Root
		className={cn('flex flex-col gap-2', className)}
		data-slot="tabs"
		{...props}
	/>
);

export const TabsList = ({
	className,
	...props
}: ComponentProps<typeof Primitive.List>) => (
	<Primitive.List
		className={cn(
			'inline-flex h-8 w-fit items-center justify-center rounded-md bg-transparent p-0.5 text-muted-foreground',
			className
		)}
		data-slot="tabs-list"
		{...props}
	/>
);

export const TabsTrigger = ({
	className,
	...props
}: ComponentProps<typeof Primitive.Trigger>) => (
	<Primitive.Trigger
		className={cn(
			'inline-flex flex-1 cursor-pointer items-center justify-center gap-2',
			'whitespace-nowrap rounded-md px-1.5 py-1 text-sm sm:text-base',
			'data-[state=active]:text-theme',
			"[&_svg:not([class*='size-'])]:size-5 [&_svg]:pointer-events-none [&_svg]:shrink-0",
			'transition-[color] disabled:pointer-events-none disabled:opacity-50',
			'focus-visible:border-ring focus-visible:outline-1 focus-visible:outline-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
			className
		)}
		data-slot="tabs-trigger"
		{...props}
	/>
);

export const TabsContent = ({
	className,
	...props
}: ComponentProps<typeof Primitive.Content>) => (
	<Primitive.Content
		className={cn('flex-1 space-y-1 py-1 outline-none', className)}
		data-slot="tabs-content"
		{...props}
	/>
);

interface Tab {
	id: number;
	label: string;
	content: ReactNode;
}

interface TabsAnimatedProps {
	tabs: Tab[];
	onChangeAction?: () => void;
	before?: boolean;
	after?: boolean;
	className?: string;
}

const contentVariants = {
	initial: (direction: number) => ({
		x: 300 * direction,
		opacity: 0,
		filter: 'blur(4px)',
	}),
	active: {
		x: 0,
		opacity: 1,
		filter: 'blur(0px)',
	},
	exit: (direction: number) => ({
		x: -300 * direction,
		opacity: 0,
		filter: 'blur(4px)',
	}),
} as const;

const bubbleTransition = {
	type: 'spring',
	bounce: 0.19,
	duration: 0.4,
} as const;

const springTransition = {
	duration: 0.4,
	type: 'spring',
	bounce: 0.2,
} as const;

export const TabsAnimated = ({
	tabs,
	onChangeAction,
	before = false,
	after = true,
	className,
}: TabsAnimatedProps) => {
	const [activeTab, setActiveTab] = useState(0);
	const [direction, setDirection] = useState(0);
	const [isAnimating, setIsAnimating] = useState(false);
	const [ref, bounds] = useMeasure();

	const content = useMemo(
		() => tabs.find((tab) => tab.id === activeTab)?.content ?? null,
		[activeTab, tabs]
	);

	const handleTabClick = useCallback(
		(newTabId: number) => {
			if (newTabId === activeTab || isAnimating) {
				return;
			}

			setDirection(newTabId > activeTab ? 1 : -1);
			setActiveTab(newTabId);
			onChangeAction?.();
		},
		[activeTab, isAnimating, onChangeAction]
	);

	const handleAnimationStart = useCallback(() => setIsAnimating(true), []);
	const handleAnimationComplete = useCallback(() => setIsAnimating(false), []);

	return (
		<div className="flex w-full flex-col items-center">
			<div
				className={cn(
					'grid w-full cursor-pointer grid-cols-2 gap-x-3 py-3',
					className,
					before && 'screen-line-before',
					after && 'screen-line-after'
				)}
			>
				{tabs.map((tab) => {
					const isActive = activeTab === tab.id;

					return (
						<button
							className={cn(
								'relative flex items-center justify-center px-3 py-2',
								'cursor-pointer rounded-md border border-edge font-medium text-sm transition',
								'focus-visible:outline-none focus-visible:outline-1 focus-visible:ring-1',
								isActive ? 'text-theme' : 'text-foreground'
							)}
							key={tab.id}
							onClick={() => handleTabClick(tab.id)}
							style={{ WebkitTapHighlightColor: 'transparent' }}
							type="button"
						>
							{isActive && (
								<motion.span
									className="absolute inset-0 z-10 rounded-md border border-theme"
									layoutId="bubble"
									transition={bubbleTransition}
								/>
							)}
							{tab.label}
						</button>
					);
				})}
			</div>

			<MotionConfig transition={springTransition}>
				<motion.div
					animate={{ height: bounds.height }}
					className="relative mx-auto h-full w-full overflow-hidden"
					initial={false}
				>
					<div ref={ref}>
						<AnimatePresence
							custom={direction}
							mode="popLayout"
							onExitComplete={handleAnimationComplete}
						>
							<motion.div
								animate="active"
								custom={direction}
								exit="exit"
								initial="initial"
								key={activeTab}
								onAnimationComplete={handleAnimationComplete}
								onAnimationStart={handleAnimationStart}
								variants={contentVariants}
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
