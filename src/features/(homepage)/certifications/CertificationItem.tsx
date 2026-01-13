import Image from 'next/image';
import Link from 'next/link';
import type React from 'react';
import { LinkIcon } from '@/components/icons/animated/LinkIcon';
import { NextJSIcon } from '@/components/icons/stack/Next';
import { ReactIcon } from '@/components/icons/stack/React';
import {
	CollapsibleChevronsIcon,
	CollapsibleContent,
	CollapsibleTrigger,
	CollapsibleWithContext,
} from '@/components/ui/Collapsible';
import { dayjs } from '@/lib/dayjs';
import { cn } from '@/lib/utils';
import type { Certification } from './content';

const Icons = {
	nextjs: (props: React.SVGProps<SVGSVGElement>) => <NextJSIcon {...props} />,
	react: (props: React.SVGProps<SVGSVGElement>) => <ReactIcon {...props} />,
};

export const getIcon = (name: string | undefined) => {
	if (!(name && name in Icons)) {
		return null;
	}
	const Icon = Icons[name as keyof typeof Icons];
	return <Icon className="pointer-events-none size-7" />;
};

interface CertItemProps {
	className?: string;
	certification: Certification;
}

const CertificationItem = ({ certification }: CertItemProps): React.JSX.Element => {
	const { credentialURL, issuerIconName, title, issuer, issueDate, coverImageURL } = certification;

	return (
		<CollapsibleWithContext>
			<div className="flex items-center hover:bg-accent2">
				<div className="m-3 flex aspect-square size-8 shrink-0 cursor-default items-center justify-center">
					{getIcon(issuerIconName)}
				</div>

				<CollapsibleTrigger className="flex w-full flex-1 cursor-pointer select-none items-center gap-4 border-edge border-l p-3 text-left">
					<div className="flex flex-1 flex-col gap-y-1">
						<h2 className="text-balance font-semibold text-base">{title}</h2>
						<div className="flex items-center gap-x-3">
							<dl className="font-medium text-muted-foreground text-xs">
								<dt className="sr-only">Organisme ayant délivré la certification</dt>
								<dd>
									<p className="text-theme">{issuer}</p>
								</dd>
							</dl>

							<span className="size-1 rounded-full bg-muted-foreground" />

							<dl className="font-medium text-muted-foreground text-xs">
								<dt className="sr-only">Date d'émission de la certification</dt>
								<dd>
									<p>
										<time dateTime={dayjs(issueDate).toISOString()}>
											{dayjs(issueDate).format('dddd, DD MMMM YYYY')}
										</time>
									</p>
								</dd>
							</dl>
						</div>
					</div>

					<Link
						aria-label={title}
						className="z-20"
						href={credentialURL}
						rel="noopener"
						target="_blank"
					>
						<LinkIcon className="relative after:absolute after:-inset-2" size={20} />
					</Link>

					<CollapsibleChevronsIcon />
				</CollapsibleTrigger>
			</div>

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
			</CollapsibleContent>
		</CollapsibleWithContext>
	);
};

CertificationItem.displayName = 'CertificationItem';

export { CertificationItem };
