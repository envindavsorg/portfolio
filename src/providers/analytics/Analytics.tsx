import type React from 'react';
import { lazy, Suspense } from 'react';

const AnalyticsReact = lazy(() =>
	import('@vercel/analytics/react').then((module) => ({
		default: module.Analytics,
	}))
);

const SpeedInsights = lazy(() =>
	import('@vercel/speed-insights/react').then((module) => ({
		default: module.SpeedInsights,
	}))
);

export const Analytics = (): React.JSX.Element => (
	<Suspense fallback={null}>
		<AnalyticsReact debug={true} mode="auto" />
		<SpeedInsights debug={process.env.NODE_ENV === 'development'} />
	</Suspense>
);
