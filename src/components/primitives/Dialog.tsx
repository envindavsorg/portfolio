"use client";

import { Dialog as Primitive } from "@base-ui/react/dialog";
import type { ComponentProps, ReactElement } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { cn } from "@/lib/utils";

interface DialogContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DialogContext = createContext<DialogContextType | null>(null);

const useDialogState = () => useContext(DialogContext);

const stateAttr = (open: boolean) => (open ? "open" : "closed");

type DialogProps = Omit<
  ComponentProps<typeof Primitive.Root>,
  "onOpenChange"
> & {
  onOpenChange?: (open: boolean) => void;
  /** false = un clic en dehors ne ferme pas la boîte de dialogue */
  dismissOnOutsideClick?: boolean;
};

export const Dialog = ({
  defaultOpen = false,
  dismissOnOutsideClick = true,
  open: openProp,
  onOpenChange,
  children,
  ...props
}: DialogProps) => {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = openProp ?? internalOpen;

  const setOpen = useCallback(
    (next: boolean) => {
      setInternalOpen(next);
      onOpenChange?.(next);
    },
    [onOpenChange]
  );

  const handleOpenChange = useCallback(
    (
      next: boolean,
      details?: { reason?: string; cancel?: () => void }
    ) => {
      if (
        !dismissOnOutsideClick &&
        details?.reason === "outside-press"
      ) {
        details.cancel?.();
        return;
      }
      setOpen(next);
    },
    [dismissOnOutsideClick, setOpen]
  );

  const value = useMemo(() => ({ open, setOpen }), [open, setOpen]);

  return (
    <DialogContext.Provider value={value}>
      <Primitive.Root
        onOpenChange={handleOpenChange}
        open={open}
        {...props}
      >
        {children}
      </Primitive.Root>
    </DialogContext.Provider>
  );
};

type DialogTriggerProps = Omit<
  ComponentProps<typeof Primitive.Trigger>,
  "render"
> & {
  asChild?: boolean;
};

export const DialogTrigger = ({
  asChild = false,
  children,
  ...props
}: DialogTriggerProps) => {
  const ctx = useDialogState();
  const dataState = ctx ? stateAttr(ctx.open) : undefined;

  if (asChild) {
    return (
      <Primitive.Trigger
        data-slot="dialog-trigger"
        data-state={dataState}
        render={children as ReactElement<Record<string, unknown>>}
        {...props}
      />
    );
  }

  return (
    <Primitive.Trigger
      data-slot="dialog-trigger"
      data-state={dataState}
      {...props}
    >
      {children}
    </Primitive.Trigger>
  );
};

export const DialogPortal = ({
  ...props
}: ComponentProps<typeof Primitive.Portal>) => (
  <Primitive.Portal {...props} />
);

export const DialogClose = ({
  ...props
}: ComponentProps<typeof Primitive.Close>) => (
  <Primitive.Close data-slot="dialog-close" {...props} />
);

export const DialogOverlay = ({
  className,
  ...props
}: ComponentProps<typeof Primitive.Backdrop>) => {
  const ctx = useDialogState();
  const dataState = ctx ? stateAttr(ctx.open) : undefined;

  return (
    <Primitive.Backdrop
      className={cn(
        "pointer-events-none fixed inset-0 z-50 select-none",
        "hidden bg-background/50 backdrop-blur-xs sm:block",
        "transition-opacity duration-300 ease-out",
        "data-[ending-style]:opacity-0 data-[starting-style]:opacity-0",
        className
      )}
      data-slot="dialog-overlay"
      data-state={dataState}
      {...props}
    />
  );
};

type DialogContentProps = Omit<
  ComponentProps<typeof Primitive.Popup>,
  "render"
> & {
  overlay?: boolean;
  /**
   * Preserved from the radix API. Base UI Dialog has no per-popup
   * `onInteractOutside`; see consumerActions. Accepted and ignored here
   * to avoid forwarding an invalid prop to the DOM element.
   */
  onInteractOutside?: (event: Event) => void;
};

export const DialogContent = ({
  className,
  overlay = true,
  children,
  // Stripped: not a Base UI Popup prop. See consumerActions.
  onInteractOutside: _onInteractOutside,
  ...props
}: DialogContentProps) => {
  const ctx = useDialogState();
  const dataState = ctx ? stateAttr(ctx.open) : undefined;

  return (
    <DialogPortal>
      {overlay && <DialogOverlay />}
      <Primitive.Popup
        className={cn(
          "fixed sm:top-auto sm:right-0 sm:bottom-0 sm:left-auto sm:m-6 sm:translate-x-0 sm:translate-y-0",
          "rounded-md border border-input p-5 outline-none focus:outline-none",
          "z-50 hidden w-full max-w-[calc(100%-2rem)] sm:grid sm:max-w-100",
          "transition-[opacity,transform,scale] duration-600 ease-out",
          "data-[ending-style]:fade-out-0 data-[ending-style]:zoom-out-95 data-[ending-style]:duration-300",
          "data-[starting-style]:translate-y-20 data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
          className
        )}
        data-slot="dialog-content"
        data-state={dataState}
        {...props}
      >
        {children}
      </Primitive.Popup>
    </DialogPortal>
  );
};

export const DialogHeader = ({
  className,
  ...props
}: ComponentProps<"div">) => (
  <div
    className={cn("mb-4 flex flex-col gap-2 text-start", className)}
    data-slot="dialog-header"
    {...props}
  />
);

export const DialogFooter = ({
  className,
  ...props
}: ComponentProps<"div">) => (
  <div
    className={cn(
      "mt-6 flex flex-row items-center justify-between",
      className
    )}
    data-slot="dialog-footer"
    {...props}
  />
);

export const DialogTitle = ({
  className,
  ...props
}: ComponentProps<typeof Primitive.Title>) => (
  <Primitive.Title
    className={cn(
      "font-semibold text-lg text-theme leading-normal",
      className
    )}
    data-slot="dialog-title"
    {...props}
  />
);

export const DialogDescription = ({
  className,
  ...props
}: ComponentProps<typeof Primitive.Description>) => (
  <Primitive.Description
    className={cn("text-muted-foreground text-sm", className)}
    data-slot="dialog-description"
    {...props}
  />
);
