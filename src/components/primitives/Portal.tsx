'use client';

import { Root } from '@radix-ui/react-portal';
import {
	AnimatePresence,
	type Easing,
	type HTMLMotionProps,
	motion,
	type Transition,
} from 'motion/react';
import {
	createContext,
	forwardRef,
	type HTMLAttributes,
	type PropsWithChildren,
	useCallback,
	useContext,
	useId,
	useMemo,
	useRef,
	useState,
} from 'react';
import { RemoveScroll } from 'react-remove-scroll';
import useDelay, { useFnDelay } from '@/hooks/useDelay';
import { cn } from '@/lib/utils';
import { TextAnimate } from '../blocks/TextAnimate';
import { Eye } from '../motion/Eye';
import { X } from '../motion/X';
import { Button } from './Button';

const Z_INDEX = 1000;
const DEFAULT_DURATION = 0.5;
const DEFAULT_EASE = [0.7, 0, 0.6, 0.917] as Easing;

const DEFAULT_TRANSITION: Transition & {
	duration: number;
	layout: { duration: number };
} = {
	ease: DEFAULT_EASE,
	duration: DEFAULT_DURATION,
	layout: {
		ease: DEFAULT_EASE,
		duration: DEFAULT_DURATION,
	},
};

const createDurationVariables = (duration: number) => {
	return {
		['--dialog-duration' as string]: `${duration}s`,
		['--dialog-duration-95' as string]: `${duration * 0.95}s`,
		['--dialog-duration-90' as string]: `${duration * 0.9}s`,
		['--dialog-duration-80' as string]: `${duration * 0.8}s`,
		['--dialog-duration-70' as string]: `${duration * 0.7}s`,
		['--dialog-duration-60' as string]: `${duration * 0.6}s`,
		['--dialog-duration-50' as string]: `${duration * 0.5}s`,
		['--dialog-duration-40' as string]: `${duration * 0.4}s`,
		['--dialog-duration-30' as string]: `${duration * 0.3}s`,
		['--dialog-duration-20' as string]: `${duration * 0.2}s`,
		['--dialog-duration-10' as string]: `${duration * 0.1}s`,
	};
};

function deepMerge<T>(obj1: T, obj2: T = {} as T) {
	const result = { ...obj1 };

	for (const key in obj2) {
		if (
			obj2[key] &&
			typeof obj2[key] === 'object' &&
			!Array.isArray(obj2[key])
		) {
			result[key] = deepMerge(
				(result[key] as T[Extract<keyof T, string>]) ||
					({} as T[Extract<keyof T, string>]),
				obj2[key] as T[Extract<keyof T, string>]
			);
		} else {
			result[key] = obj2[key];
		}
	}

	return result;
}

interface DialogContextType {
	id: string;
	dataOpen: boolean;
	presenceOpen: boolean;
	setIsOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
	transition: Transition & typeof DEFAULT_TRANSITION;
	animatedOpen: boolean;
}

const DialogContext = createContext<DialogContextType | null>(null);

export const useDialog = () => {
	const context = useContext(DialogContext);
	if (!context) {
		throw new Error('useDialog must be used within a Dialog');
	}
	return context;
};

