import type React from 'react';
import type { Experience } from '@/components/features/experiences/data/experiences';
import { ExperiencePositionItem } from './ExperiencePositionItem';

type ExperienceItemProps = {
	experience: Experience;
};

export const ExperienceItem = ({
	experience,
}: ExperienceItemProps): React.JSX.Element => (
	<div className="screen-line-after space-y-4 py-4">
		<div className="flex items-center gap-3">
			<div className="flex size-6 shrink-0 select-none items-center justify-center">
				<span className="flex size-2 rounded-full bg-zinc-300 dark:bg-zinc-600" />
			</div>

			<h3 className="text-balance font-medium text-base leading-snug sm:text-lg">
				{experience.companyName}
			</h3>

			{experience.isCurrentEmployer && (
				<span className="relative flex items-center justify-center">
					<span className="absolute inline-flex size-3 animate-ping rounded-full bg-theme opacity-50" />
					<span className="relative inline-flex size-2 rounded-full bg-theme" />
					<span className="sr-only">Poste actuellement occupé</span>
				</span>
			)}
		</div>

		<div className="relative space-y-4 before:absolute before:left-3 before:h-full before:w-px before:bg-border">
			{experience.positions.map((position) => (
				<ExperiencePositionItem key={position.id} position={position} />
			))}
		</div>
	</div>
);
