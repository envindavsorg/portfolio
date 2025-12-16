import type { Player } from '@lordicon/react';
import { forwardRef, memo, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import {
	DialogClose,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/Dialog';
import { WarningIcon } from '@/elements/icons/Warning';

type ErrorContentProps = {
	onClose: () => void;
};

export const ErrorContent = memo(
	forwardRef<Player, ErrorContentProps>(({ onClose }, ref) => {
		useEffect(() => {
			if (typeof ref === 'object' && ref?.current) {
				ref.current.playFromBeginning();
			}
		}, [ref]);

		return (
			<DialogHeader className="flex flex-col items-center justify-center">
				<WarningIcon
					onCompleteAction={() => {
						if (typeof ref === 'object' && ref?.current) {
							ref.current.playFromBeginning();
						}
					}}
					ref={ref}
					size={72}
					state="hover-error-1"
				/>

				<DialogTitle className="mt-2">
					Une erreur est survenue !
				</DialogTitle>
				<DialogDescription className="text-center">
					Oups, il semble qu'il y ait eu un problème lors de l'envoi
					du mail. Veuillez réessayer plus tard.
				</DialogDescription>

				<DialogClose asChild className="mt-3">
					<Button onClick={onClose}>D'accord !</Button>
				</DialogClose>
			</DialogHeader>
		);
	}),
);
