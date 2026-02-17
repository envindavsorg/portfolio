'use client';

import Image from 'next/image';
import { useMemo } from 'react';
import { Panel } from '@/components/Panel';
import useBrowser from '@/hooks/use-browser';
import { dayjs } from '@/lib/utils';

interface FooterMetadataProps {
	branch?: string;
	hash?: string;
	updated?: string;
}

export const FooterMetadata = ({
	branch,
	hash,
	updated,
}: FooterMetadataProps) => {
	const browser = useBrowser();

	const items = useMemo(() => {
		return [
			{
				image: browser?.image,
				label: 'Navigateur utilisé actuellement :',
				value: browser?.name,
				comment: browser?.comment,
			},
			{
				image: '/assets/images/github.webp',
				label: 'Dernier commit sur ce projet :',
				value: `${hash} - ${branch}`,
				comment: updated ? dayjs(updated).format('ddd DD MMM') : null,
			},
		] as FooterMeta[];
	}, [browser?.comment, browser?.image, browser?.name, hash, updated]);

	return (
		<Panel className="relative mx-auto md:max-w-3xl">
			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-0 -z-1 grid gap-4 max-sm:hidden sm:grid-cols-2"
			>
				<div className="border-edge border-r" />
				<div className="border-edge border-l" />
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-4">
				{items.map(({ comment, image, label, value }: FooterMeta) => (
					<div
						className="group/link nth-2:screen-line-before flex select-none items-center gap-x-4 p-3"
						key={label}
					>
						{image && (
							<Image
								alt={label}
								className="size-12 shrink-0 object-contain"
								height={96}
								src={image}
								width={96}
							/>
						)}

						<div className="flex flex-col items-baseline gap-y-1">
							<span className="text-muted-foreground text-xs">{label}</span>
							<p className="font-bold text-sm sm:text-base">
								{value ?? 'chargement en cours ...'}{' '}
								{comment && (
									<span className="font-light text-theme text-xs">
										({comment})
									</span>
								)}
							</p>
						</div>
					</div>
				))}
			</div>
		</Panel>
	);
};
