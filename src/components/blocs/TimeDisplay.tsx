import type React from 'react';
import { useEffect, useState } from 'react';

interface TimeDisplayProps {
	is24Hour: boolean;
}

export const TimeDisplay = ({
	is24Hour,
}: TimeDisplayProps): React.JSX.Element => {
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
		<div className="text-balance font-medium text-sm tracking-tight">
			{hours}:{minutes}:{seconds}, {date}
		</div>
	);
};
