"use client";

import { Collapsible as Primitive } from "@base-ui/react/collapsible";
import type { ComponentProps, ReactElement } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { cn } from "@/lib/utils";

import { ChevronDown } from "../motion/ChevronDown";
import { ChevronUp } from "../motion/ChevronUp";

interface CollapsibleContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const CollapsibleContext =
  createContext<CollapsibleContextType | null>(null);

export const useCollapsible = () => {
  const context = useContext(CollapsibleContext);

  if (!context) {
    throw new Error(
      "Collapsible components must be used within a Collapsible"
    );
  }

  return context;
};

type CollapsibleProps = Omit<
  ComponentProps<typeof Primitive.Root>,
  "onOpenChange"
> & {
  onOpenChange?: (open: boolean) => void;
};

export const Collapsible = ({
  defaultOpen = false,
  open: openProp,
  onOpenChange,
  ...props
}: CollapsibleProps) => {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = openProp ?? internalOpen;

  const setOpen = useCallback(
    (next: boolean) => {
      setInternalOpen(next);
      onOpenChange?.(next);
    },
    [onOpenChange]
  );

  const value = useMemo(() => ({ open, setOpen }), [open, setOpen]);

  return (
    <CollapsibleContext.Provider value={value}>
      <Primitive.Root
        data-state={open ? "open" : "closed"}
        onOpenChange={setOpen}
        open={open}
        {...props}
      />
    </CollapsibleContext.Provider>
  );
};

// alias historique (l'ancienne implémentation radix séparait Root et contexte)
export const CollapsibleWithContext = Collapsible;

type CollapsibleTriggerProps = Omit<
  ComponentProps<typeof Primitive.Trigger>,
  "render"
> & {
  asChild?: boolean;
};

export const CollapsibleTrigger = ({
  asChild = false,
  children,
  className,
  ...props
}: CollapsibleTriggerProps) => {
  const { open } = useCollapsible();
  const dataState = open ? "open" : "closed";

  if (asChild) {
    return (
      <Primitive.Trigger
        data-state={dataState}
        render={children as ReactElement<Record<string, unknown>>}
        {...props}
      />
    );
  }

  return (
    <Primitive.Trigger
      className={className}
      data-state={dataState}
      {...props}
    >
      {children}
    </Primitive.Trigger>
  );
};

type CollapsibleContentProps = ComponentProps<typeof Primitive.Panel>;

export const CollapsibleContent = ({
  className,
  children,
  ...props
}: CollapsibleContentProps) => {
  const { open } = useCollapsible();

  return (
    <Primitive.Panel
      className={cn(
        "h-(--collapsible-panel-height) overflow-hidden",
        "transition-[height,opacity] duration-200 ease-out",
        "data-[ending-style]:h-0 data-[ending-style]:opacity-0",
        "data-[starting-style]:h-0 data-[starting-style]:opacity-0",
        className
      )}
      data-state={open ? "open" : "closed"}
      {...props}
    >
      {children}
    </Primitive.Panel>
  );
};

export const CollapsibleChevronsIcon = ({
  ref,
}: {
  ref?: React.Ref<AnimatedIconHandle>;
}) => {
  const { open } = useCollapsible();
  const Icon = open ? ChevronUp : ChevronDown;
  return <Icon ref={ref} />;
};
