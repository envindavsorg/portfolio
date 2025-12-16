const PROTOCOL_REGEX = /^(?:\w+:)?\/\//;

export const urlToFilename = (url: string) =>
	url.replace(PROTOCOL_REGEX, '').replace(/[^a-zA-Z0-9._-]/g, '-');

export const addQueryParams = (
	urlString: string,
	query: Record<string, string>,
): string => {
	const dummyBase = 'http://base.com';
	const isRelative = !urlString.startsWith('http');

	try {
		const url = new URL(urlString, dummyBase);

		Object.entries(query).forEach(([key, value]) => {
			if (value !== undefined && value !== null) {
				url.searchParams.set(key, value);
			}
		});

		return isRelative ? url.pathname + url.search : url.toString();
	} catch (_error) {
		return urlString;
	}
};

export const getAbsoluteUrl = (url: string): string => {
	if (url.startsWith('http')) {
		return url;
	}

	if (typeof window !== 'undefined') {
		return new URL(url, window.location.origin).toString();
	}

	const siteUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL;
	if (siteUrl) {
		const baseUrl = siteUrl.startsWith('http')
			? siteUrl
			: `https://${siteUrl}`;
		return new URL(url, baseUrl).toString();
	}

	return url;
};
