"use client";

import SpeedTestEngine from "@cloudflare/speedtest";
import { memo, useCallback, useRef, useState } from "react";

import { Button } from "@/components/primitives/Button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemTitle,
} from "@/components/primitives/Item";
import { cn } from "@/lib/utils";

type SpeedResult = ReturnType<
  typeof SpeedTestEngine.prototype.results.getSummary
>;

type TestStatus = "idle" | "running" | "finished";

type MetricKey = "download" | "upload" | "latency" | "jitter";

const INITIAL_RESULT: Record<MetricKey, number | undefined> = {
  download: undefined,
  jitter: undefined,
  latency: undefined,
  upload: undefined,
};

const BUTTON_LABELS: Record<TestStatus, string> = {
  finished: "refaire le test",
  idle: "démarrer le test",
  running: "arrêter le test",
};

const STATUS_COLORS: Record<Exclude<TestStatus, "idle">, string> = {
  finished: "border-green-600 dark:border-green-300",
  running: "border-blue-600 dark:border-blue-300",
};

const PULSE_COLORS: Record<Exclude<TestStatus, "idle">, string> = {
  finished: "bg-green-600 dark:bg-green-300",
  running: "bg-blue-600 dark:bg-blue-300",
};

const SPEED_METRICS = [
  { key: "download", label: "téléchargement", measure: "Mb/s" },
  { key: "upload", label: "téléversement", measure: "Mb/s" },
  { key: "latency", label: "latence", measure: "ms" },
  { key: "jitter", label: "gigue", measure: "ms" },
] as const;

const createSpeedTestEngine = () =>
  new SpeedTestEngine({
    autoStart: false,
    measurements: [
      { numPackets: 5, type: "latency" },
      {
        bypassMinDuration: true,
        bytes: 1e6,
        count: 2,
        type: "download",
      },
      {
        bypassMinDuration: true,
        bytes: 1e7,
        count: 1,
        type: "download",
      },
      {
        bypassMinDuration: true,
        bytes: 1e6,
        count: 2,
        type: "upload",
      },
      {
        bypassMinDuration: true,
        bytes: 1e7,
        count: 1,
        type: "upload",
      },
    ],
  });

const extractResults = (
  summary: SpeedResult
): Record<MetricKey, number | undefined> => ({
  download: summary.download,
  jitter: summary.jitter,
  latency: summary.latency,
  upload: summary.upload,
});

const formatValue = (
  val: number | undefined,
  measure: string
): string => {
  const num = val ?? 0;
  if (measure === "Mb/s") {
    return (num / 1_000_000).toFixed(2);
  }
  return num.toFixed(0);
};

const PulsatingCircle = memo(({ status }: { status: TestStatus }) => {
  if (status === "idle") {
    return null;
  }

  const color = PULSE_COLORS[status];

  return (
    <span className="relative flex items-center justify-center">
      <span
        className={cn(
          "absolute inline-flex size-3 animate-ping rounded-full opacity-50",
          color
        )}
      />
      <span
        className={cn(
          "relative inline-flex size-2 rounded-full",
          color
        )}
      />
    </span>
  );
});

interface SpeedTestItemProps {
  status: TestStatus;
  label: string;
  value: number | undefined;
  measure: string;
}

const SpeedTestItem = memo(
  ({ status, label, value, measure }: SpeedTestItemProps) => (
    <Item
      className={
        status !== "idle" ? STATUS_COLORS[status] : undefined
      }
      size="sm"
      variant="outline"
    >
      <ItemContent className="flex flex-row items-center gap-x-3">
        <ItemTitle className="text-foreground text-lg sm:text-xl">
          {label}
        </ItemTitle>
        <PulsatingCircle status={status} />
      </ItemContent>
      <ItemActions className="items-baseline gap-x-1 font-bold text-2xl text-foreground tabular-nums leading-none sm:text-3xl">
        {formatValue(value, measure)}
        <span className="font-normal text-xs sm:text-sm">
          {measure}
        </span>
      </ItemActions>
    </Item>
  )
);

export const SpeedTest = () => {
  const [status, setStatus] = useState<TestStatus>("idle");
  const [result, setResult] = useState(INITIAL_RESULT);
  const engineRef = useRef<SpeedTestEngine | null>(null);

  const toggleTest = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.pause?.();
      engineRef.current = null;
      setStatus("idle");
      return;
    }

    setStatus("running");
    setResult(INITIAL_RESULT);

    const engine = createSpeedTestEngine();
    engineRef.current = engine;

    engine.onResultsChange = () => {
      if (engineRef.current !== engine) {
        return;
      }
      const summary = extractResults(engine.results.getSummary());
      setResult((prev) => {
        if (
          prev.download === summary.download &&
          prev.upload === summary.upload &&
          prev.latency === summary.latency &&
          prev.jitter === summary.jitter
        ) {
          return prev;
        }
        return { ...prev, ...summary };
      });
    };

    engine.onFinish = () => {
      if (engineRef.current !== engine) {
        return;
      }
      setResult(extractResults(engine.results.getSummary()));
      setStatus("finished");
      engineRef.current = null;
    };

    engine.onError = () => {
      if (engineRef.current !== engine) {
        return;
      }
      engineRef.current = null;
      setStatus("idle");
    };

    engine.play();
  }, []);

  return (
    <>
      <div className="flex flex-col gap-y-3 py-3">
        {SPEED_METRICS.map((metric) => (
          <SpeedTestItem
            key={metric.key}
            label={metric.label}
            measure={metric.measure}
            status={status}
            value={result[metric.key]}
          />
        ))}
      </div>

      <div className="screen-line-before flex justify-end py-1.5">
        <Button onClick={toggleTest} variant="outline">
          {BUTTON_LABELS[status]}
        </Button>
      </div>
    </>
  );
};
