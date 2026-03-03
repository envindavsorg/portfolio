'use client';

import SpeedTestEngine from '@cloudflare/speedtest';
import {
	DownloadIcon,
	GaugeIcon,
	type Icon,
	SpeedometerIcon,
	UploadIcon,
} from '@phosphor-icons/react';
import { memo, useCallback, useRef, useState } from 'react';
import { Button } from '@/components/primitives/Button';
import {
	Item,
	ItemActions,
	ItemContent,
	ItemMedia,
	ItemTitle,
} from '@/components/primitives/Item';
import { cn } from '@/lib/utils';

type SpeedResult = ReturnType<
	typeof SpeedTestEngine.prototype.results.getSummary
>;

type TestStatus = 'idle' | 'running' | 'finished';

interface TestState {
	status: TestStatus;
	result: Partial<SpeedResult>;
}

const INITIAL_RESULT: Partial<SpeedResult> = {
	download: undefined,
	upload: undefined,
	latency: undefined,
	jitter: undefined,
};

const BUTTON_LABELS: Record<TestStatus, string> = {
	idle: 'démarrer le test',
	running: 'arrêter le test',
	finished: 'refaire le test',
};

const STATUS_COLORS: Record<Exclude<TestStatus, 'idle'>, string> = {
	running: 'border-blue-600 dark:border-blue-300',
	finished: 'border-green-600 dark:border-green-300',
};

const PULSE_COLORS: Record<Exclude<TestStatus, 'idle'>, string> = {
	running: 'bg-blue-600 dark:bg-blue-300',
	finished: 'bg-green-600 dark:bg-green-300',
};

const SPEED_METRICS = [
	{
		key: 'download',
		label: 'téléchargement',
		measure: 'Mb/s',
		icon: DownloadIcon,
	},
	{ key: 'upload', label: 'téléversement', measure: 'Mb/s', icon: UploadIcon },
	{ key: 'latency', label: 'latence', measure: 'ms', icon: SpeedometerIcon },
	{ key: 'jitter', label: 'gigue', measure: 'ms', icon: GaugeIcon },
] as const;

const createSpeedTestEngine = () =>
	new SpeedTestEngine({
		autoStart: false,
		measurements: [
			{ type: 'latency', numPackets: 5 },
			{ type: 'download', bytes: 1e6, count: 2, bypassMinDuration: true },
			{ type: 'download', bytes: 1e7, count: 1, bypassMinDuration: true },
			{ type: 'upload', bytes: 1e6, count: 2, bypassMinDuration: true },
			{ type: 'upload', bytes: 1e7, count: 1, bypassMinDuration: true },
		],
	});

const cleanSummary = (summary: SpeedResult): Partial<SpeedResult> =>
	Object.fromEntries(
		Object.entries(summary).filter(([, value]) => value !== undefined)
	) as Partial<SpeedResult>;

const formatValue = (val: number | undefined, measure: string): string => {
	const num = val ?? 0;
	if (measure === 'Mb/s') {
		return (num / 1_000_000).toFixed(2);
	}
	return num.toFixed(0);
};

const PulsatingCircle = memo(({ status }: { status: TestStatus }) => {
	if (status === 'idle') {
		return null;
	}

	const color = PULSE_COLORS[status];

	return (
		<span className="relative flex items-center justify-center">
			<span
				className={cn(
					'absolute inline-flex size-3 animate-ping rounded-full opacity-50',
					color
				)}
			/>
			<span className={cn('relative inline-flex size-2 rounded-full', color)} />
		</span>
	);
});

interface SpeedTestItemProps {
	status: TestStatus;
	label: string;
	value: number | undefined;
	measure: string;
	icon: Icon;
}

const SpeedTestItem = memo(
	({ status, label, value, measure, icon: ItemIcon }: SpeedTestItemProps) => (
		<Item
			className={status !== 'idle' ? STATUS_COLORS[status] : undefined}
			size="sm"
			variant="outline"
		>
			<ItemMedia>
				<ItemIcon className="size-5 sm:size-6" />
			</ItemMedia>
			<ItemContent className="flex flex-row items-center gap-x-3">
				<ItemTitle className="text-base sm:text-lg">{label}</ItemTitle>
				<PulsatingCircle status={status} />
			</ItemContent>
			<ItemActions className="items-baseline gap-x-1 font-bold text-xl tabular-nums leading-none sm:text-2xl">
				{formatValue(value, measure)}
				<span className="font-normal text-muted-foreground text-xs sm:text-sm">
					{measure}
				</span>
			</ItemActions>
		</Item>
	)
);

export const SpeedTest = () => {
	const [testState, setTestState] = useState<TestState>({
		status: 'idle',
		result: INITIAL_RESULT,
	});

	const engineRef = useRef<SpeedTestEngine | null>(null);

	const toggleTest = useCallback(() => {
		if (engineRef.current) {
			engineRef.current.pause?.();
			engineRef.current = null;
			setTestState((prev) => ({ ...prev, status: 'idle' }));
			return;
		}

		setTestState({ status: 'running', result: INITIAL_RESULT });

		const engine = createSpeedTestEngine();
		engineRef.current = engine;

		engine.onResultsChange = () => {
			if (engineRef.current !== engine) {
				return;
			}
			setTestState((prev) => ({
				status: prev.status,
				result: {
					...prev.result,
					...cleanSummary(engine.results.getSummary()),
				},
			}));
		};

		engine.onFinish = () => {
			if (engineRef.current !== engine) {
				return;
			}
			setTestState({
				status: 'finished',
				result: {
					...INITIAL_RESULT,
					...cleanSummary(engine.results.getSummary()),
				},
			});
			engineRef.current = null;
		};

		engine.onError = () => {
			if (engineRef.current !== engine) {
				return;
			}
			engineRef.current = null;
			setTestState((prev) => ({ ...prev, status: 'idle' }));
		};

		engine.play();
	}, []);

	return (
		<>
			<div className="flex flex-col gap-y-3 py-3">
				{SPEED_METRICS.map((metric) => (
					<SpeedTestItem
						icon={metric.icon}
						key={metric.key}
						label={metric.label}
						measure={metric.measure}
						status={testState.status}
						value={testState.result[metric.key]}
					/>
				))}
			</div>

			<div className="screen-line-before flex justify-end py-1.5">
				<Button onClick={toggleTest} variant="outline">
					{BUTTON_LABELS[testState.status]}
				</Button>
			</div>
		</>
	);
};
