import { SealCheckIcon } from '@phosphor-icons/react/dist/ssr';
import Image from 'next/image';
import type React from 'react';
import { PronounceName } from '@/components/sound/PronounceName';
import { USER } from '@/config/user';
import { cn } from '@/lib/utils';
import { FlipSentences } from '@/registry/flip-sentences';

export type HeaderProps = {
	capture?: boolean;
};

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

export const Header = ({ capture }: HeaderProps): React.JSX.Element => (
	<div className="screen-line-after flex border-edge border-x">
		<div className="shrink-0 border-edge border-r">
			<div className="mx-[2px] my-[3px]">
				<Image
					alt={`${USER.firstName} ${USER.lastName}`}
					className={cn(
						'aspect-square size-26 object-cover object-top sm:size-32 lg:size-40',
						'select-none rounded-full ring-1 ring-border ring-offset-3 ring-offset-background',
					)}
					fetchPriority="high"
					src={USER.photo}
					height={1404}
					width={1190}
					sizes="(max-width: 640px) 104px, (max-width: 1024px) 128px, 160px"
				/>
			</div>
		</div>

		<div className="flex flex-1 flex-col">
			<div
				className={cn(
					'flex grow items-end pb-1 pl-4',
					'[--pattern-foreground:var(--color-edge)]/56',
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

					<div className="flex items-center gap-x-2">
						<SealCheckIcon className="size-5 text-theme" />
						{USER.namePronunciationUrl && !capture && (
							<PronounceName sound={USER.namePronunciationUrl} />
						)}
					</div>
				</div>

				<div className="min-h-[2rem] border-edge border-t py-1 pl-4">
					<FlipSentences
						sentences={[
							'Imagine, code, crée, inspire.',
							'Chaque petit pixel compte !',
							'Du concept au déploiement !',
							'Chaque petit détail compte !',
						]}
						disableAnimation={capture}
					/>
				</div>
			</div>
		</div>
	</div>
);
