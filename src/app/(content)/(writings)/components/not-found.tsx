import { ArrowLeftIcon } from '@phosphor-icons/react/ssr';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Counter } from '@/components/ui/Counter';
import { Divider } from '@/components/ui/Divider';
import { Panel, PanelContent } from '@/components/ui/Panel';
import { Prose } from '@/components/ui/Typography';
import { cn } from '@/lib/utils';

export const metadata = {
	title: 'Page introuvable',
	description:
		'Oups ! Cette page n’existe pas, peut-être avez-vous cliqué sur un ancien lien ou avez-vous fait une faute de frappe.',
};

const NotFound = () => (
	<div className="mx-auto flex h-[calc(100svh-5.5rem)] flex-col justify-center">
		<div className="screen-line-after grow border-edge border-x after:-bottom-px">
			<div className="flex h-4" />
		</div>

		<div className="screen-line-after flex border-edge border-x">
			<div className="shrink-0 border-edge border-r">
				<div className="mx-[2px] my-[3px]">
					<div
						className={cn(
							'flex items-center justify-center gap-x-1.5 rounded-full',
							'size-26 select-none sm:size-32 lg:size-40',
							'ring-1 ring-border ring-offset-2 ring-offset-background',
							'font-extrabold font-mono text-3xl text-theme md:text-5xl',
							'bg-[radial-gradient(var(--pattern-foreground)_1px,transparent_0)] bg-center bg-size-[10px_10px] [--pattern-foreground:var(--color-zinc-950)]/5 dark:[--pattern-foreground:var(--color-white)]/5'
						)}
					>
						<Counter step={2} value={4} />
						<Counter step={1} value={0} />
						<Counter step={1} value={4} />
					</div>
				</div>
			</div>

			<div className="flex flex-1 flex-col">
				<div
					className={cn(
						'flex grow items-end pb-1 pl-4',
						'bg-[repeating-linear-gradient(315deg,var(--pattern-foreground)_0,var(--pattern-foreground)_1px,transparent_0,transparent_50%)] bg-size-[10px_10px] [--pattern-foreground:var(--color-edge)]/56'
					)}
				>
					<div className="line-clamp-1 select-none font-mono text-xs text-zinc-300 dark:text-zinc-800">
						<span className="min-sm:hidden">text-3xl</span>{' '}
						<span className="max-sm:hidden">text-4xl</span>{' '}
						<span>text-foreground</span> <span>font-semibold</span>{' '}
						<span>text-balance</span>
					</div>
				</div>

				<div className="border-edge border-t">
					<h1 className="flex items-center text-balance pl-4 font-semibold text-2xl sm:text-4xl">
						Ce composant n’existe pas !
					</h1>
				</div>
			</div>
		</div>

		<Divider />

		<Panel>
			<PanelContent>
				<Prose>
					Oups, peut-être avez-vous cliqué sur un ancien lien ou avez-vous fait
					une faute de frappe ...
				</Prose>
			</PanelContent>
			<div className="screen-line-before flex justify-center py-2">
				<Button asChild>
					<Link aria-label="Retour en arrière" href="/">
						<ArrowLeftIcon />
						Retour en arrière
					</Link>
				</Button>
			</div>
		</Panel>

		<div className="grow border-edge border-x" />
	</div>
);

export default NotFound;
