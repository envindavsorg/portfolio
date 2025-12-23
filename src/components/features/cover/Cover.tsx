'use client';

import { DownloadIcon } from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'motion/react';
import { useTheme } from 'next-themes';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSeparator,
	ContextMenuTrigger,
} from '@/components/ui/ContextMenu';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { cn } from '@/lib/utils';
import { downloadFile } from '@/lib/utils/download';
import {
	GREETINGS,
	GREETINGS_CONFIG,
	GREETINGS_FILE_TYPES,
	GREETINGS_MAP,
	variants,
} from './constants/constants';
import type { Greeting, GreetingId } from './types/types';

type CoverProps = {
	loop?: boolean;
	capture?: boolean;
};

export const Cover = ({
	loop = true,
	capture = false,
}: CoverProps): React.JSX.Element => {
	const { resolvedTheme } = useTheme();
	const [currentIndex, setCurrentIndex] = useState(0);
	const [shouldAdvance, setShouldAdvance] = useState(false);
	const [activeTab, setActiveTab] = useState<GreetingId>(
		GREETINGS_CONFIG[0].id
	);
	const [direction, setDirection] = useState(0);

	useEffect(() => {
		if (!shouldAdvance) {
			return;
		}

		const timer = setTimeout(() => {
			setCurrentIndex((prev) => (prev + 1) % GREETINGS.length);
			setShouldAdvance(false);
		}, 2000);

		return () => clearTimeout(timer);
	}, [shouldAdvance]);

	const handleAnimationComplete = useCallback(() => {
		if (!loop && currentIndex === GREETINGS.length - 1) {
			return;
		}

		setShouldAdvance(true);
	}, [loop, currentIndex]);

	const handleTabChange = (newTabId: string) => {
		const oldIndex = GREETINGS_CONFIG.findIndex(
			(item) => item.id === activeTab
		);
		const newIndex = GREETINGS_CONFIG.findIndex((item) => item.id === newTabId);

		setDirection(newIndex > oldIndex ? 1 : -1);
		setActiveTab(newTabId as GreetingId);
	};

	const activeData = GREETINGS_CONFIG.find((config) => config.id === activeTab);
	const currentGreeting: Greeting = GREETINGS[currentIndex];
	const { Component, className } = GREETINGS_MAP[currentGreeting];

	return (
		<ContextMenu>
			<ContextMenuTrigger asChild>
				<div
					className={cn(
						'flex select-none items-center justify-center border-edge border-x text-foreground',
						'screen-line-before screen-line-after aspect-2/1 before:-top-px after:-bottom-px sm:aspect-3/1',
						'bg-[radial-gradient(var(--pattern-foreground)_1px,transparent_0)]',
						'bg-black/0.75 bg-center bg-size-[10px_10px] dark:bg-white/0.75',
						'[--pattern-foreground:var(--color-zinc-950)]/5 dark:[--pattern-foreground:var(--color-white)]/5'
					)}
				>
					<AnimatePresence mode="wait">
						<Component
							capture={capture}
							className={className}
							key={currentGreeting}
							onAnimationComplete={handleAnimationComplete}
							speed={1}
							strokeWidth={15}
						/>
					</AnimatePresence>
				</div>
			</ContextMenuTrigger>

			<ContextMenuContent>
				<Tabs onValueChange={handleTabChange} value={activeTab}>
					<TabsList>
						{GREETINGS_CONFIG.map(({ id, flag: Flag }) => (
							<TabsTrigger key={id} value={id}>
								<Flag />
							</TabsTrigger>
						))}
					</TabsList>

					<div className="overflow-hidden">
						<AnimatePresence custom={direction} initial={false} mode="wait">
							{activeData && (
								<motion.div
									animate="center"
									custom={direction}
									exit="exit"
									initial="enter"
									key={activeData.id}
									transition={{
										duration: 0.15,
										ease: 'easeOut',
									}}
									variants={variants}
								>
									{GREETINGS_FILE_TYPES.map(({ type, Icon, getLabel }) => (
										<ContextMenuItem
											key={type}
											onClick={() => {
												const filename = `${activeData.asset}-${resolvedTheme}.${type}`;
												downloadFile(
													`/assets/${activeData.asset}/${type}/${filename}`,
													filename
												);
											}}
										>
											<Icon className="text-theme" />
											<p>{getLabel(activeData.label)}</p>
										</ContextMenuItem>
									))}

									<ContextMenuSeparator />

									<ContextMenuItem
										onClick={() =>
											downloadFile('/assets/all-effects.zip', 'all-effects.zip')
										}
									>
										<DownloadIcon className="text-theme" />
										<p>{activeData.label.all}</p>
									</ContextMenuItem>
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				</Tabs>
			</ContextMenuContent>
		</ContextMenu>
	);
};
