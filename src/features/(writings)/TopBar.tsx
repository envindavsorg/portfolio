import { ArrowLeftIcon, ArrowRightIcon } from '@phosphor-icons/react/ssr';
import Link from 'next/link';
import { Button } from '@/components/buttons/Button';
import { KeyboardShortcuts } from '@/features/(writings)/KeyboardShortcuts';
import { ShareMenu } from '@/features/(writings)/ShareMenu';
import { findNeighbour, getPostsByCategory } from '@/lib/blog/posts';

interface TopBarProps {
	type: 'article' | 'utils' | 'components';
	slug: string;
	baseUrl: string;
	postSlug: string;
	title: string;
}

export const TopBar = ({
	type,
	slug,
	baseUrl,
	postSlug,
	title,
}: TopBarProps) => {
	const allPosts: Post[] = getPostsByCategory(type);
	const { previous, next } = findNeighbour(allPosts, slug);

	return (
		<>
			<KeyboardShortcuts basePath="/utils" next={next} previous={previous} />

			<div className="screen-line-before screen-line-after flex items-center justify-between px-3 py-2">
				<Link href={baseUrl}>
					<Button className="group/return px-0 hover:text-theme" variant="link">
						<ArrowLeftIcon className="group-hover/return:text-theme" /> {title}
					</Button>
				</Link>

				<div className="flex items-center gap-x-4">
					<ShareMenu url={`${baseUrl}/${postSlug}`} />

					<div className="flex items-center gap-x-2">
						{previous && (
							<Link href={`${baseUrl}/${previous.slug}`}>
								<Button
									className="border dark:inset-shadow-[1px_1px_1px,0px_0px_2px] dark:inset-shadow-white/15 dark:border-0"
									size="icon"
									variant="outline"
								>
									<ArrowLeftIcon />
								</Button>
							</Link>
						)}
						{next && (
							<Link href={`${baseUrl}/${next.slug}`}>
								<Button
									className="border dark:inset-shadow-[1px_1px_1px,0px_0px_2px] dark:inset-shadow-white/15 dark:border-0"
									size="icon"
									variant="outline"
								>
									<ArrowRightIcon />
								</Button>
							</Link>
						)}
					</div>
				</div>
			</div>
		</>
	);
};
