'use client';

import Image from 'next/image';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { HeartIcon } from '@/components/icons/animated/HeartIcon';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { Panel } from '@/components/ui/Panel';
import useBrowser from '@/hooks/use-browser';
import { dayjs } from '@/lib/dayjs';
import { USER } from '@/lib/user';

interface FooterProps {
	branch?: string;
	hash?: string;
	updated?: string;
}

export const Footer = ({ branch, hash, updated }: FooterProps): React.JSX.Element => {
	const [is24Hour, setIs24Hour] = useState<boolean>(true);
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
				comment: updated ? dayjs(updated).format('ddd DD MMM YYYY') : null,
			},
		] as FooterMeta[];
	}, [browser?.comment, browser?.image, browser?.name, hash, updated]);

	const currentYear = new Date().getFullYear();

	// time display component with 12h/24h toggle
	const [time, setTime] = useState<Date | null>(null);

	useEffect(() => {
		setTime(new Date());

		const interval = setInterval(() => {
			setTime(new Date());
		}, 1000);

		return () => clearInterval(interval);
	}, []);

	if (!time) {
		return (
			<div className="text-balance font-medium text-sm text-transparent tracking-tight">
				00:00:00, dim. 00 janv. 0000
			</div>
		);
	}

	const hours = is24Hour
		? time.getHours().toString().padStart(2, '0')
		: (time.getHours() % 12 || 12).toString().padStart(2, '0');
	const minutes = time.getMinutes().toString().padStart(2, '0');
	const seconds = time.getSeconds().toString().padStart(2, '0');

	const date = time.toLocaleDateString('fr-FR', {
		weekday: 'short',
		day: 'numeric',
		month: 'short',
		year: 'numeric',
	});

	return (
		<footer className="max-w-screen overflow-x-hidden px-2">
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
							className="group/link [&:nth-child(2)]:screen-line-before flex select-none items-center gap-x-4 p-3"
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
							<div className="flex flex-col gap-y-1">
								<span className="text-muted-foreground text-xs">{label}</span>
								<p className="font-semibold text-xs">
									{value ?? 'Chargement en cours ...'}{' '}
									{comment && <span className="font-light text-theme">({comment})</span>}
								</p>
							</div>
						</div>
					))}
				</div>
			</Panel>

			<div className="mx-auto md:max-w-3xl">
				<Divider border className="h-4 before:h-4" />
			</div>

			<div className="screen-line-before screen-line-after mx-auto flex items-center justify-between border-edge border-x p-2 md:max-w-3xl">
				<div className="text-balance font-medium text-sm tracking-tight">
					{hours}:{minutes}:{seconds}, {date}
				</div>
				<div className="flex items-center gap-x-3 *:h-6 *:w-4 *:underline-offset-2 *:transition-colors *:hover:bg-transparent *:hover:text-theme *:hover:underline">
					<Button onClick={() => setIs24Hour(true)} variant="ghost">
						24h
					</Button>
					<Button onClick={() => setIs24Hour(false)} variant="ghost">
						12h
					</Button>
				</div>
			</div>

			<div className="mx-auto md:max-w-3xl">
				<Divider border className="h-4 before:h-4" />
			</div>

			<div className="screen-line-before screen-line-after mx-auto flex items-center justify-center border-edge border-x py-2 md:max-w-3xl">
				<p className="text-balance text-muted-foreground text-xs">Développé avec beaucoup d'</p>
				<HeartIcon
					className="relative me-1 text-destructive after:absolute after:-inset-2"
					size={12}
				/>
				<p className="text-balance text-muted-foreground text-xs">à Paris.</p>
			</div>

			<div className="screen-line-after mx-auto flex items-center justify-center border-edge border-x py-2 md:max-w-3xl">
				<p className="text-balance text-muted-foreground text-xs">
					© {currentYear} -{' '}
					<span className="font-medium text-theme">
						{USER.lastName} {USER.firstName}
					</span>
				</p>
			</div>

			<div className="pb-[env(safe-area-inset-bottom,0px)]">
				<div className="flex h-2" />
			</div>
		</footer>
	);
};
