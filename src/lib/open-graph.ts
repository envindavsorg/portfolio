interface OpenGraphImageParams {
	type: PageType;
	title: string;
	description: string;
}

const openGraphImageUrl = ({
	type = 'homepage',
	title,
	description,
}: OpenGraphImageParams): string => {
	const baseUrl = 'https://cuzeacflorin.fr';
	const endpoint = `${baseUrl}/api/og`;

	const params = new URLSearchParams({
		type: type.toString(),
		title: title.trim(),
	});

	if (description.trim()) {
		params.append('subtitle', description.trim());
	}

	return `${endpoint}?${params.toString()}`;
};

interface OpenGraphImageProps {
	title: string;
	description: string;
	ogImageParams: OpenGraphImageParams;
}

export const openGraphImage = ({
	title,
	description,
	ogImageParams,
}: OpenGraphImageProps) => ({
	title,
	description,
	openGraph: {
		title,
		description,
		images: [
			{
				url: openGraphImageUrl(ogImageParams),
				width: 1200,
				height: 630,
				alt: title,
			},
		],
	},
	twitter: {
		card: 'summary_large_image',
		title,
		description,
		images: [openGraphImageUrl(ogImageParams)],
	},
});
