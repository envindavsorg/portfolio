"use client";

import { Popover as Primitive } from "@base-ui/react/popover";
import type { ComponentProps, ReactElement, Ref } from "react";

import { cn } from "@/lib/utils";

type PopoverProps = Omit<
  ComponentProps<typeof Primitive.Root>,
  "onOpenChange"
> & {
  onOpenChange?: (open: boolean) => void;
};

export const Popover = ({ onOpenChange, ...props }: PopoverProps) => (
  <Primitive.Root
    onOpenChange={
      onOpenChange ? (open) => onOpenChange(open) : undefined
    }
    {...props}
  />
);

type PopoverTriggerProps = Omit<
  ComponentProps<typeof Primitive.Trigger>,
  "render"
> & {
  asChild?: boolean;
};

export const PopoverTrigger = ({
  asChild = false,
  children,
  className,
  ...props
}: PopoverTriggerProps) => {
  if (asChild) {
    return (
      <Primitive.Trigger
        render={children as ReactElement<Record<string, unknown>>}
        {...props}
      />
    );
  }

  return (
    <Primitive.Trigger className={className} {...props}>
      {children}
    </Primitive.Trigger>
  );
};

type PopoverContentProps = ComponentProps<typeof Primitive.Popup> &
  Pick<
    ComponentProps<typeof Primitive.Positioner>,
    "align" | "alignOffset" | "side" | "sideOffset"
  > & {
    ref?: Ref<HTMLDivElement>;
  };

export const PopoverContent = ({
  className,
  align = "center",
  side = "bottom",
  sideOffset = 4,
  alignOffset = 0,
  ref,
  ...props
}: PopoverContentProps) => (
  <Primitive.Portal>
    <Primitive.Positioner
      align={align}
      alignOffset={alignOffset}
      className="isolate z-50"
      side={side}
      sideOffset={sideOffset}
    >
      <Primitive.Popup
        className={cn(
          "z-50 w-72 rounded-md border border-input bg-popover p-4 text-popover-foreground outline-none",
          "origin-(--transform-origin)",
          "data-open:fade-in-0 data-open:zoom-in-95 data-open:animate-in",
          "data-closed:fade-out-0 data-closed:zoom-out-95 data-closed:animate-out",
          "data-[side=top]:slide-in-from-bottom-2",
          "data-[side=bottom]:slide-in-from-top-2",
          "data-[side=right]:slide-in-from-left-2",
          "data-[side=left]:slide-in-from-right-2",
          "data-[side=inline-start]:slide-in-from-right-2",
          "data-[side=inline-end]:slide-in-from-left-2",
          className
        )}
        ref={ref}
        {...props}
      />
    </Primitive.Positioner>
  </Primitive.Portal>
);
