import type { TOCItemType } from 'fumadocs-core/toc';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface TocItemProps {
	item: TOCItemType;
	isActive: boolean;
	onNavigate: () => void;
}

export const TocItem = ({ item, isActive, onNavigate }: TocItemProps) => (
	<div
		className={cn(
			'border-l py-1.5 transition-colors',
			isActive ? 'border-theme' : 'border-input'
		)}
	>
		<Link
			className={cn(
				'block pl-3 text-sm lowercase underline-offset-4 transition-colors',
				isActive ? 'font-medium text-theme' : 'text-foreground/60',
				'hover:text-theme hover:underline'
			)}
			href={item.url}
			onClick={onNavigate}
		>
			{item.title}
		</Link>
	</div>
);
