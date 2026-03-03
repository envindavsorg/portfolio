import Image from 'next/image';
import Link from 'next/link';
import { DotPattern } from '@/components/blocks/DotPattern';
import { Badge } from '@/components/primitives/Badge';
import { Button } from '@/components/primitives/Button';
import {
	CollapsibleChevronsIcon,
	CollapsibleContent,
	CollapsibleTrigger,
	CollapsibleWithContext,
} from '@/components/primitives/Collapsible';
import { Divider } from '@/components/primitives/Divider';
import { dayjs } from '@/lib/functions';
import { cn } from '@/lib/utils';
import type { Cert } from './content';

interface CertItemProps {
	cert: Cert;
	isLast?: boolean;
}

export const CertItem = ({ cert, isLast = false }: CertItemProps) => {
	const { credentialURL, title, issuer, issueDate, coverImageURL, icon: Icon } = cert;

	return (
		<CollapsibleWithContext>
			<article className="screen-line-before flex items-center hover:bg-accent2">
				<CollapsibleTrigger className="flex w-full flex-1 cursor-pointer items-center">
					<div className="pointer-events-none relative m-4 flex size-6 shrink-0 items-center justify-center sm:size-8">
						{Icon && <Icon aria-hidden="true" className="size-6 sm:size-8" />}
						<DotPattern className="-z-10 text-theme opacity-20" height={8} width={8} />
					</div>
					<div className="flex-1 border-edge border-l p-4 md:border-r">
						<h2 className="text-left font-pixel-square text-base lowercase sm:text-xl">{title}</h2>
					</div>
					<div className="relative m-4 hidden size-6 shrink-0 items-center justify-center sm:flex sm:size-8">
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
						height={1826}
						src={coverImageURL}
						width={3000}
					/>
				</div>
				<div className="screen-line-before flex justify-between gap-3 px-3 py-2 max-sm:flex-col sm:justify-end">
					<Button asChild variant="outline">
						<Link aria-label={title} href={credentialURL} rel="noopener" target="_blank">
							voir la certification
						</Link>
					</Button>
				</div>
			</CollapsibleContent>

			<div className="screen-line-before flex items-center justify-between gap-2 px-2 py-2 sm:gap-4 sm:px-4">
				<span className="text-theme">---</span>
				<div className="flex items-center gap-2 sm:gap-4">
					<Badge className="lowercase">
						organisme: <span>{issuer}</span>
					</Badge>
					<Badge className="lowercase">
						obtenu: <span>{dayjs(issueDate).format('ddd DD MMMM YYYY')}</span>
					</Badge>
				</div>
			</div>

			{!isLast && <Divider after={false} border={false} type="half" />}
		</CollapsibleWithContext>
	);
};
