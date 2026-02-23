'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { LLMCopyButtonWithViewOptions } from '@/actions/blog/post.action';
import { Button } from '@/components/buttons/Button';
import { ArrowLeftIcon } from '@/components/icons/ArrowLeftIcon';
import { ArrowRightIcon } from '@/components/icons/ArrowRightIcon';
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/navigation/Breadcrumb';
import { Divider } from '@/components/primitives/Divider';
import { KeyboardShortcuts } from './KeyboardShortcuts';
import { ShareMenu } from './ShareMenu';

const getPostUrl = (post: Post) => {
	const isComponent = post.metadata.category === 'components';
	return isComponent ? `/components/${post.slug}` : `/blog/${post.slug}`;
};

interface TopNavProps {
	items: Post[];
	item: Post;
	path: string;
	slug: string;
	description: string;
}

export const TopNav = ({
	items,
	item,
	path,
	slug,
	description,
}: TopNavProps) => {
	const currentIndex = items.findIndex((i) => i.slug === slug);
	const previous = currentIndex > 0 ? items[currentIndex - 1] : null;
	const next = currentIndex < items.length - 1 ? items[currentIndex + 1] : null;

	const iconArrowLeftRef = useRef<AnimatedIconHandle>(null);
	const iconArrowRightRef = useRef<AnimatedIconHandle>(null);

	return (
		<>
			<KeyboardShortcuts basePath={path} next={next} previous={previous} />

			<div className="screen-line-after px-2 py-0.5 sm:px-4">
				<Breadcrumb>
					<BreadcrumbList>
						<BreadcrumbItem>
							<BreadcrumbLink aria-label={description} href={path}>
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

			<div className="flex items-center px-2 py-2 sm:justify-between sm:px-4">
				<Button
					asChild
					className="px-0 max-sm:hidden"
					onMouseEnter={() => iconArrowLeftRef.current?.startAnimation()}
					onMouseLeave={() => iconArrowLeftRef.current?.stopAnimation()}
					variant="link"
				>
					<Link aria-label={description} href={path}>
						<ArrowLeftIcon ref={iconArrowLeftRef} />
						{description}
					</Link>
				</Button>

				<div className="flex items-center gap-2 max-sm:flex-1 max-sm:justify-end">
					<LLMCopyButtonWithViewOptions
						className="max-sm:me-auto"
						isComponent={item.metadata.category === 'components'}
						markdownUrl={`${getPostUrl(item)}.mdx`}
					/>

					<ShareMenu url={getPostUrl(item)} />

					{previous && (
						<Button
							asChild
							onMouseEnter={() => iconArrowLeftRef.current?.startAnimation()}
							onMouseLeave={() => iconArrowLeftRef.current?.stopAnimation()}
							size="icon"
							variant="outline"
						>
							<Link aria-label={description} href={`${path}/${previous.slug}`}>
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
							<Link aria-label={description} href={`${path}/${next.slug}`}>
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
