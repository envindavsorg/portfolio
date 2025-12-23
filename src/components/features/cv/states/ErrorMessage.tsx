import type { Player } from '@lordicon/react';
import type React from 'react';
import { forwardRef, memo, useEffect } from 'react';
import { WarningIcon } from '@/components/icons/Warning';
import { Prose } from '@/components/ui/Typography';
import { cn } from '@/lib/utils';

type ErrorMessageProps = {
	children?: React.ReactNode;
	className?: string;
};

export const ErrorMessage = memo(
	forwardRef<Player, ErrorMessageProps>(
		({ children, className }, ref): React.JSX.Element => {
			useEffect(() => {
				if (typeof ref === 'object' && ref?.current) {
					ref.current.playFromBeginning();
				}
			}, [ref]);

			return (
				<div
					className={cn(
						'flex aspect-square flex-col items-center justify-center text-center',
						className
					)}
				>
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

					<div className="mt-6 mb-6 grid gap-1.5">
						<h3 className="text-balance font-semibold text-xl sm:text-2xl">
							Une erreur est survenue !
						</h3>
						<Prose>
							Oups, il semble qu'il y ait eu un <span>problème</span> lors de
							l'envoi du mail. Veuillez réessayer plus tard.
						</Prose>
					</div>

					{children}
				</div>
			);
		}
	)
);
