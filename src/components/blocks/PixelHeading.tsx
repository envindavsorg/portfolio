'use client';

import {
	type ComponentProps,
	type FocusEvent,
	type KeyboardEvent,
	type MouseEvent,
	type ReactElement,
	type ReactNode,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import { cn } from '@/lib/utils';

const PIXEL_FONTS = [
	'font-pixel-square',
	'font-pixel-grid',
	'font-pixel-circle',
	'font-pixel-triangle',
	'font-pixel-line',
] as const;

const FONT_LABELS = ['Square', 'Grid', 'Circle', 'Triangle', 'Line'] as const;
const FONT_COUNT = PIXEL_FONTS.length;

const PREFIX_FONT_MAP: Record<string, string> = {
	square: 'font-pixel-square',
	grid: 'font-pixel-grid',
	circle: 'font-pixel-circle',
	triangle: 'font-pixel-triangle',
	line: 'font-pixel-line',
};

const ISOLATE_FONT_MAP: Record<string, string> = {
	sans: 'font-sans',
	mono: 'font-mono',
};

const resolveIsolateFont = (value: string): string =>
	ISOLATE_FONT_MAP[value] ?? value;

const PHI = (1 + Math.sqrt(5)) / 2;

const TICK_MS = 50;

const goldenBase = (index: number): number =>
	Math.floor((index * PHI * FONT_COUNT) % FONT_COUNT);

const pseudoRandom = (tick: number, index: number): number =>
	((tick * 2_654_435_761 + index * 340_573_321) >>> 0) % FONT_COUNT;

function extractText(children: ReactNode): string {
	if (typeof children === 'string') {
		return children;
	}
	if (typeof children === 'number') {
		return String(children);
	}
	if (Array.isArray(children)) {
		return children.map(extractText).join('');
	}
	if (
		children !== null &&
		children !== undefined &&
		typeof children === 'object' &&
		'props' in children
	) {
		return extractText(
			(children as ReactElement<{ children?: ReactNode }>).props.children
		);
	}
	return '';
}

export type PixelHeadingMode = 'uniform' | 'multi' | 'wave' | 'random';

export interface PixelHeadingProps extends ComponentProps<'h1'> {
	as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
	cycleInterval?: number;
	defaultFontIndex?: number;
	onFontIndexChange?: (index: number) => void;
	showLabel?: boolean;
	mode?: PixelHeadingMode;
	staggerDelay?: number;
	autoPlay?: boolean;
	prefix?: string;
	prefixFont?: 'square' | 'grid' | 'circle' | 'triangle' | 'line' | 'none';
	isolate?: Record<string, string>;
}

export const PixelHeading = ({
	children,
	as: Tag = 'h1',
	className,
	cycleInterval = 150,
	defaultFontIndex = 0,
	onFontIndexChange,
	showLabel = false,
	mode = 'multi',
	staggerDelay = 50,
	autoPlay = true,
	prefix,
	prefixFont = 'none',
	isolate,
	onMouseEnter,
	onMouseLeave,
	onFocus,
	onBlur,
	onKeyDown,
	...props
}: PixelHeadingProps) => {
	const text = useMemo(() => extractText(children), [children]);

	const [msElapsed, setMsElapsed] = useState(0);
	const [isActive, setIsActive] = useState(false);
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const prevUniformIndex = useRef(defaultFontIndex);

	useEffect(() => {
		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		};
	}, []);

	useEffect(() => {
		if (!autoPlay) {
			return;
		}

		setIsActive(true);
		setMsElapsed(0);
		intervalRef.current = setInterval(() => {
			setMsElapsed((prev) => prev + TICK_MS);
		}, TICK_MS);

		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
		};
	}, [autoPlay]);

	const charFonts = useMemo(() => {
		const fonts: number[] = [];
		let vi = 0;
		for (const char of text) {
			if (char === ' ') {
				fonts.push(-1);
				continue;
			}
			switch (mode) {
				case 'uniform': {
					const cycles = Math.floor(msElapsed / cycleInterval);
					const idx = (defaultFontIndex + cycles) % FONT_COUNT;
					fonts.push(idx);
					break;
				}
				case 'multi': {
					const base = goldenBase(vi);
					const charMs = Math.max(0, msElapsed - vi * staggerDelay);
					const cycles = Math.floor(charMs / cycleInterval);
					fonts.push((base + cycles) % FONT_COUNT);
					break;
				}
				case 'wave': {
					const charMs = Math.max(0, msElapsed - vi * staggerDelay);
					const cycles = Math.floor(charMs / cycleInterval);
					fonts.push((vi + cycles) % FONT_COUNT);
					break;
				}
				case 'random': {
					const charMs = Math.max(0, msElapsed - vi * staggerDelay);
					const cycles = Math.floor(charMs / cycleInterval);
					fonts.push(cycles > 0 ? pseudoRandom(cycles, vi) : goldenBase(vi));
					break;
				}
				default: {
					fonts.push(defaultFontIndex);
					break;
				}
			}
			vi++;
		}
		return fonts;
	}, [text, mode, msElapsed, cycleInterval, staggerDelay, defaultFontIndex]);

	useEffect(() => {
		if (mode !== 'uniform') {
			return;
		}
		const idx = charFonts.find((f) => f !== -1) ?? defaultFontIndex;
		if (idx !== prevUniformIndex.current) {
			prevUniformIndex.current = idx;
			onFontIndexChange?.(idx);
		}
	}, [charFonts, mode, defaultFontIndex, onFontIndexChange]);

	const activeLabel = useMemo(() => {
		if (mode === 'uniform') {
			const idx = charFonts.find((f) => f !== -1) ?? 0;
			return FONT_LABELS[idx];
		}
		const modeLabels: Record<PixelHeadingMode, string> = {
			uniform: '',
			multi: 'Multi',
			wave: 'Wave',
			random: 'Random',
		};
		return modeLabels[mode];
	}, [mode, charFonts]);

	const startCycling = useCallback(() => {
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}
		setIsActive(true);
		setMsElapsed(0);
		intervalRef.current = setInterval(() => {
			setMsElapsed((prev) => prev + TICK_MS);
		}, TICK_MS);
	}, []);

	const stopCycling = useCallback(() => {
		if (autoPlay) {
			setIsActive(true);
			return;
		}
		setIsActive(false);
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}
	}, [autoPlay]);

	const handleMouseEnter = useCallback(
		(event: MouseEvent<HTMLHeadingElement>) => {
			startCycling();
			onMouseEnter?.(event);
		},
		[startCycling, onMouseEnter]
	);

	const handleMouseLeave = useCallback(
		(event: MouseEvent<HTMLHeadingElement>) => {
			stopCycling();
			onMouseLeave?.(event);
		},
		[stopCycling, onMouseLeave]
	);

	const handleFocus = useCallback(
		(event: FocusEvent<HTMLHeadingElement>) => {
			startCycling();
			onFocus?.(event);
		},
		[startCycling, onFocus]
	);

	const handleBlur = useCallback(
		(event: FocusEvent<HTMLHeadingElement>) => {
			stopCycling();
			onBlur?.(event);
		},
		[stopCycling, onBlur]
	);

	const handleKeyDown = useCallback(
		(event: KeyboardEvent<HTMLHeadingElement>) => {
			if (event.key === 'Enter' || event.key === ' ') {
				event.preventDefault();
				setMsElapsed((prev) => prev + cycleInterval);
			}
			onKeyDown?.(event);
		},
		[cycleInterval, onKeyDown]
	);

	const uniformIdx =
		mode === 'uniform'
			? (charFonts.find((f) => f !== -1) ?? defaultFontIndex)
			: 0;

	return (
		<div
			className="inline-flex flex-col items-start gap-2"
			data-slot="pixel-heading"
		>
			<Tag
				aria-label={prefix ? `${prefix} ${text}` : text}
				className={cn(
					'cursor-default select-none text-[28px] sm:text-5xl',
					'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
					mode === 'uniform' && PIXEL_FONTS[uniformIdx],
					className
				)}
				data-mode={mode}
				data-state={isActive ? 'active' : 'idle'}
				onBlur={handleBlur}
				onFocus={handleFocus}
				onKeyDown={handleKeyDown}
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
				tabIndex={0}
				{...props}
			>
				{prefix && (
					<>
						{isolate ? (
							prefix.split('').map((char, i) => (
								<span
									aria-hidden
									className={cn(
										prefixFont !== 'none'
											? PREFIX_FONT_MAP[prefixFont]
											: undefined,
										isolate[char]
											? resolveIsolateFont(isolate[char])
											: undefined
									)}
									key={`p${i}`}
								>
									{char}
								</span>
							))
						) : (
							<span
								aria-hidden
								className={
									prefixFont !== 'none'
										? PREFIX_FONT_MAP[prefixFont]
										: undefined
								}
							>
								{prefix}
							</span>
						)}
						<span> </span>
					</>
				)}

				{mode === 'uniform'
					? children
					: text.split('').map((char, i) =>
							char === ' ' ? (
								<span key={i}> </span>
							) : isolate?.[char] ? (
								<span
									aria-hidden
									className={resolveIsolateFont(isolate[char])}
									key={i}
								>
									{char}
								</span>
							) : (
								<span aria-hidden className={PIXEL_FONTS[charFonts[i]]} key={i}>
									{char}
								</span>
							)
						)}
			</Tag>
			{showLabel && (
				<output
					aria-live="polite"
					className={cn(
						'text-muted-foreground text-xs uppercase tracking-widest transition-opacity duration-200',
						isActive || autoPlay ? 'opacity-100' : 'opacity-0'
					)}
					data-slot="pixel-heading-label"
				>
					{activeLabel}
				</output>
			)}
		</div>
	);
};
