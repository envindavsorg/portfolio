'use client';

import { CaretDownIcon } from '@phosphor-icons/react/ssr';
import { motion } from 'motion/react';
import { Collapsible as Primitive } from 'radix-ui';
import type React from 'react';
import {
	type ComponentProps,
	createContext,
	forwardRef,
	useContext,
	useMemo,
	useState,
} from 'react';
import { Button } from '@/components/primitives/Button';
import { cn } from '@/lib/utils';
import { ChevronDown } from '../motion/ChevronDown';
import { ChevronUp } from '../motion/ChevronUp';

export const Collapsible = Primitive.Root;

export const CollapsibleTrigger = Primitive.CollapsibleTrigger;

export const CollapsibleContent = forwardRef<
	HTMLDivElement,
	ComponentProps<typeof Primitive.CollapsibleContent>
>(({ children, className, ...props }, ref) => (
	<Primitive.CollapsibleContent
		asChild
		className={cn(
			'overflow-hidden duration-200',
			'data-[state=closed]:animate-collapsible-fade-up',
			'data-[state=open]:animate-collapsible-fade-down'
		)}
		ref={ref}
		{...props}
	>
		<motion.div
			animate="open"
			exit="collapsed"
			initial="collapsed"
			transition={{
				duration: 0.3,
				ease: [0.4, 0, 0.2, 1],
			}}
			variants={{
				open: {
					opacity: 1,
					height: 'auto',
				},
				collapsed: {
					opacity: 0,
					height: 0,
				},
			}}
		>
			{children}
		</motion.div>
	</Primitive.CollapsibleContent>
));

interface CollapsibleContextType {
	open: boolean;
	setOpen: (open: boolean) => void;
}

const CollapsibleContext = createContext<CollapsibleContextType | null>(null);

export const useCollapsible = () => {
	const context = useContext(CollapsibleContext);

	if (!context) {
		throw new Error(
			'Collapsible components must be used within a CollapsibleWithContext'
		);
	}

	return context;
};

export const CollapsibleWithContext = ({
	defaultOpen,
	...props
}: ComponentProps<typeof Collapsible>) => {
	const [open, setOpen] = useState(defaultOpen ?? false);
	return (
		<CollapsibleContext.Provider value={{ open, setOpen }}>
			<Collapsible onOpenChange={setOpen} open={open} {...props} />
		</CollapsibleContext.Provider>
	);
};

export const CollapsibleChevronsIcon = forwardRef<AnimatedIconHandle>(
	(_, ref) => {
		const { open } = useCollapsible();
		const Icon = open ? ChevronUp : ChevronDown;
		return <Icon ref={ref} />;
	}
);

interface CollapsibleListProps<T> {
	items: T[];
	renderItemAction: (item: T) => React.ReactNode;
	max?: number;
	keyExtractorAction?: (item: T) => string | number;
	className?: string;
	labels?: {
		showMore?: string;
		showLess?: string;
	};
}

export const CollapsibleList = <T,>({
	items,
	renderItemAction,
	max = 3,
	keyExtractorAction,
	className,
	labels = {
		showMore: 'afficher plus',
		showLess: 'afficher moins',
	},
}: CollapsibleListProps<T>) => {
	const { visibleItems, hiddenItems } = useMemo(
		() => ({
			visibleItems: items.slice(0, max),
			hiddenItems: items.slice(max),
		}),
		[items, max]
	);

	if (!items.length) {
		return null;
	}

	const getKey = (item: T, index: number) =>
		keyExtractorAction ? keyExtractorAction(item) : index;

	return (
		<Collapsible className={className}>
			{visibleItems.map((item, index) => (
				<div className="border-edge border-b" key={getKey(item, index)}>
					{renderItemAction(item)}
				</div>
			))}

			{hiddenItems.length > 0 && (
				<CollapsibleContent>
					{hiddenItems.map((item, index) => (
						<div
							className="border-edge border-b"
							key={getKey(item, max + index)}
						>
							{renderItemAction(item)}
						</div>
					))}
				</CollapsibleContent>
			)}

			{hiddenItems.length > 0 && (
				<div className="flex justify-center py-2 md:justify-end md:pr-4">
					<CollapsibleTrigger asChild>
						<Button className="group flex items-center gap-2">
							<span className="group-data-[state=open]:hidden">
								{labels.showMore}
							</span>
							<span className="hidden group-data-[state=open]:inline">
								{labels.showLess}
							</span>

							<CaretDownIcon
								aria-hidden="true"
								className="size-4 transition-transform duration-300 ease-in-out group-data-[state=open]:rotate-180"
							/>
						</Button>
					</CollapsibleTrigger>
				</div>
			)}
		</Collapsible>
	);
};
