'use server';

import { list } from '@vercel/blob';
import { unstable_cache } from 'next/cache';

export type LinkedInData = {
	count: number;
	updatedAt: string;
};

const BLOB_FILENAME = 'linkedin-followers.json';
const CACHE_TAG = 'linkedin-followers';
const CACHE_REVALIDATE = 3600;

const fetchLinkedInData = async (): Promise<LinkedInData> => {
	const { blobs } = await list({
		prefix: BLOB_FILENAME,
		limit: 1,
	});

	if (blobs.length === 0) {
		return {
			count: 0,
			updatedAt: new Date().toISOString(),
		};
	}

	const response = await fetch(blobs[0].url);

	if (!response.ok) {
		throw new Error(`Failed to fetch LinkedIn data: ${response.status}`);
	}

	return response.json();
};

export const getLinkedInFollowers = unstable_cache(
	fetchLinkedInData,
	[CACHE_TAG],
	{ revalidate: CACHE_REVALIDATE, tags: [CACHE_TAG] }
);
