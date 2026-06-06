import { lazy, Suspense } from "react";

const AnalyticsReact = lazy(async () => {
  const mod = await import("@vercel/analytics/react");
  return { default: mod.Analytics };
});

const SpeedInsights = lazy(async () => {
  const mod = await import("@vercel/speed-insights/react");
  return { default: mod.SpeedInsights };
});

export const Analytics = () => (
  <Suspense fallback={null}>
    <AnalyticsReact debug={true} mode="auto" />
    <SpeedInsights debug={process.env.NODE_ENV === "development"} />
  </Suspense>
);
