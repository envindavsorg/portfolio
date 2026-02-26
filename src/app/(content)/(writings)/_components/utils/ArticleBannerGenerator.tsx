// components/ArticleBanner.tsx
'use client';

import NextImage from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { TextAnimate } from '@/components/blocks/TextAnimate';
import { Button } from '@/components/primitives/Button';
import { Input } from '@/components/primitives/Input';
import { Label } from '@/components/primitives/Label';
import { Slider } from '@/components/primitives/Slider';
import { Spinner } from '@/components/primitives/Spinner';
import { cn } from '@/lib/utils';

interface PresetBackground {
	name: string;
	url: string;
}

interface FontOption {
	name: string;
	value: string;
	canvas: string;
}

interface AlignmentOption {
	value: CanvasTextAlign;
	label: string;
}

interface BannerConfig {
	title: string;
	subtitle: string;
	bgIndex: number;
	fontIndex: number;
	align: CanvasTextAlign;
	fontSize: number;
	overlayOpacity: number;
	textColor: string;
}

const PRESET_BACKGROUNDS: PresetBackground[] = [
	{
		name: 'Sapins mystiques',
		url: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=1400&q=80',
	},
	{
		name: 'Forêt brumeuse',
		url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1400&q=80',
	},
	{
		name: 'Montagne ensoleillée',
		url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1400&q=80',
	},
];

const FONTS: FontOption[] = [
	{
		name: 'Serif',
		value: 'Georgia, serif',
		canvas: 'Georgia',
	},
	{
		name: 'Sans-serif',
		value: "'Segoe UI', sans-serif",
		canvas: 'Segoe UI',
	},
	{
		name: 'Mono',
		value: "'Courier New', monospace",
		canvas: 'Courier New',
	},
	{
		name: 'Geist Sans',
		value: 'var(--font-geist-sans), sans-serif',
		canvas: '"Geist", sans-serif',
	},
	{
		name: 'Geist Mono',
		value: 'var(--font-geist-mono), monospace',
		canvas: '"Geist Mono", monospace',
	},
	{
		name: 'Pixel Square',
		value: 'var(--font-geist-pixel-square), monospace',
		canvas: '"Geist Pixel Square", monospace',
	},
	{
		name: 'Pixel Grid',
		value: 'var(--font-geist-pixel-grid), monospace',
		canvas: '"Geist Pixel Grid", monospace',
	},
	{
		name: 'Pixel Circle',
		value: 'var(--font-geist-pixel-circle), monospace',
		canvas: '"Geist Pixel Circle", monospace',
	},
	{
		name: 'Pixel Triangle',
		value: 'var(--font-geist-pixel-triangle), monospace',
		canvas: '"Geist Pixel Triangle", monospace',
	},
	{
		name: 'Pixel Line',
		value: 'var(--font-geist-pixel-line), monospace',
		canvas: '"Geist Pixel Line", monospace',
	},
];

const ALIGNMENTS: AlignmentOption[] = [
	{ value: 'left', label: 'Gauche' },
	{ value: 'center', label: 'Centre' },
	{ value: 'right', label: 'Droite' },
];

const CANVAS_W = 1400;
const CANVAS_H = 640;
const ASPECT_RATIO = `${CANVAS_W} / ${CANVAS_H}`;

const DEFAULT_CONFIG: BannerConfig = {
	title: "titre de l'article",
	subtitle: 'description courte ...',
	bgIndex: 0,
	fontIndex: 0,
	align: 'center',
	fontSize: 80,
	overlayOpacity: 40,
	textColor: '#ffffff',
};

const getResolvedFontFamily = (
	fontValue: string,
	fallbackCanvasName: string
) => {
	if (typeof window === 'undefined') {
		return fallbackCanvasName;
	}

	const match = fontValue.match(/var\((--[^)]+)\)/);
	if (match) {
		const cssVarName = match[1];
		const resolvedRealName = getComputedStyle(document.documentElement)
			.getPropertyValue(cssVarName)
			.trim();

		if (resolvedRealName) {
			return resolvedRealName;
		}
	}
	return fallbackCanvasName;
};

const wrapText = (
	ctx: CanvasRenderingContext2D,
	text: string,
	maxW: number
): string[] => {
	const words = text.split(' ');
	const lines: string[] = [];
	let line = '';

	for (const word of words) {
		const test = line ? `${line} ${word}` : word;
		if (ctx.measureText(test).width > maxW && line) {
			lines.push(line);
			line = word;
		} else {
			line = test;
		}
	}
	if (line) {
		lines.push(line);
	}
	return lines;
};

