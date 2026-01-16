import Image from 'next/image';
import Link from 'next/link';
import { Prose } from '@/components/ui/Typography';
import { cn, dayjs } from '@/lib/utils';

interface ArticleItemProps {
	article: Post;
}

const ArticleItem = ({ article }: ArticleItemProps) => {
	const { slug, metadata } = article;

	return (
		<Link
			aria-label={`Lire l'article : ${metadata.title}`}
			className={cn(
				'flex flex-col gap-y-4 p-4 hover:bg-accent2',
				'max-sm:screen-line-before max-sm:screen-line-after',
				'sm:nth-[2n+1]:screen-line-before sm:nth-[2n+1]:screen-line-after'
			)}
			href={`/blog/${slug}`}
		>
			{metadata.imageDark && (
				<Image
					alt={metadata.title}
					className={cn(
						'hidden dark:block',
						'aspect-video size-full select-none rounded-md object-cover object-center',
						'ring-1 ring-border ring-offset-3 ring-offset-background'
					)}
					height={630}
					priority
					quality={100}
					src={metadata.imageDark}
					unoptimized
					width={1200}
				/>
			)}

			{metadata.imageLight && (
				<Image
					alt={metadata.title}
					className={cn(
						'block dark:hidden',
						'aspect-video size-full select-none rounded-md object-cover object-center',
						'ring-1 ring-border ring-offset-3 ring-offset-background'
					)}
					height={630}
					priority
					quality={100}
					src={metadata.imageLight}
					unoptimized
					width={1200}
				/>
			)}

			<div className="flex flex-1 flex-col gap-y-1">
				<h2 className="text-balance font-semibold text-base">{metadata.title}</h2>
				<Prose className="text-muted-foreground text-xs">{metadata.description}</Prose>

				<div className="mt-2 flex items-center gap-x-3">
					<dl className="font-medium text-foreground text-xs">
						<dt className="sr-only">Date de création de l'article</dt>
						<dd>
							<p>
								<time dateTime={dayjs(article.metadata.createdAt).toISOString()}>
									{dayjs(article.metadata.createdAt).format('ddd DD MMM')}
								</time>
							</p>
						</dd>
					</dl>

					<span className="size-1 rounded-full bg-foreground" />

					<dl className="font-medium text-foreground text-xs">
						<dt className="sr-only">Temps de lecture de l'article</dt>
						<dd>
							<p>{article.reading?.time}.</p>
						</dd>
					</dl>

					<span className="size-1 rounded-full bg-foreground" />

					<dl className="font-medium text-foreground text-xs">
						<dt className="sr-only">Nombre de mots dans l'article</dt>
						<dd>
							<p>{article.reading?.words} mots</p>
						</dd>
					</dl>
				</div>
			</div>
		</Link>
	);
};

ArticleItem.displayName = 'ArticleItem';

export { ArticleItem };
