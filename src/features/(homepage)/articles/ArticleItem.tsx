import Image from 'next/image';
import Link from 'next/link';
import { Prose } from '@/components/ui/Typography';
import { cn, dayjs } from '@/lib/utils';

interface ArticleItemProps {
	article: Post;
}

export const ArticleItem = ({ article }: ArticleItemProps) => {
	const { slug, metadata } = article;

	return (
		<Link
			aria-label="Lire l'article"
			className={cn(
				'flex flex-col gap-y-4 p-4 hover:bg-accent2',
				'max-sm:screen-line-before max-sm:screen-line-after',
				'sm:nth-[2n+1]:screen-line-before sm:nth-[2n+1]:screen-line-after'
			)}
			href={`/blog/${slug}`}
		>
			{metadata.image && (
				<Image
					alt={metadata.title}
					className={cn(
						'aspect-video h-full select-none rounded-md object-cover object-center max-sm:h-40',
						'ring-1 ring-border ring-offset-3 ring-offset-background'
					)}
					height={630}
					priority
					quality={100}
					src={metadata.image}
					unoptimized
					width={1200}
				/>
			)}

			<div className="flex flex-1 flex-col gap-y-1">
				<h2 className="text-balance font-semibold text-lg lowercase sm:text-xl">
					{metadata.title}
				</h2>
				<Prose className="lowercase">{metadata.description}</Prose>

				<div className="mt-2 flex items-center gap-x-3">
					<dl>
						<dt className="sr-only">date de création de l'article</dt>
						<dd>
							<p className="font-bold text-theme text-xs sm:text-sm">
								{dayjs(article.metadata.createdAt).format('ddd DD MMM')}
							</p>
						</dd>
					</dl>

					<span className="size-1 rounded-full bg-theme" />

					<dl>
						<dt className="sr-only">temps de lecture de l'article</dt>
						<dd>
							<p className="font-bold text-theme text-xs sm:text-sm">
								{article.reading?.time}.
							</p>
						</dd>
					</dl>

					<span className="size-1 rounded-full bg-theme" />

					<dl>
						<dt className="sr-only">nombre de mots dans l'article</dt>
						<dd>
							<p className="font-bold text-theme text-xs sm:text-sm">
								{article.reading?.words} mots
							</p>
						</dd>
					</dl>
				</div>
			</div>
		</Link>
	);
};