const drawBanner = (
	ctx: CanvasRenderingContext2D,
	w: number,
	h: number,
	config: BannerConfig,
	img: HTMLImageElement | undefined
): boolean => {
	if (!img) {
		return false;
	}

	const iw = img.naturalWidth;
	const ih = img.naturalHeight;
	const scale = Math.max(w / iw, h / ih);
	const sw = iw * scale;
	const sh = ih * scale;
	ctx.drawImage(img, (w - sw) / 2, (h - sh) / 2, sw, sh);

	ctx.fillStyle = `rgba(0,0,0,${config.overlayOpacity / 100})`;
	ctx.fillRect(0, 0, w, h);

	const font = FONTS[config.fontIndex];
	const realFontFamily = getResolvedFontFamily(font.value, font.canvas);

	const pad = w * 0.08;
	const maxTextW = w - pad * 2;
	const textX =
		config.align === 'left' ? pad : config.align === 'right' ? w - pad : w / 2;
	ctx.textAlign = config.align;

	const titleSize = Math.round(config.fontSize * (w / CANVAS_W));
	ctx.font = `700 ${titleSize}px ${realFontFamily}`;
	ctx.fillStyle = config.textColor;

	const titleLines = wrapText(ctx, config.title, maxTextW);
	const subtitleSize = Math.round(titleSize * 0.35);
	const lineHeight = titleSize * 1.15;
	const subLineHeight = subtitleSize * 1.5;
	const gap = titleSize * 0.2;
	const totalTextH = titleLines.length * lineHeight + gap + subLineHeight;
	let y = (h - totalTextH) / 2 + titleSize;

	for (const line of titleLines) {
		ctx.font = `700 ${titleSize}px ${realFontFamily}`;
		ctx.fillStyle = config.textColor;
		ctx.fillText(line, textX, y);
		y += lineHeight;
	}

	y += gap;
	ctx.font = `400 ${subtitleSize}px ${realFontFamily}`;
	ctx.fillStyle = `${config.textColor}bb`;
	const subLines = wrapText(ctx, config.subtitle, maxTextW);
	for (const line of subLines) {
		ctx.fillText(line, textX, y);
		y += subLineHeight;
	}

	return true;
};

