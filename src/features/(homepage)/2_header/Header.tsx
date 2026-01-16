import { Meteors } from '@/components/animations/Meteors';
import { Panel, PanelContent } from '@/components/ui/Panel';
import GLOBAL_DATA from '@/content/data/global';
import { HeaderImage } from '@/features/(homepage)/2_header/HeaderImage';
import { FlipSentences } from '@/registry/flip-sentences';
import { HeaderPronounceName } from './HeaderPronounceName';

const isCapture = process.env.ENV_TYPE === 'capture';

const Header = () => (
	<Panel className="flex select-none before:bg-transparent">
		<HeaderImage />

		<PanelContent className="flex flex-1 flex-col p-0">
			<div className="relative flex grow items-end overflow-hidden px-4 pb-2">
				<p className="line-clamp-1 text-xs text-zinc-300 dark:text-zinc-800">
					Bienvenue sur mon portfolio personnel. Bonne visite !
				</p>

				<Meteors number={50} />
			</div>

			<div className="flex w-full items-center justify-between gap-x-3 border-edge border-t px-4 py-1">
				<h1 className="text-balance font-extrabold text-3xl sm:text-4xl">{GLOBAL_DATA.USER.fullName}</h1>

				{!isCapture && <HeaderPronounceName />}
			</div>

			<div className="min-h-8 border-edge border-t px-4 py-1">
				<FlipSentences disableAnimation={isCapture} sentences={GLOBAL_DATA.OVERVIEW.sentences} />
			</div>
		</PanelContent>
	</Panel>
);

Header.displayName = 'Header';

export { Header };
