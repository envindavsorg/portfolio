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
      {/* `has-[:focus-visible]` et non `focus-visible:` : Base UI donne le
          focus à l'<input type="range"> masqué DANS le curseur, jamais au
          curseur lui-même. L'ancien `focus-visible:ring-2` ne s'appliquait donc
          jamais — calculé au clavier : `outline: none`, `box-shadow: none`. */}
      <Primitive.Thumb className="block size-5 cursor-pointer rounded-full border-2 border-theme bg-background transition-colors disabled:pointer-events-none disabled:opacity-50 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 data-[dragging]:cursor-grabbing" />
    </Primitive.Control>
  </Primitive.Root>
);
