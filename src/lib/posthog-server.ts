import { PostHog } from 'posthog-node';

let posthogClient: PostHog | null = null;

export const getPostHogClient = () => {
	if (!posthogClient) {
		posthogClient = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY ?? '', {
			host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
			flushAt: 1,
			flushInterval: 0,
		});
		posthogClient.debug(process.env.NODE_ENV === 'development');
	}
	return posthogClient;
};

export const shutdownPostHog = async () => {
	if (posthogClient) {
		await posthogClient.shutdown();
	}
};
