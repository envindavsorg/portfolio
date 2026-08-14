"use client";

import { CaretDownIcon, CaretUpIcon } from "@phosphor-icons/react";
import type {
  ComponentProps,
  ElementType,
  Ref,
  RefObject,
} from "react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { NumericFormatProps } from "react-number-format";
import { NumericFormat } from "react-number-format";

import { Button } from "@/components/primitives/Button";
import { cn } from "@/lib/utils";

interface InputProps extends ComponentProps<"input"> {
  icon?: ElementType<{
    ref: Ref<AnimatedIconHandle>;
    size: number;
    className?: string;
  }>;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", icon: Icon, ...props }, ref) => {
    const iconRef = useRef<AnimatedIconHandle>(null);

    const handleMouseEnter = useCallback(() => {
      iconRef.current?.startAnimation();
    }, []);

    const handleMouseLeave = useCallback(() => {
      iconRef.current?.stopAnimation();
    }, []);

    return (
      <div
        className="relative flex-1"
        onMouseEnter={Icon ? handleMouseEnter : undefined}
        onMouseLeave={Icon ? handleMouseLeave : undefined}
      >
        {Icon && (
          <Icon
            ref={iconRef}
            size={16}
            className="absolute top-1/2 left-3 -translate-y-1/2"
          />
        )}
        <input
          className={cn(
            "flex h-10 w-full px-3 py-2",
            Icon && "pl-9",
            "rounded-md border border-input bg-transparent outline-none",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
            "font-pixel-square lowercase",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm",
            "text-sm placeholder:text-muted-foreground",
            "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
            className
          )}
          ref={ref}
          type={type}
          {...props}
        />
      </div>
    );
  }
);

export interface InputNumberProps
  extends Omit<NumericFormatProps, "value" | "onValueChange"> {
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

export const InputNumber = forwardRef<
  HTMLInputElement,
  InputNumberProps
>(
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
  ) => {
    const [value, setValue] = useState<number | undefined>(
      controlledValue ?? defaultValue
    );

    const handleIncrement = useCallback(() => {
      setValue((prev) =>
        prev === undefined
          ? (stepper ?? 1)
          : Math.min(prev + (stepper ?? 1), max)
      );
    }, [stepper, max]);

    const handleDecrement = useCallback(() => {
      setValue((prev) =>
        prev === undefined
          ? -(stepper ?? 1)
          : Math.max(prev - (stepper ?? 1), min)
      );
    }, [stepper, min]);

    useEffect(() => {
      if (controlledValue !== undefined) {
        setValue(controlledValue);
      }
    }, [controlledValue]);

    const handleChange = useCallback(
      (values: { value: string; floatValue: number | undefined }) => {
        const newValue =
          values.floatValue === undefined
            ? undefined
            : values.floatValue;
        setValue(newValue);
        if (onValueChange) {
          onValueChange(newValue);
        }
      },
      [onValueChange]
    );

    const handleBlur = useCallback(() => {
      const refObject = ref as RefObject<HTMLInputElement>;
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
    }, [value, min, max, ref]);

    return (
      <div className="flex items-center">
        <NumericFormat
          allowNegative={min < 0}
          className={cn(
            "relative rounded-r-none",
            "[appearance:textfield]",
            "[&::-webkit-inner-spin-button]:appearance-none",
            "[&::-webkit-outer-spin-button]:appearance-none"
          )}
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
