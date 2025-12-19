'use client';

import { CaretDownIcon, CheckIcon } from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'motion/react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/Popover';
import { hexToHsl, normalizeColor, trimColorString } from '@/lib/palette';

type ColorPickerProps = {
	color: string;
	onChangeAction: (color: string) => void;
};

export const ColorPicker = ({ color, onChangeAction }: ColorPickerProps) => {
	const [hsl, setHsl] = useState<[number, number, number]>([0, 0, 0]);
	const [colorInput, setColorInput] = useState(color);
	const [isOpen, setIsOpen] = useState(false);

	const handleColorChange = (newColor: string) => {
		const normalizedColor = normalizeColor(newColor);
		setColorInput(normalizedColor);

		const [h, s, l] = normalizedColor.startsWith('#')
			? hexToHsl(normalizedColor)
			: normalizedColor.match(/\d+(\.\d+)?/g)?.map(Number) || [0, 0, 0];

		setHsl([h, s, l]);
		onChangeAction(
			`hsl(${h.toFixed(1)}, ${s.toFixed(1)}%, ${l.toFixed(1)}%)`,
		);
	};

	useEffect(() => {
		handleColorChange(color);
	}, [color]);

	const handleHueChange = (hue: number) => {
		const newHsl: [number, number, number] = [hue, hsl[1], hsl[2]];
		setHsl(newHsl);
		handleColorChange(`hsl(${newHsl[0]}, ${newHsl[1]}%, ${newHsl[2]}%)`);
	};

	const handleSaturationLightnessChange = (
		event: React.MouseEvent<HTMLDivElement>,
	) => {
		const rect = event.currentTarget.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;
		const s = Math.round((x / rect.width) * 100);
		const l = Math.round(100 - (y / rect.height) * 100);
		const newHsl: [number, number, number] = [hsl[0], s, l];
		setHsl(newHsl);
		handleColorChange(`hsl(${newHsl[0]}, ${newHsl[1]}%, ${newHsl[2]}%)`);
	};

	const handleColorInputChange = (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const newColor = event.target.value;
		setColorInput(newColor);
		if (
			/^#[0-9A-Fa-f]{6}$/.test(newColor) ||
			/^hsl$$\d+,\s*\d+%,\s*\d+%$$$/.test(newColor)
		) {
			handleColorChange(newColor);
		}
	};

	const colorPresets = [
		'#FF3B30',
		'#FF9500',
		'#FFCC00',
		'#4CD964',
		'#5AC8FA',
		'#007AFF',
		'#5856D6',
		'#FF2D55',
		'#8E8E93',
		'#EFEFF4',
		'#E5E5EA',
		'#D1D1D6',
	];

	return (
		<Popover onOpenChange={setIsOpen} open={isOpen}>
			<PopoverTrigger asChild>
				<Button
					className="w-[250px] justify-start text-left font-normal"
					variant="outline"
				>
					<div
						className="mr-2 size-4 rounded-full shadow-sm"
						style={{ backgroundColor: colorInput }}
					/>
					<span className="flex-grow">
						{trimColorString(colorInput)}
					</span>
					<CaretDownIcon className="size-4 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[240px] p-3">
				<motion.div
					animate={{ opacity: 1, scale: 1 }}
					className="space-y-3"
					exit={{ opacity: 0, scale: 0.95 }}
					initial={{ opacity: 0, scale: 0.95 }}
					transition={{ duration: 0.2 }}
				>
					<motion.div
						className="relative h-40 w-full cursor-crosshair overflow-hidden rounded-lg"
						onClick={handleSaturationLightnessChange}
						style={{
							background: `
                linear-gradient(to top, rgba(0, 0, 0, 1), transparent),
                linear-gradient(to right, rgba(255, 255, 255, 1), rgba(255, 0, 0, 0)),
                hsl(${hsl[0]}, 100%, 50%)
              `,
						}}
					>
						<motion.div
							className="absolute size-4 rounded-full border-2 border-white shadow-md"
							style={{
								left: `${hsl[1]}%`,
								top: `${100 - hsl[2]}%`,
								backgroundColor: `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`,
							}}
							whileHover={{ scale: 1.2 }}
							whileTap={{ scale: 0.9 }}
						/>
					</motion.div>
					<motion.input
						className="h-3 w-full cursor-pointer appearance-none rounded-full"
						max="360"
						min="0"
						onChange={(e) =>
							handleHueChange(Number(e.target.value))
						}
						style={{
							background: `linear-gradient(to right,
                hsl(0, 100%, 50%), hsl(60, 100%, 50%), hsl(120, 100%, 50%),
                hsl(180, 100%, 50%), hsl(240, 100%, 50%), hsl(300, 100%, 50%), hsl(360, 100%, 50%)
              )`,
						}}
						type="range"
						value={hsl[0]}
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
					/>
					<div className="flex items-center space-x-2">
						<Label className="sr-only" htmlFor="color-input">
							Color
						</Label>
						<Input
							className="h-8 flex-grow rounded-md border border-gray-300 bg-white px-2 text-sm"
							id="color-input"
							onChange={handleColorInputChange}
							placeholder="#RRGGBB or hsl(h, s%, l%)"
							type="text"
							value={colorInput}
						/>
						<motion.div
							className="h-8 w-8 rounded-md shadow-sm"
							style={{ backgroundColor: colorInput }}
							whileHover={{ scale: 1.1 }}
							whileTap={{ scale: 0.9 }}
						/>
					</div>
					<div className="grid grid-cols-6 gap-2">
						<AnimatePresence>
							{colorPresets.map((preset) => (
								<motion.button
									className="relative h-8 w-8 rounded-full"
									key={preset}
									onClick={() => handleColorChange(preset)}
									style={{ backgroundColor: preset }}
									whileHover={{ scale: 1.2, zIndex: 1 }}
									whileTap={{ scale: 0.9 }}
								>
									{colorInput === preset && (
										<motion.div
											animate={{ scale: 1 }}
											exit={{ scale: 0 }}
											initial={{ scale: 0 }}
											transition={{ duration: 0.2 }}
										>
											<CheckIcon className="absolute inset-0 m-auto size-4 text-white" />
										</motion.div>
									)}
								</motion.button>
							))}
						</AnimatePresence>
					</div>
				</motion.div>
			</PopoverContent>
		</Popover>
	);
};
