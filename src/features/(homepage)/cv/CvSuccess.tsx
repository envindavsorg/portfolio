import type React from 'react';
import { memo } from 'react';
import Confetti from 'react-confetti';

interface CvSuccessProps {
	children?: React.ReactNode;
	dateCreated?: string;
}

export const CvSuccess = memo(({ children }: CvSuccessProps) => (
	<>
		<div className="flex flex-col items-center justify-center gap-y-2 px-6 py-8 text-center">
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

			<h3 className="font-semibold text-lg text-theme leading-normal sm:text-xl">
				le mail est en route !
			</h3>

			<p className="text-sm leading-normal">
				vous devriez le recevoir dans quelques instants dans votre boîte aux
				lettres.
			</p>

			{children}
		</div>

		<div className="flex h-10 items-center justify-between border-input border-t px-3">
			<p className="text-muted-foreground text-xs">[LOG]</p>
			<p className="text-xs">
				mail envoyé avec succès à{' '}
				<span className="text-theme">
					{new Date().toLocaleTimeString('fr-FR', {
						hour: '2-digit',
						minute: '2-digit',
					})}
				</span>
			</p>
		</div>
	</>
));
