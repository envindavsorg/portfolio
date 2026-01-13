'use client';

import { CaretDownIcon, CaretUpIcon } from '@phosphor-icons/react';
import type React from 'react';
import { forwardRef, useCallback, useEffect, useState } from 'react';
import { NumericFormat, type NumericFormatProps } from 'react-number-format';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export interface NumberInputProps extends Omit<NumericFormatProps, 'value' | 'onValueChange'> {
	stepper?: number;
	thousandSeparator?: string;
	placeholder?: string;
	defaultValue?: number;
	min?: number;
	max?: number;
	value?: number;
	suffix?: string;
	prefix?: string;
	onValueChange?: (value: number | undefined) => void;
	fixedDecimalScale?: boolean;
	decimalScale?: number;
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
	(
		{
			stepper,
			thousandSeparator,
			placeholder,
			defaultValue,
			min = Number.NEGATIVE_INFINITY,
			max = Number.POSITIVE_INFINITY,
			onValueChange,
			fixedDecimalScale = false,
			decimalScale = 0,
			suffix,
			prefix,
			value: controlledValue,
			...props
		},
		ref
	): React.JSX.Element => {
		const [value, setValue] = useState<number | undefined>(controlledValue ?? defaultValue);

		const handleIncrement = useCallback(() => {
			setValue((prev) => (prev === undefined ? (stepper ?? 1) : Math.min(prev + (stepper ?? 1), max)));
		}, [stepper, max]);

		const handleDecrement = useCallback(() => {
			setValue((prev) => (prev === undefined ? -(stepper ?? 1) : Math.max(prev - (stepper ?? 1), min)));
		}, [stepper, min]);

		useEffect(() => {
			if (controlledValue !== undefined) {
				setValue(controlledValue);
			}
		}, [controlledValue]);

		const handleChange = (values: { value: string; floatValue: number | undefined }) => {
			const newValue = values.floatValue === undefined ? undefined : values.floatValue;
			setValue(newValue);
			if (onValueChange) {
				onValueChange(newValue);
			}
		};

		const handleBlur = () => {
			const refObject = ref as React.RefObject<HTMLInputElement>;
			if (value !== undefined) {
				if (value < min) {
					setValue(min);
					if (refObject?.current) {
						refObject.current.value = String(min);
					}
				} else if (value > max) {
					setValue(max);
					if (refObject?.current) {
						refObject.current.value = String(max);
					}
				}
			}
		};

		return (
			<div className="flex items-center">
				<NumericFormat
					allowNegative={min < 0}
					className="relative rounded-r-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
					customInput={Input}
					decimalScale={decimalScale}
					fixedDecimalScale={fixedDecimalScale}
					getInputRef={ref}
					max={max}
					min={min}
					onBlur={handleBlur}
					onValueChange={handleChange}
					placeholder={placeholder}
					prefix={prefix}
					suffix={suffix}
					thousandSeparator={thousandSeparator}
					value={value}
					valueIsNumericString
					{...props}
				/>

				<div className="flex flex-col">
					<Button
						aria-label="Increase value"
						className="h-5 rounded-none border-input border-b-[0.5px] border-l-0 px-2 focus-visible:relative"
						disabled={value === max}
						onClick={handleIncrement}
						variant="outline"
					>
						<CaretUpIcon className="size-3" />
					</Button>
					<Button
						aria-label="Decrease value"
						className="h-5 rounded-none border-input border-t-[0.5px] border-l-0 px-2 focus-visible:relative"
						disabled={value === min}
						onClick={handleDecrement}
						variant="outline"
					>
						<CaretDownIcon className="size-3" />
					</Button>
				</div>
			</div>
		);
	}
);
