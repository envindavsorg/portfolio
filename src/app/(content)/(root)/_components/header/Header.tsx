import Image from 'next/image';
import { FlickeringGrid } from '@/components/blocks/FlickeringGrid';
import { PixelHeading } from '@/components/blocks/PixelHeading';
import { Panel, PanelContent } from '@/components/primitives/Panel';
import GLOBAL_DATA from '@/content/data/global';
import { cn } from '@/lib/utils';
import { FlipSentences } from '@/registry/flip-sentences';
import { HeaderPronounce } from './HeaderPronounce';

const capture = process.env.ENV_TYPE === 'capture';
const { USER, OVERVIEW } = GLOBAL_DATA;

export const Header = () => (
	<Panel>
		<div className="flex">
			<div
				className={cn(
					'relative shrink-0 border-edge border-r',
					'[&_img]:ring-1 [&_img]:ring-edge [&_img]:ring-offset-3 [&_img]:ring-offset-background',
					'[&_img]:m-1 [&_img]:size-24 [&_img]:rounded-full [&_img]:object-cover [&_img]:object-top [&_img]:sm:size-40'
				)}
			>
				<Image
					alt={USER.fullName}
					height={1404}
					priority
					sizes="(max-width: 640px) 104px, (max-width: 1024px) 128px, 160px"
					src={USER.photo}
					width={1190}
				/>
				{!capture && (
					<HeaderPronounce
						className="absolute right-1 bottom-1 sm:hidden"
						pronunciation={USER.pronunciation}
					/>
				)}
			</div>

			<PanelContent className="flex flex-1 flex-col space-y-0 p-0">
				<FlickeringGrid />
				<div className="flex items-center justify-between gap-x-3 border-edge border-t px-2 sm:px-3">
					<PixelHeading>{USER.fullName}</PixelHeading>
					{!capture && (
						<HeaderPronounce
							className="max-sm:hidden"
							pronunciation={USER.pronunciation}
						/>
					)}
				</div>
				<div className="flex min-h-6 items-center border-edge border-t px-2 sm:min-h-8 sm:px-3">
					<FlipSentences
						disableAnimation={capture}
						sentences={OVERVIEW.sentences}
					/>
				</div>
			</PanelContent>
		</div>
	</Panel>
);
