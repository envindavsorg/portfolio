import type React from 'react';
import { memo } from 'react';
import { Prose } from '@/components/ui/Typography';

interface CvErrorProps {
	children?: React.ReactNode;
}

const CvError = memo(
	({ children }: CvErrorProps): React.JSX.Element => (
		<div className="flex aspect-square flex-col items-center justify-center gap-y-2 text-center">
			<h3 className="font-semibold text-lg leading-normal">Une erreur est survenue !</h3>
			<Prose>Oups, veuillez réessayer plus tard.</Prose>

			{children}
		</div>
	)
);

CvError.displayName = 'CurriculumVitaeError';

export { CvError };
