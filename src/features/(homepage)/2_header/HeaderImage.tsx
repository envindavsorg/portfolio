import Image from 'next/image';
import type React from 'react';
import GLOBAL_DATA from '@/content/data/global';

const HeaderImage = (): React.JSX.Element => (
	<div className="shrink-0 border-edge border-r">
		<div className="mx-1 my-1.25">
			<Image
				alt={GLOBAL_DATA.USER.fullName}
				className="aspect-square size-26 rounded-full object-cover object-top ring-1 ring-theme ring-offset-3 ring-offset-background sm:size-32 lg:size-40"
				height={1404}
				priority
				sizes="(max-width: 640px) 104px, (max-width: 1024px) 128px, 160px"
				src={GLOBAL_DATA.USER.photo}
				width={1190}
			/>
		</div>
	</div>
);

HeaderImage.displayName = 'HeaderImage';

export { HeaderImage };
