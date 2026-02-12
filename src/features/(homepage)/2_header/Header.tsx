import { Panel, PanelContent } from '@/components/Panel';
import GLOBAL_DATA from '@/content/data/global';
import { FlipSentences } from '@/registry/flip-sentences';
import { HeaderImage } from './HeaderImage';
import { FlickeringGrid } from '@/components/animations/FlickeringGrid';
import { TextAnimate } from '@/components/text/TextAnimate';
import { HeaderPronounce } from './HeaderPronounce';

const capture = process.env.ENV_TYPE === 'capture';

export const Header = () => (
	<Panel>
		<div className="flex">
			<HeaderImage
				name={GLOBAL_DATA.USER.fullName}
				photo={GLOBAL_DATA.USER.photo}
				capture={capture}
				pronunciation={GLOBAL_DATA.USER.pronunciation}
			/>

			<PanelContent className="flex flex-1 flex-col p-0">
				<div className="relative flex grow overflow-hidden">
					<FlickeringGrid
						className="absolute inset-0 z-0 size-full "
						squareSize={4}
						gridGap={4}
						color="#6B7280"
						maxOpacity={0.4}
						flickerChance={0.1}
						height={800}
						width={800}
					/>
				</div>

				<div className="flex w-full items-center justify-between gap-x-3 border-edge border-t px-2 sm:py-1 sm:px-3">
					<h1 className="sr-only">{GLOBAL_DATA.USER.fullName}</h1>
					<TextAnimate
						animation="blurInUp"
						by="character"
						className="text-balance font-extrabold text-[28px] leading-snug sm:text-4xl"
						delay={0.75}
						once
					>
						{GLOBAL_DATA.USER.fullName}
					</TextAnimate>

					{!capture && (
						<HeaderPronounce
							pronunciation={GLOBAL_DATA.USER.pronunciation}
							className="max-sm:hidden"
						/>
					)}
				</div>

				<div className="flex min-h-6 sm:min-h-8 items-center border-edge border-t px-2 sm:px-3">
					<FlipSentences
						className="text-muted-foreground text-xs sm:text-sm"
						disableAnimation={process.env.ENV_TYPE === 'capture'}
						sentences={GLOBAL_DATA.OVERVIEW.sentences}
					/>
				</div>
			</PanelContent>
		</div>
	</Panel>
);
