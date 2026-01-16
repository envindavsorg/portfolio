import type React from 'react';
import { memo } from 'react';
import Confetti from 'react-confetti';
import { Prose } from '@/components/ui/Typography';

interface CvSuccessProps {
	children?: React.ReactNode;
}

const CvSuccess = memo(({ children }: CvSuccessProps) => (
	<div className="flex aspect-square flex-col items-center justify-center gap-y-2 text-center">
		<Confetti
			className="size-full"
			gravity={0.1}
			initialVelocityX={2}
			initialVelocityY={2}
			numberOfPieces={25}
			opacity={1}
			recycle
			run
			wind={0.01}
		/>

		<h3 className="font-semibold text-lg leading-normal">Le mail est en route !</h3>
		<Prose>Vous devriez le recevoir dans quelques instants.</Prose>

		{children}
	</div>
));

CvSuccess.displayName = 'CurriculumVitaeSuccess';

export { CvSuccess };
