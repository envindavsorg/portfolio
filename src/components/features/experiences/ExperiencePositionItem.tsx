import type { Icon, IconProps } from '@phosphor-icons/react';
import {
	BriefcaseIcon,
	CodeIcon,
	GraduationCapIcon,
	InfinityIcon,
	PaletteIcon,
} from '@phosphor-icons/react/ssr';
import type React from 'react';
import { Markdown } from '@/components/blog/markdown/markdown';
import {
	CollapsibleChevronsIcon,
	CollapsibleContent,
	CollapsibleTrigger,
	CollapsibleWithContext,
} from '@/components/ui/Collapsible';
import { Separator } from '@/components/ui/Separator';
import { Tag } from '@/components/ui/Tag';
import { Prose } from '@/components/ui/Typography';
import { cn } from '@/lib/utils';
import type {
	ExperiencePosition,
	ExperiencePositionIcon,
} from './data/experiences';

const iconMap: Record<ExperiencePositionIcon, Icon> = {
	code: CodeIcon,
	design: PaletteIcon,
	education: GraduationCapIcon,
};

export const ExperienceIcon = ({
	icon,
	...props
}: {
	icon: ExperiencePositionIcon | undefined;
} & IconProps): React.JSX.Element => {
	const IconComponent = icon ? iconMap[icon] : BriefcaseIcon;
	return <IconComponent {...props} />;
};

type ExperiencePositionItemProps = {
	position: ExperiencePosition;
};

export const ExperiencePositionItem = ({
	position,
}: ExperiencePositionItemProps): React.JSX.Element => {
	const { start, end } = position.employmentPeriod;
	const isOngoing = !end;

	return (
		<CollapsibleWithContext asChild defaultOpen={position.isExpanded}>
			<div className="relative last:before:absolute last:before:h-full last:before:w-4 last:before:bg-background">
				<CollapsibleTrigger
					className={cn(
						'block w-full select-none text-left',
						'relative before:absolute before:-top-1 before:-right-1 before:-bottom-1.5 before:left-7 before:-z-1 before:rounded-lg hover:before:bg-accent2',
					)}
				>
					<div className="relative z-1 mb-1 flex items-center gap-3">
						<div
							aria-hidden
							className={cn(
								'flex size-6 shrink-0 items-center justify-center rounded-md',
								'bg-muted text-muted-foreground',
								'border border-muted-foreground/15 ring-1 ring-edge ring-offset-1 ring-offset-background',
							)}
						>
							<ExperienceIcon
								className="pointer-events-none size-3 text-theme"
								icon={position.icon}
								weight="duotone"
							/>
						</div>

						<h4 className="flex-1 text-balance font-medium">
							{position.title}
						</h4>

						<div
							aria-hidden
							className="shrink-0 text-muted-foreground [&_svg]:size-4"
						>
							<CollapsibleChevronsIcon />
						</div>
					</div>

					<div className="flex items-center gap-2 pl-9 text-muted-foreground text-sm">
						{position.employmentType && (
							<>
								<dl>
									<dt className="sr-only">Type de contrat</dt>
									<dd>{position.employmentType}</dd>
								</dl>

								<Separator
									className="data-[orientation=vertical]:h-4"
									orientation="vertical"
								/>
							</>
						)}

						<dl>
							<dt className="sr-only">Durée dans l'entreprise</dt>
							<dd className="flex items-center gap-1">
								<span>{start}</span>
								<span className="font-mono">-</span>
								{isOngoing ? (
									<>
										<InfinityIcon
											aria-hidden
											className="size-4 translate-y-[0.5px]"
										/>
										<span className="sr-only">
											Aujourd'hui
										</span>
									</>
								) : (
									<span>{end}</span>
								)}
							</dd>
						</dl>
					</div>
				</CollapsibleTrigger>

				<CollapsibleContent className="overflow-hidden duration-300 data-[state=closed]:animate-collapsible-fade-up data-[state=open]:animate-collapsible-fade-down">
					{position.description && (
						<Prose className="pt-2 pl-9">
							<Markdown>{position.description}</Markdown>
						</Prose>
					)}

					{Array.isArray(position.skills) &&
						position.skills.length > 0 && (
							<ul className="flex flex-wrap gap-1.5 pt-2 pl-9">
								{position.skills.map((skill, index) => (
									<li className="flex" key={index + skill}>
										<Tag>{skill}</Tag>
									</li>
								))}
							</ul>
						)}
				</CollapsibleContent>
			</div>
		</CollapsibleWithContext>
	);
};
