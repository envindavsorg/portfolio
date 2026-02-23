import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/primitives/Badge';
import { Prose } from '@/components/text/Typography';
import { cn, dayjs } from '@/lib/utils';

interface ArticleItemProps {
	article: Post;
}

export const ArticleItem = ({ article }: ArticleItemProps) => {
	const { slug, metadata, reading } = article;
	console.log(metadata.category);

	return (
		<Link
			aria-label={`Lire l'article : ${metadata.title}`}
			className={cn(
				'flex flex-col gap-y-4 px-4 pt-4 pb-2 hover:bg-accent2',
				'max-sm:screen-line-before max-sm:screen-line-after',
				'sm:nth-[2n+1]:screen-line-before sm:nth-[2n+1]:screen-line-after'
			)}
			href={`${metadata.category?.toLowerCase()}/${slug}`}
		>
			{metadata.image && (
				<Image
					alt={metadata.title}
					className={cn(
						'w-full rounded-md object-cover object-center sm:aspect-video',
						'ring-1 ring-border ring-offset-3 ring-offset-background'
					)}
					height={630}
					quality={75}
					sizes="(max-width: 640px) 100vw, 50vw"
					src={metadata.image}
					width={1200}
				/>
			)}

			{metadata.bannerLight && (
				<Image
					alt={metadata.title}
					className={cn(
						'hidden [html.light_&]:block',
						'w-full rounded-md object-cover object-center sm:aspect-video',
						'ring-1 ring-border ring-offset-3 ring-offset-background'
					)}
					height={630}
					quality={75}
					sizes="(max-width: 640px) 100vw, 50vw"
					src={metadata.bannerLight}
					width={1200}
				/>
			)}

			{metadata.bannerDark && (
				<Image
					alt={metadata.title}
					className={cn(
						'hidden [html.dark_&]:block',
						'w-full rounded-md object-cover object-center sm:aspect-video',
						'ring-1 ring-border ring-offset-3 ring-offset-background'
					)}
					height={630}
					quality={75}
					sizes="(max-width: 640px) 100vw, 50vw"
					src={metadata.bannerDark}
					width={1200}
				/>
			)}

			<div className="flex-1">
				<div className="flex flex-col gap-y-1">
					<h2 className="text-left font-pixel-square text-base lowercase sm:text-xl">
						{metadata.title}
					</h2>
					<Prose className="lowercase">-- {metadata.description} --</Prose>
				</div>

				<div className="mt-2 flex items-center justify-end gap-2 sm:gap-4">
					<Badge className="lowercase">
						création:{' '}
						<span>{dayjs(metadata.createdAt).format('ddd DD MMM')}</span>
					</Badge>
					<Badge className="lowercase">
						lecture: <span>{reading?.time}.</span>
					</Badge>
					<Badge className="lowercase">{reading?.words} mots</Badge>
				</div>
			</div>
		</Link>
	);
};
