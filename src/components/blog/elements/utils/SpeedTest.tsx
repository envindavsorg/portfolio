'use client';

import SpeedTestEngine from '@cloudflare/speedtest';
import {
	DownloadIcon,
	GaugeIcon,
	type Icon,
	SpeedometerIcon,
	UploadIcon,
} from '@phosphor-icons/react';
import { memo, useCallback, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import {
	Item,
	ItemActions,
	ItemContent,
	ItemMedia,
	ItemTitle,
} from '@/components/ui/Item';
import { cn } from '@/lib/utils';

type SpeedResult = ReturnType<
	typeof SpeedTestEngine.prototype.results.getSummary
>;

type TestState = {
	status: 'idle' | 'running' | 'finished';
	result: Partial<SpeedResult>;
};

const INITIAL_RESULT: Partial<SpeedResult> = {
	download: undefined,
	upload: undefined,
	latency: undefined,
	jitter: undefined,
};

const createSpeedTestEngine = () => {
	return new SpeedTestEngine({
		autoStart: false,
		measurements: [
			{ type: 'latency', numPackets: 5 },
			{ type: 'download', bytes: 1e6, count: 2, bypassMinDuration: true },
			{ type: 'download', bytes: 1e7, count: 1, bypassMinDuration: true },
			{ type: 'upload', bytes: 1e6, count: 2, bypassMinDuration: true },
			{ type: 'upload', bytes: 1e7, count: 1, bypassMinDuration: true },
		],
	});
};

type PulsatingCircleProps = {
	isRunning: boolean;
	isFinished: boolean;
};

const PulsatingCircle = memo((props: PulsatingCircleProps) => (
	<span className="relative flex items-center justify-center">
		<span
			className={cn(
				'absolute inline-flex size-3 animate-ping rounded-full opacity-50',
				props.isRunning && 'bg-blue-600 dark:bg-blue-300',
				props.isFinished && 'bg-green-600 dark:bg-green-300',
			)}
		/>
		<span
			className={cn(
				'relative inline-flex size-2 rounded-full',
				props.isRunning && 'bg-blue-600 dark:bg-blue-300',
				props.isFinished && 'bg-green-600 dark:bg-green-300',
			)}
		/>
	</span>
));

const getButtonLabel = (status: TestState['status']) => {
	switch (status) {
		case 'idle':
			return 'Démarrer le test';
		case 'running':
			return 'Arrêter le test';
		case 'finished':
			return 'Refaire le test';
		default:
			return 'Démarrer le test';
	}
};

const cleanSummary = (summary: SpeedResult): Partial<SpeedResult> => {
	return Object.fromEntries(
		Object.entries(summary).filter(([, value]) => value !== undefined),
	) as Partial<SpeedResult>;
};

const formatValue = (val: number | undefined, unit: string): string => {
	const num = val ?? 0;
	if (unit === 'Mb/s') {
		return (num / 1_000_000).toFixed(2);
	}
	if (unit === 'ms') {
		return num.toFixed(0);
	}
	return num.toFixed(2);
};

type SpeedTestProps = {
	status: TestState['status'];
	label: string;
	value: number | undefined;
	measure: string;
	icon: Icon;
};

const SpeedTestItem = memo(
	({ status, label, value, measure, icon }: SpeedTestProps) => {
		const Icon = icon;
		const displayValue = useMemo(
			() => formatValue(value, measure),
			[value, measure],
		);

		const borderClassName = useMemo(
			() =>
				cn(
					status === 'running' &&
						'border-blue-600 dark:border-blue-300',
					status === 'finished' &&
						'border-green-600 dark:border-green-300',
				),
			[status],
		);

		return (
			<Item variant="outline" size="sm" className={borderClassName}>
				<ItemMedia>
					<Icon className="size-5 sm:size-6" />
				</ItemMedia>
				<ItemContent className="flex flex-row items-center gap-x-3">
					<ItemTitle className="text-base sm:text-lg">
						{label}
					</ItemTitle>
					<PulsatingCircle
						isFinished={status === 'finished'}
						isRunning={status === 'running'}
					/>
				</ItemContent>
				<ItemActions className="items-baseline gap-x-1 font-bold font-mono text-xl tabular-nums leading-none sm:text-2xl">
					{displayValue}
					<span className="font-normal text-muted-foreground text-xs sm:text-sm">
						{measure}
					</span>
				</ItemActions>
			</Item>
		);
	},
);

export const SpeedTest = () => {
	const [testState, setTestState] = useState<TestState>({
		status: 'idle',
		result: INITIAL_RESULT,
	});

	const engineRef = useRef<SpeedTestEngine | null>(null);
	const statusRef = useRef<TestState['status']>('idle');

	statusRef.current = testState.status;

	const toggleTest = useCallback(() => {
		if (statusRef.current === 'running') {
			engineRef.current?.pause?.();
			engineRef.current = null;
			setTestState((prev) => ({
				...prev,
				status: 'idle',
			}));
			return;
		}

		setTestState((prev) => ({
			...prev,
			status: 'running',
		}));

		const speedTest = createSpeedTestEngine();
		engineRef.current = speedTest;

		speedTest.onResultsChange = () => {
			if (engineRef.current !== speedTest) {
				return;
			}

			const newResults = cleanSummary(speedTest.results.getSummary());
			setTestState((prev) => ({
				status: prev.status,
				result: {
					...prev.result,
					...newResults,
				},
			}));
		};

		speedTest.onFinish = () => {
			if (engineRef.current !== speedTest) {
				return;
			}

			const finalResults = speedTest.results.getSummary();
			setTestState({
				status: 'finished',
				result: { ...INITIAL_RESULT, ...cleanSummary(finalResults) },
			});
			engineRef.current = null;
		};

		speedTest.onError = () => {
			if (engineRef.current !== speedTest) {
				return;
			}
			engineRef.current = null;
			setTestState((prev) => ({
				...prev,
				status: 'idle',
			}));
		};

		speedTest.play();
	}, []);

	return (
		<>
			<div className="flex flex-col gap-y-3 py-3">
				<SpeedTestItem
					status={testState.status}
					label="Téléchargement"
					value={testState.result.download}
					measure="Mb/s"
					icon={DownloadIcon}
				/>
				<SpeedTestItem
					status={testState.status}
					label="Téléversement"
					value={testState.result.upload}
					measure="Mb/s"
					icon={UploadIcon}
				/>
				<SpeedTestItem
					status={testState.status}
					label="Latence"
					value={testState.result.latency}
					measure="ms"
					icon={SpeedometerIcon}
				/>
				<SpeedTestItem
					status={testState.status}
					label="Gigue"
					value={testState.result.jitter}
					measure="ms"
					icon={GaugeIcon}
				/>
			</div>

			<div className="screen-line-before flex justify-end py-1.5">
				<Button onClick={toggleTest} variant="outline">
					{getButtonLabel(testState.status)}
				</Button>
			</div>
		</>
	);
};
