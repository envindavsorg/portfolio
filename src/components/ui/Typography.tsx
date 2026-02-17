import { Slot as SlotPrimitive } from 'radix-ui';
import type React from 'react';
import { cn } from '@/lib/utils';

const Slot = SlotPrimitive.Slot;

const Prose = ({
	className,
	asChild = false,
	...props
}: React.ComponentProps<'div'> & {
	asChild?: boolean;
}) => {
	const Comp = asChild ? Slot : 'div';

	return (
		<Comp
			className={cn(
				'prose prose-sm prose-zinc dark:prose-invert max-w-none',
				'prose-headings:text-balance prose-headings:font-sans prose-headings:font-semibold prose-lead:text-base',
				'prose-a:wrap-break-word prose-a:font-medium prose-a:text-foreground prose-a:underline prose-a:underline-offset-4',
				'prose-code:rounded-md prose-code:border prose-code:bg-muted/50 prose-code:px-[0.3rem] prose-code:py-[0.2rem] prose-code:font-normal prose-code:text-sm prose-code:before:content-none prose-code:after:content-none',
				'prose-hr:border-edge',
				className
			)}
			data-slot="prose"
			{...props}
		/>
	);
};

const Code = ({ className, ...props }: React.ComponentProps<'code'>) => {
	const isCodeBlock = 'data-language' in props;

	return (
		<code
			className={cn(
				!isCodeBlock &&
					'not-prose rounded-md border bg-muted/50 px-[0.3rem] py-[0.2rem] text-sm',
				className
			)}
			data-slot={isCodeBlock ? 'code-block' : 'code-inline'}
			{...props}
		/>
	);
};

type HeadingTypes = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
type HeadingProps<T extends HeadingTypes> = React.ComponentProps<T> & {
	as?: T;
};

const Heading = <T extends HeadingTypes = 'h1'>({
	as,
	className,
	...props
}: HeadingProps<T>): React.ReactElement => {
	const Comp = as ?? 'h1';

	if (!props.id) {
		return <Comp className={className} {...props} />;
	}

	return (
		<Comp className={className} {...props}>
			{props.children}
		</Comp>
	);
};

export { Code, Heading, Prose };
