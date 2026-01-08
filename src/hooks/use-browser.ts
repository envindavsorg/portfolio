import { useEffect, useMemo, useState } from 'react';

const IMAGES: Record<Browser, string> = {
	'Arc Browser': '/assets/images/browsers/arc.webp',
	'Mozilla Firefox': '/assets/images/browsers/firefox.webp',
	'Google Chrome': '/assets/images/browsers/chrome.webp',
	'Apple Safari': '/assets/images/browsers/safari.webp',
	'Microsoft Edge': '/assets/images/browsers/edge.webp',
};

const COMMENTS: Record<Browser, string> = {
	'Arc Browser': 'très bon choix',
	'Mozilla Firefox': 'très bon choix',
	'Google Chrome': 'hmmm, pas mal',
	'Apple Safari': 'correct mais limité',
	'Microsoft Edge': 'à éviter si possible',
};

const checkArcVars = (): boolean => {
	if (typeof document === 'undefined') {
		return false;
	}

	const styles = getComputedStyle(document.documentElement);
	const arcVars = [
		'--arc-palette-background',
		'--arc-palette-title',
		'--arc-palette-foregroundPrimary',
		'--arc-palette-hover',
	];

	return arcVars.some((varName) => !!styles.getPropertyValue(varName));
};

export const getBrowser = (): Browser | null => {
	if (typeof window === 'undefined') {
		return null;
	}

	if (checkArcVars()) {
		return 'Arc Browser';
	}

	const { userAgent: ua } = navigator;

	if (ua.includes('Firefox')) {
		return 'Mozilla Firefox';
	}

	if (ua.includes('Edg')) {
		return 'Microsoft Edge';
	}

	if (ua.includes('Safari') && !ua.includes('Chrome')) {
		return 'Apple Safari';
	}

	if (ua.includes('Chrome')) {
		return 'Google Chrome';
	}

	return null;
};

const useBrowser = (): BrowserInfo | null => {
	const [browser, setBrowser] = useState<Browser | null>(null);

	useEffect(() => {
		const detectedBrowser = getBrowser();
		setBrowser(detectedBrowser);

		if (
			detectedBrowser === 'Arc Browser' ||
			detectedBrowser === 'Mozilla Firefox' ||
			detectedBrowser === 'Apple Safari'
		) {
			return;
		}

		let isArcDetected = false;
		const timers: NodeJS.Timeout[] = [];

		const checkForArc = (): boolean => {
			if (!isArcDetected && checkArcVars()) {
				isArcDetected = true;
				setBrowser('Arc Browser');
				return true;
			}
			return false;
		};

		checkForArc();

		const delays = [50, 100, 200, 400];
		for (const delay of delays) {
			timers.push(
				setTimeout(() => {
					if (checkForArc()) {
						timers.forEach(clearTimeout);
					}
				}, delay)
			);
		}

		const observer = new MutationObserver(() => {
			if (checkForArc()) {
				observer.disconnect();
				timers.forEach(clearTimeout);
			}
		});

		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['style', 'class'],
		});

		return () => {
			observer.disconnect();
			timers.forEach(clearTimeout);
		};
	}, []);

	return useMemo(() => {
		if (!browser) {
			return null;
		}

		return {
			name: browser,
			image: IMAGES[browser],
			comment: COMMENTS[browser],
		};
	}, [browser]);
};

export default useBrowser;
