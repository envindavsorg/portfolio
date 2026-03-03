import { PixelHeading } from '../blocks/PixelHeading';

interface ArticleTitleProps {
	title: string;
}

export const ArticleTitle = ({ title }: ArticleTitleProps) => (
	<div className="screen-line-after flex w-full items-center justify-between gap-x-3 px-2 sm:px-4">
		<PixelHeading
			autoPlay
			className="text-balance font-extrabold text-[28px] lowercase leading-snug sm:text-4xl"
			mode="multi"
		>
			{title}
		</PixelHeading>
	</div>
);
