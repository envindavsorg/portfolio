import { useCallback, useEffect, useState } from 'react';

export type PortStatus = {
	[port: number]: boolean;
};

type UsePortStatusOptions = {
	interval?: number;
	timeout?: number;
	enabled?: boolean;
};

export const usePortStatus = (
	ports: number[],
	options: UsePortStatusOptions = {},
) => {
	const { interval = 30_000, timeout = 3000, enabled = true } = options;

	const [portStatus, setPortStatus] = useState<PortStatus>({});
	const [isChecking, setIsChecking] = useState(false);
	const [lastChecked, setLastChecked] = useState<Date | null>(null);

	const checkPortStatus = useCallback(
		async (port: number): Promise<boolean> => {
			try {
				const controller: AbortController = new AbortController();
				const timeoutId: NodeJS.Timeout = setTimeout(
					() => controller.abort(),
					timeout,
				);

				await fetch(`http://localhost:${port}`, {
					method: 'HEAD',
					signal: controller.signal,
					mode: 'no-cors',
				});

				clearTimeout(timeoutId);

				return true;
			} catch (_error) {
				return false;
			}
		},
		[timeout],
	);

	const checkAllPorts = useCallback(async () => {
		if (!enabled || ports.length === 0) {
			return;
		}

		setIsChecking(true);
		const newStatus: PortStatus = {};

		const promises = ports.map(async (port: number) => {
			newStatus[port] = await checkPortStatus(port);
		});

		await Promise.all(promises);

		setPortStatus(newStatus);
		setLastChecked(new Date());
		setIsChecking(false);
	}, [ports, enabled, checkPortStatus]);

	const forceCheck = useCallback(() => {
		checkAllPorts();
	}, [checkAllPorts]);

	useEffect(() => {
		if (enabled && ports.length > 0) {
			checkAllPorts();
		}
	}, [ports, enabled, checkAllPorts]);

	useEffect(() => {
		if (!enabled || interval <= 0) {
			return;
		}

		const intervalId = setInterval(checkAllPorts, interval);
		return () => clearInterval(intervalId);
	}, [checkAllPorts, interval, enabled]);

	return {
		portStatus,
		isChecking,
		lastChecked,
		forceCheck,
		checkPort: checkPortStatus,
	};
};
