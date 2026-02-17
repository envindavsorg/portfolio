'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/buttons/Button';

export const FooterClock = () => {
	const [is24Hour, setIs24Hour] = useState<boolean>(true);
	const [time, setTime] = useState<Date | null>(null);

	useEffect(() => {
		const savedPreference = localStorage.getItem('clock-format');
		if (savedPreference !== null) {
			setIs24Hour(savedPreference === '24h');
		}

		setTime(new Date());
		const interval = setInterval(() => {
			setTime(new Date());
		}, 1000);

		return () => clearInterval(interval);
	}, []);

	const handleFormatChange = (use24h: boolean) => {
		setIs24Hour(use24h);
		localStorage.setItem('clock-format', use24h ? '24h' : '12h');
	};

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
	const amPm = is24Hour ? '' : time.getHours() >= 12 ? ' PM' : ' AM';

	const date = time.toLocaleDateString('fr-FR', {
		weekday: 'short',
		day: 'numeric',
		month: 'short',
		year: 'numeric',
	});

	return (
		<div className="screen-line-before screen-line-after mx-auto flex items-center justify-between border-edge border-x p-2 max-sm:flex-col max-sm:gap-y-3 md:max-w-3xl">
			<div className="text-balance font-medium text-sm tracking-tight">
				{hours}:{minutes}:{seconds}
				{amPm}, {date}
			</div>

			<div className="flex items-center gap-x-3 *:h-6 *:w-4 *:underline-offset-2 *:transition-colors *:hover:bg-transparent *:hover:text-theme *:hover:underline">
				<Button
					className={is24Hour ? 'text-theme underline' : ''}
					onClick={() => handleFormatChange(true)}
					variant="ghost"
				>
					24h
				</Button>
				<Button
					className={is24Hour ? '' : 'text-theme underline'}
					onClick={() => handleFormatChange(false)}
					variant="ghost"
				>
					12h
				</Button>
			</div>
		</div>
	);
};
