import {
	CodaLogoIcon,
	InfinityIcon,
	LinkIcon,
} from '@phosphor-icons/react/ssr';
import Image from 'next/image';
import type React from 'react';
import { Markdown } from '@/components/blog/markdown/markdown';
import type { Project } from '@/components/features/projects/data/projects';
import {
	CollapsibleChevronsIcon,
	CollapsibleContent,
	CollapsibleTrigger,
	CollapsibleWithContext,
} from '@/components/ui/Collapsible';
import { Tag } from '@/components/ui/Tag';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/Tooltip';
import { Prose } from '@/components/ui/Typography';
import { cn } from '@/lib/utils';

type ProjectItemProps = {
	className?: string;
	project: Project;
};

export const ProjectsItem = ({
	className,
	project,
}: ProjectItemProps): React.JSX.Element => {
	const { start, end } = project.period;
	const isOngoing = !end;

	return (
		<CollapsibleWithContext asChild defaultOpen={project.isExpanded}>
			<div className={className}>
				<div className="flex items-center hover:bg-accent2">
					{project.logo ? (
						<Image
							alt={project.title}
							aria-hidden="true"
							className="mx-4 flex size-6 shrink-0 select-none"
							height={32}
							quality={100}
							src={project.logo}
							unoptimized
							width={32}
						/>
					) : (
						<div
							aria-hidden
							className={cn(
								'mx-4 flex size-8 shrink-0 items-center justify-center bg-muted',
								'rounded-lg border border-muted-foreground/15 ring-1 ring-edge ring-offset-1 ring-offset-background'
							)}
						>
							<CodaLogoIcon
								className="pointer-events-none size-5 text-theme"
								weight="duotone"
							/>
						</div>
					)}

					<div className="flex-1 border-edge border-l border-dashed">
						<CollapsibleTrigger className="flex w-full select-none items-center gap-4 p-4 pr-2 text-left">
							<div className="flex-1">
								<h2 className="mb-1 text-balance font-medium text-base leading-snug sm:text-lg">
									{project.title}
								</h2>

								<dl className="text-muted-foreground text-xs sm:text-sm">
									<dt className="sr-only">Période du projet</dt>
									<dd className="flex items-center gap-1">
										<span>{start}</span>
										<span className="font-mono">-</span>
										{isOngoing ? (
											<>
												<InfinityIcon
													aria-hidden
													className="size-4 translate-y-[0.5px]"
												/>
												<span className="sr-only">(en cours)</span>
											</>
										) : (
											<span>{end}</span>
										)}
									</dd>
								</dl>
							</div>

							<Tooltip>
								<TooltipTrigger asChild>
									<a
										className="relative flex size-6 shrink-0 items-center justify-center text-muted-foreground after:absolute after:-inset-2 hover:text-foreground"
										href={project.link}
										rel="noopener"
										target="_blank"
									>
										<LinkIcon className="pointer-events-none size-5" />
										<span className="sr-only">Ouvrir le lien du projet</span>
									</a>
								</TooltipTrigger>
								<TooltipContent>Ouvrir le projet</TooltipContent>
							</Tooltip>

							<div
								aria-hidden
								className="shrink-0 text-muted-foreground [&_svg]:size-4"
							>
								<CollapsibleChevronsIcon />
							</div>
						</CollapsibleTrigger>
					</div>
				</div>

				<CollapsibleContent className="group overflow-hidden duration-300 data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
					<div className="border-edge border-t border-dashed">
						<div className="space-y-4 p-4 duration-300 group-data-[state=closed]:animate-fade-out group-data-[state=open]:animate-fade-in">
							{project.description && (
								<Prose>
									<Markdown>{project.description}</Markdown>
								</Prose>
							)}

							{project.skills.length > 0 && (
								<ul className="flex flex-wrap gap-1.5">
									{project.skills.map((skill, index) => (
										<li className="flex" key={index + skill}>
											<Tag>{skill}</Tag>
										</li>
									))}
								</ul>
							)}
						</div>
					</div>
				</CollapsibleContent>
			</div>
		</CollapsibleWithContext>
	);
};
