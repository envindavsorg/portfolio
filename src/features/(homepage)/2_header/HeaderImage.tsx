import Image from 'next/image';
import { cn } from '@/lib/utils';

interface HeaderImageProps {
	name: string;
	photo: string;
}

export const HeaderImage = ({ name, photo }: HeaderImageProps) => (
	<div className="shrink-0 border-edge border-r">
		<div className="mx-1 my-1.25">
			<Image
				alt={name}
				className={cn(
					'size-24 sm:size-32 lg:size-40',
					'aspect-square rounded-full object-cover object-top',
					'ring-1 ring-edge ring-offset-3 ring-offset-background'
				)}
				height={1404}
				priority
				sizes="(max-width: 640px) 104px, (max-width: 1024px) 128px, 160px"
				src={photo}
				width={1190}
			/>
		</div>
	</div>
);
