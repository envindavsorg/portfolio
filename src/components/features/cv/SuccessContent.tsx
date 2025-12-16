import type { Player } from '@lordicon/react';
import { forwardRef, memo, useEffect } from 'react';
import Confetti from 'react-confetti';
import { Button } from '@/components/ui/Button';
import {
	DialogClose,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/Dialog';
import { PlaneIcon } from '@/elements/icons/Plane';

type SuccessContentProps = {
	onClose: () => void;
};

export const SuccessContent = memo(
	forwardRef<Player, SuccessContentProps>(({ onClose }, ref) => {
		useEffect(() => {
			if (typeof ref === 'object' && ref?.current) {
				ref.current.playFromBeginning();
			}
		}, [ref]);

		return (
			<>
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

				<DialogHeader className="flex flex-col items-center justify-center">
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

					<DialogTitle className="mt-2">
						Le mail est en route !
					</DialogTitle>
					<DialogDescription className="text-center">
						N'hésitez pas à vérifier votre boîte de réception et
						votre dossier de courrier indésirable.
					</DialogDescription>

					<DialogClose asChild className="mt-3">
						<Button onClick={onClose}>D'accord !</Button>
					</DialogClose>
				</DialogHeader>
			</>
		);
	}),
);
