import { CheckIcon, InfoIcon } from '@phosphor-icons/react/ssr';
import type React from 'react';
import {
	AnimatedSpan,
	Terminal,
	TypingAnimation,
} from '@/components/animations/Terminal';

export const WritingsTerminal = (): React.JSX.Element => (
	<Terminal className="screen-line-before">
		<TypingAnimation className="text-xs sm:text-sm">
			&gt; pnpm dlx shadcn@latest add @envindavsorg/composant
		</TypingAnimation>
		<AnimatedSpan className="mt-2 flex items-center gap-x-2 text-xs sm:text-sm">
			<CheckIcon className="size-3 text-green-500" weight="bold" />
			<span>Vérification du registre ...</span>
		</AnimatedSpan>
		<AnimatedSpan className="mt-2 flex items-center gap-x-2 text-xs sm:text-sm">
			<CheckIcon className="size-3 text-green-500" weight="bold" />
			<span>Installation de votre composant ...</span>
		</AnimatedSpan>
		<AnimatedSpan className="mt-2 flex flex-col gap-y-1 text-xs sm:text-sm">
			<div className="flex items-center gap-x-2 text-blue-500">
				<InfoIcon className="size-3" weight="bold" />
				<span>1 fichier crée :</span>
			</div>
			<span className="pl-4 text-muted-foreground">
				- components/votre-composant.tsx
			</span>
		</AnimatedSpan>
		<TypingAnimation className="mt-4 font-semibold text-green-500 text-xs sm:text-sm">
			Utilisez mes composants dans votre projet !
		</TypingAnimation>
	</Terminal>
);
