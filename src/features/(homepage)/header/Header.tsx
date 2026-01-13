import Image from 'next/image';
import type React from 'react';
import { USER } from '@/lib/user';
import { cn } from '@/lib/utils';
import { FlipSentences } from '@/registry/flip-sentences';
import { HeaderPronounceName } from './HeaderPronounceName';

const isCapture = process.env.ENV_TYPE === 'capture';
const PATTERN_STYLE = {
	backgroundImage: `repeating-linear-gradient(
        315deg,
        var(--pattern-foreground) 0,
        var(--pattern-foreground) 1px,
        transparent 0,
        transparent 50%
    )`,
	backgroundSize: '10px 10px',
};

const Header = (): React.JSX.Element => (
	<div className="screen-line-after flex border-edge border-x">
		<div className="shrink-0 border-edge border-r">
			<div className="mx-[2px] my-[3px]">
				<Image
					alt={`${USER.firstName} ${USER.lastName}`}
					className={cn(
						'aspect-square size-26 object-cover object-top sm:size-32 lg:size-40',
						'select-none rounded-full ring-1 ring-border ring-offset-3 ring-offset-background'
					)}
					fetchPriority="high"
					height={1404}
					sizes="(max-width: 640px) 104px, (max-width: 1024px) 128px, 160px"
					src={USER.photo}
					width={1190}
				/>
			</div>
		</div>

		<div className="flex flex-1 flex-col">
			<div
				className={cn(
					'flex grow items-end pb-1 pl-4',
					'[--pattern-foreground:var(--color-edge)]/56'
				)}
				style={PATTERN_STYLE}
			>
				<div className="line-clamp-1 select-none font-mono text-xs text-zinc-300 dark:text-zinc-800">
					Bienvenue sur mon portfolio personnel.
				</div>
			</div>

			<div className="border-edge border-t">
				<div className="flex w-full items-center gap-x-3">
					<h1 className="text-balance pl-4 font-bold font-mono text-2xl sm:text-4xl">
						{USER.firstName} {USER.lastName}
					</h1>

					{USER.namePronunciationUrl && !isCapture && (
						<HeaderPronounceName sound={USER.namePronunciationUrl} />
					)}
				</div>

				<div className="min-h-[2rem] border-edge border-t py-1 pl-4">
					<FlipSentences
						disableAnimation={isCapture}
						sentences={[
							'Imagine, code, crée, inspire.',
							'Chaque petit pixel compte !',
							'Du concept au déploiement !',
							'Chaque petit détail compte !',
						]}
					/>
				</div>
			</div>
		</div>
	</div>
);

Header.displayName = 'Header';

export { Header };
