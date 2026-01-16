'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/buttons/Button';

const FooterClock = () => {
	const [is24Hour, setIs24Hour] = useState<boolean>(true);
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
	);
};

FooterClock.displayName = 'FooterClock';

export { FooterClock };
