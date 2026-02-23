import Image from 'next/image';
import { cn } from '@/lib/utils';
import { HeaderPronounce } from './HeaderPronounce';

interface HeaderImageProps {
	name: string;
	photo: string;
	capture: boolean;
	pronunciation: string;
}

export const HeaderImage = ({
	name,
	photo,
	capture,
	pronunciation,
}: HeaderImageProps) => (
	<div className="relative shrink-0 border-edge border-r">
		<div className="mx-1 my-1.25">
			<Image
				alt={name}
				className={cn(
					'size-24 sm:size-32 lg:size-40',
					'aspect-square rounded-full object-cover object-top',
					'ring-1 ring-theme ring-offset-3 ring-offset-background'
				)}
				height={1404}
				priority
				sizes="(max-width: 640px) 104px, (max-width: 1024px) 128px, 160px"
				src={photo}
				width={1190}
			/>
		</div>

		{!capture && (
			<HeaderPronounce
				className="absolute right-1 bottom-1 sm:hidden"
				pronunciation={pronunciation}
			/>
		)}
	</div>
);
