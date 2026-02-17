import { FlickeringGrid } from '@/components/animations/FlickeringGrid';
import { Panel, PanelContent } from '@/components/Panel';
import { PixelHeading } from '@/components/text/PixelHeading';
import GLOBAL_DATA from '@/content/data/global';
import { FlipSentences } from '@/registry/flip-sentences';
import { HeaderImage } from './HeaderImage';
import { HeaderPronounce } from './HeaderPronounce';

const capture = process.env.ENV_TYPE === 'capture';

export const Header = () => (
	<Panel>
		<div className="flex">
			<HeaderImage
				capture={capture}
				name={GLOBAL_DATA.USER.fullName}
				photo={GLOBAL_DATA.USER.photo}
				pronunciation={GLOBAL_DATA.USER.pronunciation}
			/>

			<PanelContent className="flex flex-1 flex-col p-0">
				<div className="relative flex grow overflow-hidden">
					<FlickeringGrid
						className="absolute inset-0 z-0 size-full"
						color="#6B7280"
						flickerChance={0.1}
						gridGap={4}
						height={800}
						maxOpacity={0.4}
						squareSize={4}
						width={800}
					/>
				</div>

				<div className="flex w-full items-center justify-between gap-x-3 border-edge border-t px-2 sm:px-3 sm:py-1">
					<h1 className="sr-only">{GLOBAL_DATA.USER.fullName}</h1>

					<PixelHeading
						autoPlay
						className="text-balance font-extrabold text-[28px] leading-snug sm:text-4xl"
						mode="multi"
					>
						{GLOBAL_DATA.USER.fullName}
					</PixelHeading>

					{!capture && (
						<HeaderPronounce
							className="max-sm:hidden"
							pronunciation={GLOBAL_DATA.USER.pronunciation}
						/>
					)}
				</div>

				<div className="flex min-h-6 items-center border-edge border-t px-2 sm:min-h-8 sm:px-3">
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
