import Image from 'next/image';
import type React from 'react';

interface YouTubeEmbedProps {
	videoId: string;
	title: string;
}

export const YouTubeEmbed = ({
	videoId,
	title,
}: YouTubeEmbedProps): React.JSX.Element => (
	<div className="relative">
		<iframe
			allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
			allowFullScreen
			className="aspect-video w-full rounded-lg"
			referrerPolicy="strict-origin-when-cross-origin"
			src={`https://www.youtube.com/embed/${videoId}`}
			title={title}
		/>

		<div className="pointer-events-none absolute inset-0 rounded-lg ring-1 ring-black/10 ring-inset dark:ring-white/10" />
	</div>
);

export const FramedImage = ({
	...props
}: React.ComponentProps<typeof Image>): React.JSX.Element => (
	<figure className="relative [&_img]:rounded-lg">
		<Image {...props} alt="Frame" />
		<div className="pointer-events-none absolute inset-0 rounded-lg ring-1 ring-black/10 ring-inset dark:ring-white/10" />
	</figure>
);
