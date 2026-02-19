import Image from 'next/image';
import Link from 'next/link';
import type React from 'react';
import { Button } from '@/components/buttons/Button';
import { NextJSIcon } from '@/components/stack/Next';
import { ReactIcon } from '@/components/stack/React';
import { Badge } from '@/components/ui/Badge';
import {
	CollapsibleChevronsIcon,
	CollapsibleContent,
	CollapsibleTrigger,
	CollapsibleWithContext,
} from '@/components/ui/Collapsible';
import { DotPattern } from '@/components/ui/DotPattern';
import { cn, dayjs } from '@/lib/utils';
import type { Certification } from './content';

const Icons = {
	nextjs: (props: React.SVGProps<SVGSVGElement>) => (
		<NextJSIcon className="size-6 sm:size-8" {...props} />
	),
	react: (props: React.SVGProps<SVGSVGElement>) => (
		<ReactIcon className="size-6 sm:size-8" {...props} />
	),
};

export const getIcon = (name: string | undefined) => {
	if (!(name && name in Icons)) {
		return null;
	}
	const Icon = Icons[name as keyof typeof Icons];
	return <Icon className="pointer-events-none size-8" />;
};

interface CertItemProps {
	certification: Certification;
	isLast?: boolean;
}

export const CertificationItem = ({
	certification,
	isLast = false,
}: CertItemProps) => {
	const {
		credentialURL,
		issuerIconName,
		title,
		issuer,
		issueDate,
		coverImageURL,
	} = certification;

	return (
		<CollapsibleWithContext>
			<article className="screen-line-before flex items-center hover:bg-accent2">
				<CollapsibleTrigger className="flex w-full flex-1 cursor-pointer items-center">
					<div className="relative m-4 flex size-6 shrink-0 cursor-default items-center justify-center sm:size-8">
						{getIcon(issuerIconName)}
						<DotPattern
							className="-z-10 text-theme opacity-20"
							height={8}
							width={8}
						/>
					</div>
					<div className="w-full cursor-pointer select-none border-edge border-l p-4 md:border-r">
						<div className="flex items-center justify-between [&_h2]:font-pixel-square [&_h2]:lowercase">
							<h2 className="text-base sm:text-xl">{title}</h2>
						</div>
					</div>
					<div className="relative m-4 hidden size-6 shrink-0 cursor-default items-center justify-center sm:flex sm:size-8">
						<CollapsibleChevronsIcon />
					</div>
				</CollapsibleTrigger>
			</article>

			<CollapsibleContent className="group overflow-hidden duration-300 data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
				<div className="border-edge border-t p-4 duration-300 group-data-[state=closed]:animate-fade-out group-data-[state=open]:animate-fade-in">
					<Image
						alt={title}
						className={cn(
							'aspect-video h-full w-full object-cover object-center',
							'select-none rounded-md ring-1 ring-border ring-offset-3 ring-offset-background'
						)}
						fetchPriority="high"
						height={1826}
						src={coverImageURL}
						width={3000}
					/>
				</div>

				<div className="screen-line-before flex justify-between gap-3 px-3 py-2 max-sm:flex-col sm:justify-end">
					<Button asChild variant="outline">
						<Link
							aria-label={title}
							href={credentialURL}
							rel="noopener"
							target="_blank"
						>
							voir la certification
						</Link>
					</Button>
				</div>
			</CollapsibleContent>

			<div className="screen-line-before flex items-center justify-between gap-2 px-2 py-2 sm:gap-4 sm:px-4">
				<span className="text-theme">---</span>
				<div className="flex items-center gap-2 sm:gap-4">
					<Badge className="lowercase">
						organisme: <span className="text-theme">{issuer}</span>
					</Badge>
					<Badge className="lowercase">
						obtenu: {dayjs(issueDate).format('dddd, DD MMMM YYYY')}
					</Badge>
				</div>
			</div>

			{!isLast && (
				<div className="screen-line-before">
					<div
						className={cn(
							'relative flex h-4 w-full before:h-4',
							'before:absolute before:-left-[100vw] before:-z-1 before:w-[200vw]',
							'before:bg-[repeating-linear-gradient(315deg,var(--pattern-foreground)_0,var(--pattern-foreground)_1px,transparent_0,transparent_50%)]',
							'before:bg-size-[10px_10px] before:[--pattern-foreground:var(--color-edge)]/50'
						)}
					/>
				</div>
			)}
		</CollapsibleWithContext>
	);
};
