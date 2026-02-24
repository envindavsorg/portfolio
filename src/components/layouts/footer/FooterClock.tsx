'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/primitives/Button';

export const FooterClock = () => {
	const [time, setTime] = useState<Date | null>(null);
	const [is24Hour, setIs24Hour] = useState<boolean>(true);
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

	useEffect(() => {
		const savedPreference = localStorage.getItem('clock-format');
		if (savedPreference !== null) {
			setIs24Hour(savedPreference === '24h');
		}

		const tick = () => setTime(new Date());
		tick();

		const msUntilNextSecond = 1000 - (Date.now() % 1000);
		timeoutRef.current = setTimeout(() => {
			tick();
			intervalRef.current = setInterval(tick, 1000);
		}, msUntilNextSecond);

		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		};
	}, []);

	const handleFormatChange = useCallback((use24h: boolean) => {
		setIs24Hour(use24h);
		localStorage.setItem('clock-format', use24h ? '24h' : '12h');
	}, []);

	const formattedDate = useMemo(() => {
		if (!time) {
			return '';
		}

		return time.toLocaleDateString('fr-FR', {
			weekday: 'short',
			day: 'numeric',
			month: 'short',
			year: 'numeric',
		});
	}, [time?.getDate(), time?.getMonth(), time?.getFullYear()]);

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

	return (
		<div className="screen-line-before screen-line-after mx-auto flex items-center justify-between border-edge border-x p-2 max-sm:flex-col max-sm:gap-y-3 md:max-w-3xl">
			<time
				className="text-balance font-medium text-sm tracking-tight"
				dateTime={time.toISOString()}
			>
				{hours}:{minutes}:{seconds}
				{amPm}, {formattedDate}
			</time>

			<div className="flex items-center">
				<Button
					aria-pressed={is24Hour}
					className={is24Hour ? 'text-theme underline' : ''}
					onClick={() => handleFormatChange(true)}
					variant="link"
				>
					24h
				</Button>

				<Button
					aria-pressed={!is24Hour}
					className={is24Hour ? '' : 'text-theme underline'}
					onClick={() => handleFormatChange(false)}
					variant="link"
				>
					12h
				</Button>
			</div>
		</div>
	);
};
