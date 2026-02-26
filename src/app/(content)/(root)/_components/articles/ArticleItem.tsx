import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/primitives/Badge';
import { Separator } from '@/components/primitives/Separator';
import { Prose } from '@/components/primitives/Typography';
import type { Content } from '@/lib/content';
import { dayjs } from '@/lib/functions';
import { cn } from '@/lib/utils';

interface ArticleItemProps {
	article: Content;
	noTitle?: boolean;
	noMetadata?: boolean;
}

export const ArticleItem = ({
	article,
	noTitle = false,
	noMetadata = false,
}: ArticleItemProps) => {
	const { slug, metadata, reading } = article;

	return (
		<Link
			aria-label={`Lire l'article : ${metadata.title}`}
			className={cn(
				'flex flex-col hover:bg-accent2',
				'max-sm:screen-line-before max-sm:screen-line-after',
				'sm:nth-[2n+1]:screen-line-before sm:nth-[2n+1]:screen-line-after'
			)}
			href={`${metadata.category?.toLowerCase()}/${slug}`}
		>
			<div className="p-4">
				{metadata.image && (
					<Image
						alt={metadata.title}
						className="w-full rounded-md object-cover object-center ring-1 ring-border ring-offset-3 ring-offset-background sm:min-h-40"
						height={1280}
						priority
						quality={90}
						src={metadata.image}
						width={2800}
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
			</div>

			<Separator />

			<div className="flex-1 p-4">
				{noTitle ? (
					<h2 className="text-balance text-sm lowercase sm:text-base">
						{metadata.description}
					</h2>
				) : (
					<div className="flex flex-col gap-y-1">
						<h2 className="text-base lowercase sm:text-xl">{metadata.title}</h2>
						<Prose className="lowercase">-- {metadata.description} --</Prose>
					</div>
				)}

				{!noMetadata && (
					<div className="mt-4 flex items-center justify-end gap-2 border-edge border-t pt-4 sm:gap-4">
						<Badge variant="primary">
							{dayjs(metadata.createdAt).format('ddd DD MMM')}
						</Badge>
						<Badge variant="primary">{reading?.time}</Badge>
						<Badge variant="primary">{reading?.words} mots</Badge>
					</div>
				)}
			</div>
		</Link>
	);
};
