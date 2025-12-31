import type { Player } from '@lordicon/react';
import type React from 'react';
import { forwardRef, memo, useEffect } from 'react';
import Confetti from 'react-confetti';
import { PlaneIcon } from '@/components/icons/lottie/Plane';
import { Prose } from '@/components/ui/Typography';
import { cn } from '@/lib/utils';

interface SuccessMessageProps {
	children?: React.ReactNode;
	className?: string;
}

export const SuccessMessage = memo(
	forwardRef<Player, SuccessMessageProps>(
		({ children, className }, ref): React.JSX.Element => {
			useEffect(() => {
				if (typeof ref === 'object' && ref?.current) {
					ref.current.playFromBeginning();
				}
			}, [ref]);

			return (
				<div
					className={cn(
						'flex flex-col items-center justify-center text-center',
						className
					)}
				>
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

					<PlaneIcon
						onCompleteAction={() => {
							if (typeof ref === 'object' && ref?.current) {
								ref.current.playFromBeginning();
							}
						}}
						ref={ref}
						size={72}
						state="hover-takeoff"
					/>

					<div className="mt-6 mb-6 grid gap-1.5">
						<h3 className="text-balance font-semibold text-xl sm:text-2xl">
							Le mail est en route !
						</h3>
						<Prose>
							N'hésitez pas à vérifier votre <span>boîte de réception</span> et
							votre dossier de <span>courrier indésirable</span> aussi.
						</Prose>
					</div>

					{children}
				</div>
			);
		}
	)
);