export interface DialogProps {
	transition?: Transition & typeof DEFAULT_TRANSITION;
	defaultOpen?: boolean;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export const Portal = ({
	children,
	transition: transitionProp,
	defaultOpen = false,
	open,
	onOpenChange,
}: DialogProps & PropsWithChildren) => {
	const id = useId();
	const [internalOpen, setInternalOpen] = useState(defaultOpen);
	const isOpen = open !== undefined ? open : internalOpen;

	const setIsOpen = useCallback(
		(value: boolean | ((prev: boolean) => boolean)) => {
			const newValue = typeof value === 'function' ? value(isOpen) : value;

			if (open === undefined) {
				setInternalOpen(newValue);
			}

			onOpenChange?.(newValue);
		},
		[isOpen, open, onOpenChange]
	);

	const awaitedOpen = useDelay(isOpen, 0);

	const transition = useMemo(
		() => deepMerge(DEFAULT_TRANSITION, transitionProp),
		[transitionProp]
	);

	const animatedOpen = useFnDelay(
		async (delay) => {
			if (!isOpen) {
				await delay(transition.layout.duration * 1000);
			}
			return isOpen;
		},
		[isOpen, transition.layout.duration]
	);

	return (
		<DialogContext.Provider
			value={{
				id,
				dataOpen: isOpen ? (awaitedOpen ?? isOpen) : isOpen,
				presenceOpen: isOpen ? isOpen : (awaitedOpen ?? isOpen),
				setIsOpen,
				transition,
				animatedOpen: animatedOpen ?? isOpen,
			}}
		>
			{children}
		</DialogContext.Provider>
	);
};

type DialogTriggerProps = Omit<
	HTMLMotionProps<'div'>,
	'layoutId' | 'transition'
> &
	PropsWithChildren;

export const PortalTrigger = forwardRef<HTMLDivElement, DialogTriggerProps>(
	({ children, style, whileHover, ...props }, ref) => {
		const {
			id,
			transition: transitionDialog,
			setIsOpen,
			dataOpen,
			animatedOpen,
		} = useDialog();

		return (
			<motion.div
				className={cn(
					'group/dialog-trigger cursor-pointer',
					'relative h-full w-full cursor-pointer overflow-hidden px-3 py-4',
					animatedOpen || dataOpen ? 'pointer-events-none' : undefined
				)}
				data-open={dataOpen}
				data-slot="dialog-trigger-anchor"
				layoutId={`dialog-content-${id}`}
				style={{
					...style,
					...createDurationVariables(transitionDialog.layout.duration),
					zIndex: animatedOpen || dataOpen ? Z_INDEX - 2 : 0,
				}}
				transition={transitionDialog}
				whileHover={animatedOpen || dataOpen ? undefined : whileHover}
				{...props}
				onClick={() => setIsOpen(!dataOpen)}
				ref={ref}
			>
				{children}
			</motion.div>
		);
	}
);

export interface PortalImageWrapperProps {
	layoutId: string;
	isBanner?: boolean;
	isGradient?: boolean;
}

const DialogImageContext = createContext<string | null>(null);
const useDialogImageLayoutId = () => useContext(DialogImageContext);

export const PortalImageWrapper = forwardRef<
	HTMLImageElement,
	Omit<HTMLMotionProps<'div'>, 'id' | 'layoutId'> & PortalImageWrapperProps
>(
	(
		{
			children,
			className,
			layoutId: layoutIdProp,
			transition,
			whileHover,
			isBanner,
			isGradient,
			...props
		},
		ref
	) => {
		const {
			id,
			transition: transitionDialog,
			dataOpen,
			animatedOpen,
		} = useDialog();

		return (
			<DialogImageContext.Provider value={layoutIdProp}>
				<motion.div
					className={cn(
						'relative h-auto w-full overflow-hidden',
						isBanner && 'rounded-md',
						isGradient &&
							'mask-[linear-gradient(to_top,transparent_0%,var(--background))]',
						className
					)}
					data-open={dataOpen}
					data-slot={'dialog-image-wrapper'}
					layoutId={`dialog-image-wrapper-${id}-${layoutIdProp}`}
					transition={{ ...transitionDialog, ...transition }}
					whileHover={animatedOpen || dataOpen ? undefined : whileHover}
					{...props}
					ref={ref}
				>
					{children}
				</motion.div>
			</DialogImageContext.Provider>
		);
	}
);

export const PortalImage = forwardRef<
	HTMLImageElement,
	Omit<HTMLMotionProps<'img'>, 'layoutId'>
>(({ children, className, whileHover, transition, ...props }, ref) => {
	const {
		id,
		transition: transitionDialog,
		dataOpen,
		animatedOpen,
	} = useDialog();
	const wrapperLayoutId = useDialogImageLayoutId();

	return (
		<motion.img
			className="relative w-full rounded-md object-cover object-center ring-1 ring-border ring-offset-3 ring-offset-background sm:min-h-40"
			data-open={dataOpen}
			data-slot={'dialog-image'}
			layoutId={`dialog-image-${id}-${wrapperLayoutId}`}
			loading="eager"
			rel="preload"
			transition={{ ...transitionDialog, ...transition }}
			whileHover={animatedOpen || dataOpen ? undefined : whileHover}
			{...props}
			ref={ref}
		/>
	);
});

const PortalDialogContentWrapper = ({
	children,
	className: wrapperClassName,
	style: wrapperStyle,
	...wrapper
}: HTMLAttributes<HTMLDivElement> & PropsWithChildren) => {
	const { transition: transitionDialog, dataOpen, presenceOpen } = useDialog();

	return (
		<AnimatePresence>
			{presenceOpen && (
				<RemoveScroll
					className={cn(
						'group/dialog pointer-events-none fixed inset-0 flex px-4 py-8 sm:px-8',
						'h-screen w-screen overflow-auto overscroll-auto',
						wrapperClassName
					)}
					data-open={dataOpen}
					data-slot="dialog-content-wrapper"
					role="dialog"
					style={{
						...wrapperStyle,
						...createDurationVariables(transitionDialog.layout.duration),
						zIndex: Z_INDEX,
					}}
					{...wrapper}
				>
					{children}
				</RemoveScroll>
			)}
		</AnimatePresence>
	);
};

const PortalDialogContentLayoutId = ({
	clickBehaviour = 'close',
	children,
	transition,
	className,
	...props
}: { clickBehaviour?: 'none' | 'close' } & Omit<
	HTMLMotionProps<'div'>,
	'layoutId'
> &
	PropsWithChildren) => {
	const { id, transition: transitionDialog, dataOpen, setIsOpen } = useDialog();

	const handleClick = useCallback(() => {
		if (clickBehaviour === 'close') {
			setIsOpen(false);
		}
	}, [clickBehaviour, setIsOpen]);

	return (
		<motion.div
			className={cn(
				'pointer-events-auto relative m-auto overflow-hidden rounded-2xl',
				'w-230 max-w-[96vw] p-0',
				'bg-[color-mix(in_oklab,var(--background)_50%,var(--muted)_50%)]',
				clickBehaviour === 'close' ? 'cursor-pointer' : 'cursor-default',
				className
			)}
			data-open={dataOpen}
			data-slot="dialog-content"
			layoutId={`dialog-content-${id}`}
			onClick={handleClick}
			transition={{ ...transitionDialog, ...transition }}
			{...props}
		>
			{children}
		</motion.div>
	);
};

export interface DialogContentProps {
	clickBehaviour?: 'none' | 'close';
	wrapper?: HTMLAttributes<HTMLDivElement>;
}

export const PortalDialogContent = ({
	children,
	wrapper = {},
	...props
}: DialogContentProps &
	Omit<HTMLMotionProps<'div'>, 'layoutId'> &
	PropsWithChildren) => (
	<PortalDialogContentWrapper {...wrapper}>
		<PortalDialogContentLayoutId {...props}>
			{children}
		</PortalDialogContentLayoutId>
	</PortalDialogContentWrapper>
);

export const PortalDialogDiv = forwardRef<
	HTMLDivElement,
	HTMLMotionProps<'div'>
>(
	(
		{ children, layoutId: layoutIdProp, transition, whileHover, ...props },
		ref
	) => {
		const {
			id,
			transition: transitionDialog,
			dataOpen,
			animatedOpen,
		} = useDialog();

		return (
			<motion.div
				data-open={dataOpen}
				data-slot={'motion-div'}
				layoutId={layoutIdProp ? `motion-div-${id}-${layoutIdProp}` : undefined}
				transition={deepMerge(transitionDialog, transition)}
				whileHover={animatedOpen || dataOpen ? undefined : whileHover}
				{...props}
				ref={ref}
			>
				{children}
			</motion.div>
		);
	}
);

export interface DialogAnimatePresenceDivProps {
	onceOpen?: boolean;
	delayFactor?: number;
	durationFactor?: number;
}

export const PortalDialogAnimate = forwardRef<
	HTMLDivElement,
	DialogAnimatePresenceDivProps & HTMLMotionProps<'div'>
>(
	(
		{
			transition: transitionProp,
			children,
			onceOpen,
			delayFactor = 1,
			durationFactor = 0.5,
			...props
		},
		ref
	) => {
		const { transition: transitionDialog, dataOpen } = useDialog();

		const innerOpen = useFnDelay(
			async (delay) => {
				if (dataOpen) {
					const delayTime = onceOpen
						? (transitionProp?.duration ?? transitionDialog.duration) *
							1000 *
							delayFactor
						: 0;
					await delay(delayTime);
				}
				return dataOpen;
			},
			[
				dataOpen,
				transitionProp?.duration,
				transitionDialog.duration,
				delayFactor,
				onceOpen,
			]
		);

		return (
			<AnimatePresence>
				{innerOpen && (
					<PortalDialogDiv
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						initial={{ opacity: 0 }}
						ref={ref}
						transition={{
							...transitionProp,
							...(durationFactor
								? {
										duration: transitionDialog.duration * durationFactor,
										layout: {
											duration:
												transitionDialog.layout.duration * durationFactor,
										},
									}
								: {}),
						}}
						{...props}
					>
						{children}
					</PortalDialogDiv>
				)}
			</AnimatePresence>
		);
	}
);

export const PortalDialogOverlay = forwardRef<
	HTMLDivElement,
	Omit<HTMLMotionProps<'div'>, 'layoutId'>
>(({ transition, style, ...props }, ref) => {
	const { transition: transitionDialog, setIsOpen, presenceOpen } = useDialog();

	return (
		<AnimatePresence>
			{presenceOpen && (
				<motion.div
					animate={{
						opacity: 1,
					}}
					className="fixed inset-0 flex items-center justify-center bg-white/50 dark:bg-black/50"
					data-slot="dialog-overlay"
					exit={{ opacity: 0 }}
					initial={{ opacity: 0 }}
					onClick={() => setIsOpen(false)}
					ref={ref}
					style={{
						...style,
						zIndex: Z_INDEX - 1,
					}}
					transition={{ ...transitionDialog, ...transition }}
					{...props}
				/>
			)}
		</AnimatePresence>
	);
});

export const PortalDialog = Root;

export const PortalDialogClose = forwardRef<
	HTMLButtonElement,
	HTMLMotionProps<'button'>
>((_props, ref) => {
	const { setIsOpen } = useDialog();
	const iconRef = useRef<AnimatedIconHandle>(null);

	return (
		<Button
			className="absolute top-4 right-4 z-50"
			onClick={() => setIsOpen(false)}
			onMouseEnter={() => iconRef.current?.startAnimation()}
			onMouseLeave={() => iconRef.current?.stopAnimation()}
			ref={ref}
			size="icon"
			variant="outline"
		>
			<X ref={iconRef} />
		</Button>
	);
});

export const PortalDialogAction = forwardRef<
	HTMLButtonElement,
	HTMLMotionProps<'button'>
>((_props, ref) => {
	const { setIsOpen } = useDialog();
	const iconRef = useRef<AnimatedIconHandle>(null);

	return (
		<Button
			asChild
			className="absolute top-4 right-15 z-50"
			onClick={() => setIsOpen(false)}
			onMouseEnter={() => iconRef.current?.startAnimation()}
			onMouseLeave={() => iconRef.current?.stopAnimation()}
			ref={ref}
			variant="outline"
		>
			<Eye ref={iconRef} />
		</Button>
	);
});

interface PortalDialogTitleProps {
	title: string;
	description?: string;
	className?: string;
}

export const PortalDialogTitle = ({
	title,
	description,
	className,
}: PortalDialogTitleProps) => (
	<div
		className={cn(
			'sm:top-40 md:absolute md:inset-x-8 md:top-1/2 md:-translate-y-1/2',
			'flex flex-col gap-y-3',
			className
		)}
	>
		<TextAnimate
			animation="slideLeft"
			by="character"
			className="text-2xl! lowercase sm:text-balance sm:text-4xl! md:text-5xl!"
			delay={0.6}
		>
			{title}
		</TextAnimate>
		<TextAnimate
			animation="slideLeft"
			by="line"
			className="text-sm! lowercase sm:text-balance sm:text-base! md:text-lg!"
			delay={0.8}
		>
			{description!}
		</TextAnimate>
	</div>
);
