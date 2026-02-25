'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { LLMCopyButtonWithViewOptions } from '@/actions/blog/post.action';
import { ArrowLeftIcon } from '@/components/blocks/icons/ArrowLeftIcon';
import { ArrowRightIcon } from '@/components/blocks/icons/ArrowRightIcon';
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/primitives/Breadcrumb';
import { Button } from '@/components/primitives/Button';
import { Divider } from '@/components/primitives/Divider';
import type { Content } from '@/lib/content';
import { KeyboardShortcuts } from './KeyboardShortcuts';
import { ShareMenu } from './ShareMenu';

interface TopNavProps {
	items: Content[];
	item: Content;
	slug: string;
	description: string;
}

export const TopNav = ({ items, item, slug, description }: TopNavProps) => {
	const currentIndex = items.findIndex((i) => i.slug === slug);
	const previous = currentIndex > 0 ? items[currentIndex - 1] : null;
	const next = currentIndex < items.length - 1 ? items[currentIndex + 1] : null;

	const iconArrowLeftRef = useRef<AnimatedIconHandle>(null);
	const iconArrowRightRef = useRef<AnimatedIconHandle>(null);

	return (
		<>
			<KeyboardShortcuts
				basePath={`/${item.metadata.category}`}
				next={next}
				previous={previous}
			/>

			<div className="screen-line-after px-2 py-0.5 sm:px-4">
				<Breadcrumb>
					<BreadcrumbList>
						<BreadcrumbItem>
							<BreadcrumbLink
								aria-label={description}
								href={`/${item.metadata.category}`}
							>
								{description}
							</BreadcrumbLink>
						</BreadcrumbItem>
						<BreadcrumbSeparator />
						<BreadcrumbItem>
							<BreadcrumbPage>{item.metadata.title}</BreadcrumbPage>
						</BreadcrumbItem>
					</BreadcrumbList>
				</Breadcrumb>
			</div>

			<Divider before={false} border={false} type="half" />

			<div className="flex items-center px-2 py-2 sm:justify-between sm:px-4">
				<Button
					asChild
					className="px-0 max-sm:hidden"
					onMouseEnter={() => iconArrowLeftRef.current?.startAnimation()}
					onMouseLeave={() => iconArrowLeftRef.current?.stopAnimation()}
					variant="link"
				>
					<Link aria-label={description} href={`/${item.metadata.category}`}>
						<ArrowLeftIcon ref={iconArrowLeftRef} />
						{description}
					</Link>
				</Button>

				<div className="flex items-center gap-2 max-sm:flex-1 max-sm:justify-end">
					<LLMCopyButtonWithViewOptions
						className="max-sm:me-auto"
						isComponent={item.metadata.category === 'components'}
						markdownUrl={`/${item.metadata.category}/${item.slug}.mdx`}
					/>

					<ShareMenu url={`/${item.metadata.category}/${item.slug}`} />

					{previous && (
						<Button
							asChild
							onMouseEnter={() => iconArrowLeftRef.current?.startAnimation()}
							onMouseLeave={() => iconArrowLeftRef.current?.stopAnimation()}
							size="icon"
							variant="outline"
						>
							<Link
								aria-label={description}
								href={`/${item.metadata.category}/${previous.slug}`}
							>
								<ArrowLeftIcon ref={iconArrowLeftRef} />
								<span className="sr-only">Précédent</span>
							</Link>
						</Button>
					)}

					{next && (
						<Button
							asChild
							onMouseEnter={() => iconArrowRightRef.current?.startAnimation()}
							onMouseLeave={() => iconArrowRightRef.current?.stopAnimation()}
							size="icon"
							variant="outline"
						>
							<Link
								aria-label={description}
								href={`/${item.metadata.category}/${next.slug}`}
							>
								<ArrowRightIcon ref={iconArrowRightRef} />
								<span className="sr-only">Suivant</span>
							</Link>
						</Button>
					)}
				</div>
			</div>

			<Divider border={false} type="half" />
		</>
	);
};
