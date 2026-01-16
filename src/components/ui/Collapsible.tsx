'use client';

import { motion } from 'motion/react';
import { Collapsible as Primitive } from 'radix-ui';
import { type ComponentProps, createContext, forwardRef, useContext, useState } from 'react';
import { ChevronsDownUpIcon } from '@/components/icons/ChevronsDownUpIcon';
import { ChevronsUpDownIcon } from '@/components/icons/ChevronsUpDownIcon';

export const Collapsible = Primitive.Root;

export const CollapsibleTrigger = Primitive.CollapsibleTrigger;

export const CollapsibleContent = forwardRef<HTMLDivElement, ComponentProps<typeof Primitive.CollapsibleContent>>(
	({ children, className, ...props }, ref) => (
		<Primitive.CollapsibleContent asChild className={className} ref={ref} {...props}>
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
	)
);

interface CollapsibleContextType {
	open: boolean;
}

const CollapsibleContext = createContext<CollapsibleContextType | null>(null);

const useCollapsible = () => {
	const context = useContext(CollapsibleContext);

	if (!context) {
		throw new Error('Collapsible components must be used within a CollapsibleWithContext');
	}

	return context;
};

export const CollapsibleWithContext = ({ defaultOpen, ...props }: ComponentProps<typeof Collapsible>) => {
	const [open, setOpen] = useState(defaultOpen ?? false);

	return (
		<CollapsibleContext.Provider value={{ open }}>
			<Collapsible onOpenChange={setOpen} open={open} {...props} />
		</CollapsibleContext.Provider>
	);
};

export const CollapsibleChevronsIcon = () => {
	const { open } = useCollapsible();

	const Icon = open ? ChevronsDownUpIcon : ChevronsUpDownIcon;

	return (
		<Icon className="relative before:absolute before:inset-0 before:-left-[100vw] before:content-['']" size={20} />
	);
};