export const ArticleBanner = () => {
	const [config, setConfig] = useState<BannerConfig>(DEFAULT_CONFIG);
	const [loadedImages, setLoadedImages] = useState<
		Record<number, HTMLImageElement>
	>({});
	const [downloading, setDownloading] = useState<false | 'png' | 'webp'>(false);
	const [fontsReady, setFontsReady] = useState(false);

	const previewRef = useRef<HTMLCanvasElement>(null);
	const rafRef = useRef<number>(0);
	const customImageUrlRef = useRef<string | null>(null);

	const imagesReady = Boolean(loadedImages[config.bgIndex]);

	const updateConfig = useCallback(
		<K extends keyof BannerConfig>(key: K, value: BannerConfig[K]) => {
			setConfig((prev) => ({ ...prev, [key]: value }));
		},
		[]
	);

	const handleImageUpload = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const file = event.target.files?.[0];
			if (!file) {
				return;
			}

			if (customImageUrlRef.current) {
				URL.revokeObjectURL(customImageUrlRef.current);
			}

			const objectUrl = URL.createObjectURL(file);
			customImageUrlRef.current = objectUrl;

			const img = new window.Image();
			img.onload = () => {
				setLoadedImages((prev) => ({ ...prev, [-1]: img }));
				updateConfig('bgIndex', -1);
			};
			img.src = objectUrl;

			event.target.value = '';
		},
		[updateConfig]
	);

	useEffect(() => {
		const controllers: Array<() => void> = [];

		PRESET_BACKGROUNDS.forEach((bg, i) => {
			const img = new window.Image();
			img.crossOrigin = 'anonymous';
			let cancelled = false;
			img.onload = () => {
				if (!cancelled) {
					setLoadedImages((prev) => ({ ...prev, [i]: img }));
				}
			};
			img.src = bg.url;
			controllers.push(() => {
				cancelled = true;
			});
		});

		return () => {
			for (const cancel of controllers) {
				cancel();
			}

			if (customImageUrlRef.current) {
				URL.revokeObjectURL(customImageUrlRef.current);
			}
		};
	}, []);

	useEffect(() => {
		document.fonts.ready.then(() => {
			setFontsReady(true);
		});
	}, [config.fontIndex]);

	useEffect(() => {
		cancelAnimationFrame(rafRef.current);

		rafRef.current = requestAnimationFrame(() => {
			const canvas = previewRef.current;
			if (!canvas) {
				return;
			}
			const ctx = canvas.getContext('2d');
			if (!ctx) {
				return;
			}

			canvas.width = CANVAS_W;
			canvas.height = CANVAS_H;
			ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
			drawBanner(ctx, CANVAS_W, CANVAS_H, config, loadedImages[config.bgIndex]);
		});

		return () => cancelAnimationFrame(rafRef.current);
	}, [config, loadedImages, fontsReady]);

	const handleDownload = useCallback(
		(format: 'png' | 'webp') => {
			const img = loadedImages[config.bgIndex];
			if (!img) {
				return;
			}

			setDownloading(format);

			const EXPORT_SCALE = 2;
			const exportCanvas = document.createElement('canvas');
			exportCanvas.width = CANVAS_W * EXPORT_SCALE;
			exportCanvas.height = CANVAS_H * EXPORT_SCALE;
			const ctx = exportCanvas.getContext('2d');

			if (ctx) {
				drawBanner(ctx, exportCanvas.width, exportCanvas.height, config, img);
				const link = document.createElement('a');
				link.download = `banner-${Date.now()}.${format}`;

				const mimeType = format === 'webp' ? 'image/webp' : 'image/png';
				const quality = format === 'webp' ? 0.9 : 1.0;
				link.href = exportCanvas.toDataURL(mimeType, quality);
				link.click();
			}

			setTimeout(() => setDownloading(false), 1500);
		},
		[config, loadedImages]
	);

	return (
		<>
			<div className="relative py-3">
				<canvas
					className="block h-auto w-full rounded-xl"
					ref={previewRef}
					style={{ aspectRatio: ASPECT_RATIO }}
				/>
				{!imagesReady && (
					<div className="absolute inset-0 flex items-center justify-center">
						<div className="flex flex-col items-center gap-y-1">
							<Spinner className="size-8 text-theme" />
							<TextAnimate animation="slideUp" as="p" by="word" themed>
								chargement de l'image ...
							</TextAnimate>
						</div>
					</div>
				)}
			</div>

			<div className="screen-line-before flex gap-3 py-2 *:lowercase max-sm:flex-col sm:justify-end">
				<Button
					disabled={!imagesReady}
					onClick={() => handleDownload('png')}
					variant="outline"
				>
					{downloading === 'png' ? 'PNG téléchargé !' : 'Télécharger en PNG'}
				</Button>
				<Button disabled={!imagesReady} onClick={() => handleDownload('webp')}>
					{downloading === 'webp' ? 'WEBP téléchargé !' : 'Télécharger en WEBP'}
				</Button>
			</div>

			<div className="screen-line-before flex flex-col gap-y-3 py-3">
				<Label className="text-foreground text-sm" htmlFor="banner-title">
					Titre de votre article
				</Label>
				<Input
					id="banner-title"
					onChange={(event) => updateConfig('title', event.target.value)}
					value={config.title}
				/>
			</div>

			<div className="screen-line-before flex flex-col gap-y-3 py-3">
				<Label className="text-foreground text-sm" htmlFor="banner-subtitle">
					Sous-titre ou description de votre article
				</Label>
				<Input
					id="banner-subtitle"
					onChange={(event) => updateConfig('subtitle', event.target.value)}
					value={config.subtitle}
				/>
			</div>

			<div className="screen-line-before py-3">
				<fieldset>
					<legend className="mb-3 text-foreground text-sm">
						Choisissez votre image de fond
					</legend>
					<div className="flex flex-wrap gap-4">
						<div className="flex flex-col gap-y-2">
							<input
								accept="image/*"
								className="hidden"
								id="custom-image-upload"
								onChange={handleImageUpload}
								type="file"
							/>
							<Label
								className={cn(
									'relative flex aspect-video w-32 shrink-0 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 transition-all',
									config.bgIndex === -1
										? 'border-theme opacity-100'
										: 'border-zinc-500 border-dashed opacity-60 hover:opacity-100'
								)}
								htmlFor="custom-image-upload"
							>
								{loadedImages[-1] ? (
									<img
										aria-label="Image personnalisée"
										className="m-0! block h-full w-full object-cover"
										src={loadedImages[-1].src}
									/>
								) : (
									<span className="text-2xl text-zinc-500">+</span>
								)}
							</Label>
							<span
								className={cn(
									'text-center text-xs',
									config.bgIndex === -1 && 'text-theme'
								)}
							>
								Personnalisée
							</span>
						</div>

						{PRESET_BACKGROUNDS.map((bg, i) => (
							<div className="flex flex-col gap-y-2" key={bg.name}>
								<button
									aria-pressed={config.bgIndex === i}
									className={cn(
										'relative aspect-video w-32 shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 transition-all',
										config.bgIndex === i
											? 'border-theme opacity-100'
											: 'border-transparent opacity-35 hover:opacity-70'
									)}
									onClick={() => updateConfig('bgIndex', i)}
									type="button"
								>
									<NextImage
										alt={bg.name}
										className="m-0! block h-full w-full object-cover"
										height={800}
										loading="lazy"
										src={bg.url}
										width={1400}
									/>
								</button>
								<span
									className={cn(
										'text-center text-xs',
										config.bgIndex === i && 'text-theme'
									)}
								>
									{bg.name}
								</span>
							</div>
						))}
					</div>
				</fieldset>
			</div>

			<div className="screen-line-before py-3">
				<fieldset>
					<legend className="mb-3 text-foreground text-sm">
						Police de votre titre et description
					</legend>
					<div className="flex flex-wrap gap-3">
						{FONTS.map((f, i) => (
							<Button
								aria-pressed={config.fontIndex === i}
								className={cn(
									config.fontIndex === i && 'text-theme hover:text-theme'
								)}
								key={f.name}
								onClick={() => updateConfig('fontIndex', i)}
								style={{ fontFamily: f.value }}
								variant="outline"
							>
								{f.name}
							</Button>
						))}
					</div>
				</fieldset>
			</div>

			<div className="screen-line-before grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-6 py-3">
				<fieldset>
					<legend className="mb-3 text-foreground text-sm">Alignement</legend>
					<div className="flex flex-wrap gap-3">
						{ALIGNMENTS.map(({ value, label }) => (
							<Button
								aria-pressed={config.align === value}
								className={cn(
									config.align === value && 'text-theme hover:text-theme'
								)}
								key={value}
								onClick={() => updateConfig('align', value)}
								variant="outline"
							>
								{label}
							</Button>
						))}
					</div>
				</fieldset>
				<fieldset>
					<legend className="mb-3 text-foreground text-sm">
						Couleur du titre et de la description
					</legend>
					<div className="flex items-center gap-3">
						<input
							className="aspect-square size-12 cursor-pointer rounded-md border-none bg-transparent"
							id="text-color"
							onChange={(e) => updateConfig('textColor', e.target.value)}
							type="color"
							value={config.textColor}
						/>
						<div className="flex flex-col gap-y-1">
							<span className="text-muted-foreground text-xs">
								Couleur sélectionnée :
							</span>
							<span
								className="text-lg uppercase"
								style={{
									color: config.textColor,
								}}
							>
								{config.textColor}
							</span>
						</div>
					</div>
				</fieldset>
			</div>

			<div className="screen-line-before grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-6 py-3">
				<div className="space-y-3">
					<Label className="text-foreground text-sm">
						Taille du texte —{' '}
						<span className="text-base text-theme">{config.fontSize}px</span>
					</Label>
					<Slider
						aria-label="Taille du titre"
						max={120}
						min={24}
						onValueChange={([v]) => updateConfig('fontSize', v)}
						step={1}
						value={[config.fontSize]}
					/>
				</div>
				<div className="space-y-3">
					<Label className="text-foreground text-sm">
						Overlay —{' '}
						<span className="text-base text-theme">
							{config.overlayOpacity}%
						</span>
					</Label>
					<Slider
						aria-label="Opacité de l'overlay"
						max={80}
						min={0}
						onValueChange={([v]) => updateConfig('overlayOpacity', v)}
						step={1}
						value={[config.overlayOpacity]}
					/>
				</div>
			</div>
		</>
	);
};
