import Link from 'next/link';
import { LinkIcon } from '@/components/icons/LinkIcon';
import {
	CollapsibleChevronsIcon,
	CollapsibleContent,
	CollapsibleTrigger,
	CollapsibleWithContext,
} from '@/components/ui/Collapsible';
import { Tag } from '@/components/ui/Tag';
import { cn } from '@/lib/utils';
import type { Project } from './content';

interface ProjectItemProps {
	project: Project;
}

const ProjectItem = ({ project }: ProjectItemProps) => {
	const Icon = project.icon;

	return (
		<CollapsibleWithContext>
			<div className="flex items-center hover:bg-accent2">
				<div className="m-3 flex aspect-square size-8 shrink-0 cursor-default items-center justify-center">
					<Icon className="pointer-events-none size-7" />
				</div>

				<CollapsibleTrigger className="flex w-full flex-1 cursor-pointer select-none items-center gap-4 border-edge border-l p-3 text-left">
					<div className="flex flex-1 flex-col gap-y-1">
						<h2 className="text-balance font-semibold text-base">
							{project.name}{' '}
							<span className="font-normal text-theme text-xs">
								({project.type})
							</span>
						</h2>
						<p className="text-muted-foreground text-xs max-sm:hidden">
							{project.title}
						</p>
					</div>

					<Link
						aria-label={project.name}
						className="z-20"
						href={project.link}
						rel="noopener"
						target="_blank"
					>
						<LinkIcon size={20} />
					</Link>

					<CollapsibleChevronsIcon />
				</CollapsibleTrigger>
			</div>

			<CollapsibleContent className="group overflow-hidden duration-300 data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
				<div className="border-edge border-t p-4 duration-300 group-data-[state=closed]:animate-fade-out group-data-[state=open]:animate-fade-in min-sm:hidden">
					<p className="text-muted-foreground text-xs">{project.title}</p>
				</div>

				<div className="grid auto-rows-[100px] grid-cols-1 gap-4 border-edge border-t p-4 duration-300 group-data-[state=closed]:animate-fade-out group-data-[state=open]:animate-fade-in md:grid-cols-3">
					{project.description.map((text, i) => {
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
									<span className="flex h-6 items-center justify-center rounded-full bg-primary/10 px-2.5 font-bold text-[10px] text-primary">
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
			</CollapsibleContent>
		</CollapsibleWithContext>
	);
};

ProjectItem.displayName = 'ProjectsItem';

export { ProjectItem };
