'use client';

import { ArrowsClockwiseIcon, CopyIcon, LockKeyIcon, LockSimpleOpenIcon, SwatchesIcon } from '@phosphor-icons/react';
import { motion } from 'motion/react';
import { Poline, positionFunctions } from 'poline';
import { useCallback, useState } from 'react';
import { ColorPicker } from '@/components/blocks/ColorPicker';
import { Button } from '@/components/primitives/Button';
import { Prose } from '@/components/primitives/Typography';
import useCopyToClipboard from '@/hooks/useCopyToClipboard';

type ColorScheme = Record<string, string>;

const DEFAULT_COLOR_SCHEME: ColorScheme = {
	background: '0 0% 100%',
	foreground: '240 10% 3.9%',
	card: '0 0% 100%',
	'card-foreground': '240 10% 3.9%',
	popover: '0 0% 100%',
	'popover-foreground': '240 10% 3.9%',
	primary: '240 5.9% 10%',
	'primary-foreground': '0 0% 98%',
	secondary: '240 4.8% 95.9%',
	'secondary-foreground': '240 5.9% 10%',
	muted: '240 4.8% 95.9%',
	'muted-foreground': '240 3.8% 46.1%',
	accent: '240 4.8% 95.9%',
	'accent-foreground': '240 5.9% 10%',
	destructive: '0 84.2% 60.2%',
	'destructive-foreground': '0 0% 98%',
	border: '240 5.9% 90%',
	input: '240 5.9% 90%',
	ring: '240 5.9% 10%',
};

const parseHSL = (hsl: string): [number, number, number] => {
	const parts = hsl.match(/[\d.]+/g)?.map(Number) ?? [0, 0, 0];
	return [parts[0], parts[1], parts[2]];
};

const formatHSL = (h: number, s: number, l: number): string => `${h.toFixed(1)} ${s.toFixed(1)}% ${l.toFixed(1)}%`;

const getContrastColor = (hsl: string): string => {
	const [, , l] = parseHSL(hsl);
	return l > 50 ? '0 0% 0%' : '0 0% 100%';
};

const adjustLightness = (key: string, l: number): number => {
	if (key.includes('foreground')) {
		return Math.min(l - 30, 20);
	}
	if (key === 'background') {
		return Math.max(l + 30, 90);
	}
	if (key === 'border' || key === 'input') {
		return Math.min(Math.max(l, 70), 90);
	}
	return l;
};

const buildCSSOutput = (scheme: ColorScheme): string => {
	const variables = Object.entries(scheme)
		.map(([key, value]) => `    --${key}: ${value};`)
		.join('\n');

	return `@layer base {\n  :root {\n${variables}\n  }\n}`;
};

export const ColorGenerator = () => {
	const [colorScheme, setColorScheme] = useState<ColorScheme>(DEFAULT_COLOR_SCHEME);
	const [lockedColor, setLockedColor] = useState<string | null>(null);
	const { handleCopy } = useCopyToClipboard();

	const generateColors = useCallback(() => {
		setColorScheme((prev) => {
			const anchorColors: [number, number, number][] = [];

			if (lockedColor && prev[lockedColor]) {
				const [h, s, l] = parseHSL(prev[lockedColor]);
				anchorColors.push([h, s / 100, l / 100]);
			}

			while (anchorColors.length < 3) {
				anchorColors.push([Math.random() * 360, 0.7, 0.5]);
			}

			const poline = new Poline({
				numPoints: 20,
				anchorColors,
				positionFunctionX: positionFunctions.sinusoidalPosition,
				positionFunctionY: positionFunctions.quadraticPosition,
				positionFunctionZ: positionFunctions.linearPosition,
			});

			const colors = poline.colorsCSS;
			const next = { ...prev };

			for (const [index, key] of Object.keys(next).entries()) {
				if (key === lockedColor) {
					continue;
				}

				const [h, s, l] = parseHSL(colors[index % colors.length]);
				next[key] = formatHSL(h, s, adjustLightness(key, l));
			}

			return next;
		});
	}, [lockedColor]);

	const resetColors = useCallback(() => {
		setColorScheme(DEFAULT_COLOR_SCHEME);
		setLockedColor(null);
	}, []);

	const updateColor = useCallback((key: string, newColor: string) => {
		const [h, s, l] = parseHSL(newColor);
		setColorScheme((prev) => ({ ...prev, [key]: formatHSL(h, s, l) }));
	}, []);

	const colorEntries = Object.entries(colorScheme);

	return (
		<>
			<div className="screen-line-before flex items-center justify-between py-3">
				<Button onClick={resetColors} variant="outline">
					<ArrowsClockwiseIcon />
					réinitialiser
				</Button>
				<Button onClick={generateColors}>
					<SwatchesIcon />
					générer
				</Button>
			</div>

			<div className="screen-line-before grid grid-cols-1 gap-3 py-3 sm:grid-cols-2">
				{colorEntries.map(([key, value]) => (
					<div className="relative" key={key}>
						<div className="flex items-center justify-between">
							<span className="text-muted-foreground text-xs">{key}</span>
							<Button
								className="mr-6"
								onClick={() => setLockedColor((prev) => (prev === key ? null : key))}
								size="icon"
								variant="ghost"
							>
								{lockedColor === key ? <LockKeyIcon /> : <LockSimpleOpenIcon />}
							</Button>
						</div>
						<div className="mt-2 flex items-center">
							<ColorPicker color={`hsl(${value})`} onChangeAction={(color) => updateColor(key, color)} />
						</div>
					</div>
				))}
			</div>

			<div className="screen-line-before py-1.5">
				<Prose>-- explorez une palette de couleurs harmonieuses générée pour vos projets web --</Prose>
				<Prose>
					-- chaque couleur est soigneusement sélectionnée pour assurer une esthétique cohérente et attrayante --
				</Prose>
			</div>

			<div className="screen-line-before py-3">
				<motion.div
					animate={{ opacity: 1, y: 0 }}
					className="grid gap-3 overflow-hidden transition-colors duration-300 ease-in-out md:grid-cols-2 md:gap-6"
					initial={{ opacity: 0, y: 20 }}
					transition={{ duration: 0.5 }}
				>
					{colorEntries.map(([key, value]) => (
						<div className="flex items-center justify-between" key={key}>
							<span className="text-muted-foreground text-xs">{key}</span>
							<Button
								onClick={() => handleCopy(`--${key}: ${value};`)}
								style={{
									backgroundColor: `hsl(${value})`,
									color: `hsl(${getContrastColor(value)})`,
									borderColor: `hsl(${colorScheme.border})`,
								}}
								variant="outline"
							>
								{value}
								<CopyIcon className="ml-2 size-4" />
							</Button>
						</div>
					))}
				</motion.div>
			</div>

			<div className="screen-line-before flex justify-end py-1.5">
				<Button onClick={() => handleCopy(buildCSSOutput(colorScheme))} variant="outline">
					<CopyIcon />
					copier les couleurs
				</Button>
			</div>
		</>
	);
};
