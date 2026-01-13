import Link from 'next/link';
import type React from 'react';
import { AnimatedDot } from '@/components/animations/AnimatedDot';
import { LinkIcon } from '@/components/icons/animated/LinkIcon';
import {
	CollapsibleChevronsIcon,
	CollapsibleContent,
	CollapsibleTrigger,
	CollapsibleWithContext,
} from '@/components/ui/Collapsible';
import { Tag } from '@/components/ui/Tag';
import { cn } from '@/lib/utils';
import type { Experience } from './content';

interface ExperienceItemProps {
	experience: Experience;
}

const ExperienceItem = ({ experience }: ExperienceItemProps): React.JSX.Element => {
	const { start, end } = experience.period;
	const isOngoing = !end;

	return (
		<CollapsibleWithContext>
			<div className={cn('flex items-center', experience.link && 'hover:bg-accent2')}>
				<CollapsibleTrigger
					className={cn(
						'flex flex-1 items-center gap-4',
						'w-full select-none p-3 text-left',
						experience.link && 'cursor-pointer'
					)}
				>
					<div className="flex flex-1 flex-col gap-y-1">
						<div className="flex items-center gap-x-3">
							{experience.isCurrentEmployer && <AnimatedDot label="Poste actuellement occupé" />}
							<div className="flex items-baseline gap-x-1.5">
								<h2 className="text-balance font-semibold text-base">{experience.company}</h2>
								{experience.type && <span className="font-normal text-theme text-xs">({experience.type})</span>}
							</div>
						</div>

						<div className="flex items-center gap-x-3">
							<dl className="font-medium text-muted-foreground text-xs">
								<dt className="sr-only">Poste occupé dans l'entreprise</dt>
								<dd>
									<p>{experience.title}</p>
								</dd>
							</dl>

							<span className="size-1 rounded-full bg-muted-foreground" />

							<dl className="font-medium text-muted-foreground text-xs">
								<dt className="sr-only">Durée dans l'entreprise</dt>
								<dd>
									<p>
										{start} - {isOngoing ? "aujourd'hui" : end}
									</p>
								</dd>
							</dl>
						</div>
					</div>

					{experience.link && (
						<Link
							aria-label={experience.company}
							className="z-20"
							href={experience.link}
							rel="noopener"
							target="_blank"
						>
							<LinkIcon className="relative after:absolute after:-inset-2" size={20} />
						</Link>
					)}

					{experience.description && experience.skills && <CollapsibleChevronsIcon />}
				</CollapsibleTrigger>
			</div>

			{experience.description && experience.skills && (
				<CollapsibleContent className="group overflow-hidden duration-300 data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
					<div className="border-edge border-t p-4 duration-300 group-data-[state=closed]:animate-fade-out group-data-[state=open]:animate-fade-in min-sm:hidden">
						<p className="text-muted-foreground text-xs">{experience.title}</p>
					</div>

					<div className="grid auto-rows-[120px] grid-cols-1 gap-4 border-edge border-t p-4 duration-300 group-data-[state=closed]:animate-fade-out group-data-[state=open]:animate-fade-in md:grid-cols-3">
						{experience.description.map((text, i) => {
							const isWide = i === 0 || i === 3 || i === 4 || i === 7;

							return (
								<div
									className={cn(
										'group relative flex flex-col justify-between overflow-hidden rounded-xl border bg-background p-4',
										isWide ? 'md:col-span-2' : 'md:col-span-1'
									)}
									key={text}
								>
									<span className="absolute -top-2 -right-1 select-none font-bold text-[3rem] text-theme leading-none tracking-tighter opacity-[0.1] transition-opacity duration-300">
										{i + 1}
									</span>
									<div className="z-10 flex items-center gap-2">
										<span className="flex h-6 items-center justify-center rounded-full bg-primary/10 px-2.5 font-bold font-mono text-[10px] text-primary">
											{(i + 1).toString().padStart(2, '0')}
										</span>
										<div className="h-px w-8 bg-border" />
									</div>
									<p className="z-10 text-balance font-medium text-foreground text-sm leading-snug tracking-tight">
										{text}
									</p>
									<div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
								</div>
							);
						})}
					</div>

					<div className="border-edge border-t p-4 duration-300 group-data-[state=closed]:animate-fade-out group-data-[state=open]:animate-fade-in">
						{experience.skills.length > 0 && (
							<ul className="flex flex-wrap gap-1.5">
								{experience.skills.map((skill, index) => (
									<li className="flex" key={index + skill}>
										<Tag>{skill}</Tag>
									</li>
								))}
							</ul>
						)}
					</div>
				</CollapsibleContent>
			)}
		</CollapsibleWithContext>
	);
};

ExperienceItem.displayName = 'ExperienceItem';

export { ExperienceItem };
