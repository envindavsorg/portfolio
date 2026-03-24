"use client";

import { Range, Root, Thumb, Track } from "@radix-ui/react-slider";
import { forwardRef } from "react";
import type { ComponentPropsWithoutRef, ComponentRef } from "react";

import { cn } from "@/lib/utils";

export const Slider = forwardRef<
  ComponentRef<typeof Root>,
  ComponentPropsWithoutRef<typeof Root>
>(({ className, ...props }, ref) => (
  <Root
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className
    )}
    ref={ref}
    {...props}
  >
    <Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
      <Range className="absolute h-full bg-theme" />
    </Track>
    <Thumb className="block size-5 cursor-pointer rounded-full border-2 border-theme bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
  </Root>
));
