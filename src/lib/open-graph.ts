import type { Metadata } from 'next';

interface OGImageParams {
	type?: PageType;
	title: string;
	description?: string;
}

const buildOGImageUrl = ({
	type = 'homepage',
	title,
	description,
}: OGImageParams): string => {
	const params = new URLSearchParams({ type, title: title.trim() });
	if (description?.trim()) {
		params.set('description', description.trim());
	}
	return `https://cuzeacflorin.fr/api/og?${params}`;
};

interface ContentMetadataParams {
	title: string;
	description: string;
	ogImageParams: OGImageParams;
}

export const buildContentMetadata = ({
	title,
	description,
	ogImageParams,
}: ContentMetadataParams): Metadata => {
	const imageUrl = buildOGImageUrl(ogImageParams);
	return {
		title,
		description,
		openGraph: {
			title,
			description,
			images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
		},
		twitter: {
			card: 'summary_large_image',
			title,
			description,
			images: [imageUrl],
		},
	};
};
