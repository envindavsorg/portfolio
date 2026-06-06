"use client";

import { Slider as Primitive } from "@base-ui/react/slider";
import type { ComponentProps, Ref } from "react";

import { cn } from "@/lib/utils";

type SliderProps = Omit<
  ComponentProps<typeof Primitive.Root>,
  | "render"
  | "value"
  | "defaultValue"
  | "onValueChange"
  | "onValueCommitted"
> & {
  ref?: Ref<HTMLDivElement>;
  value?: number[];
  defaultValue?: number[];
  onValueChange?: (
    value: number[],
    eventDetails: Primitive.Root.ChangeEventDetails
  ) => void;
  onValueCommitted?: (
    value: number[],
    eventDetails: Primitive.Root.CommitEventDetails
  ) => void;
};

export const Slider = ({
  className,
  ref,
  value,
  defaultValue,
  onValueChange,
  onValueCommitted,
  ...props
}: SliderProps) => (
  <Primitive.Root
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className
    )}
    defaultValue={defaultValue}
    onValueChange={
      onValueChange as ComponentProps<
        typeof Primitive.Root
      >["onValueChange"]
    }
    onValueCommitted={
      onValueCommitted as ComponentProps<
        typeof Primitive.Root
      >["onValueCommitted"]
    }
    ref={ref}
    value={value}
    {...props}
  >
    <Primitive.Control className="relative flex w-full grow items-center">
      <Primitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
        <Primitive.Indicator className="absolute h-full rounded-full bg-theme" />
      </Primitive.Track>
      <Primitive.Thumb className="block size-5 cursor-pointer rounded-full border-2 border-theme bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[dragging]:cursor-grabbing" />
    </Primitive.Control>
  </Primitive.Root>
);
