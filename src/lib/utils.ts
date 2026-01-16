import { type ClassValue, clsx } from 'clsx';
import dayjsLib from 'dayjs';
import { twMerge } from 'tailwind-merge';
import 'dayjs/locale/fr';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import { logger } from './logger';

dayjsLib.extend(relativeTime);
dayjsLib.extend(utc);
dayjsLib.locale('fr');

export const cn = (...inputClasses: ClassValue[]): string => twMerge(clsx(inputClasses));

export const dayjs = dayjsLib;

export const copyText = async (text: string): Promise<boolean> => {
	if (!navigator?.clipboard) {
		logger.warn('Clipboard not supported in this browser !');
		return false;
	}

	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch (error) {
		logger.error('Copy failed !', error);
		return false;
	}
};

export const downloadFile = (url: string, filename: string) => {
	const link = document.createElement('a');
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
};

type PromptType = 'component' | 'general' | 'summary';

export const getPrompt = (url: string, type: PromptType = 'general'): string => {
	switch (type) {
		case 'component':
			return `
You are an expert Senior React Developer and UI/UX Specialist.
I am looking at this component documentation: ${url}

Task:
1. Analyze the component's API, props, and usage patterns.
2. Explain how to integrate it into a Next.js (TypeScript) project.
3. Provide a practical code example using Functional Components and Hooks.
4. Highlight specific pitfalls regarding Server-Side Rendering (SSR) vs Client-Side Rendering ('use client').

Please maintain a concise, technical tone.
`.trim();

		case 'summary':
			return `
Analyze the content at: ${url}
Provide a high-level executive summary of the key points, followed by 3 potential questions a developer might ask about this topic.
`.trim();

		default:
			return `
I am providing this URL as context: ${url}
Please analyze the content. I will be asking specific questions about its implementation and logic.
`.trim();
	}
};

const PROTOCOL_REGEX = /^(?:\w+:)?\/\//;

export const urlToFilename = (url: string) => url.replace(PROTOCOL_REGEX, '').replace(/[^a-zA-Z0-9._-]/g, '-');

export const addQueryParams = (urlString: string, query: Record<string, string>): string => {
	const dummyBase = 'http://base.com';
	const isRelative = !urlString.startsWith('http');

	try {
		const url = new URL(urlString, dummyBase);

		for (const [key, value] of Object.entries(query)) {
			if (value !== undefined && value !== null) {
				url.searchParams.set(key, value);
			}
		}

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
		const baseUrl = siteUrl.startsWith('http') ? siteUrl : `https://${siteUrl}`;
		return new URL(url, baseUrl).toString();
	}

	return url;
};
