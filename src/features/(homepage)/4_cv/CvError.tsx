import type React from 'react';
import { memo } from 'react';
import { Prose } from '@/components/ui/Typography';

interface CvErrorProps {
	children?: React.ReactNode;
	dateCreated?: string;
}

const CvError = memo(({ children }: CvErrorProps) => (
	<>
		<div className="flex flex-col items-center justify-center gap-y-2 py-8 text-center">
			<h3 className="font-semibold text-destructive text-xl leading-normal">
				une erreur est survenue !
			</h3>

			<Prose>oups, veuillez réessayer plus tard.</Prose>

			{children}
		</div>

		<div className="flex h-10 items-center justify-between border-input border-t px-3">
			<p className="text-muted-foreground text-xs">[LOG]</p>
			<p className="text-xs">
				erreur survenue à{' '}
				<span className="text-destructive">
					{new Date().toLocaleTimeString('fr-FR', {
						hour: '2-digit',
						minute: '2-digit',
					})}
				</span>
			</p>
		</div>
	</>
));

CvError.displayName = 'CurriculumVitaeError';

export { CvError };
