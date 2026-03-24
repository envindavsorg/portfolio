"use client";

import {
  CheckCircleIcon,
  CircleNotchIcon,
  InfoIcon,
  WarningIcon,
  XSquareIcon,
} from "@phosphor-icons/react";
import { useMediaQuery } from "@uidotdev/usehooks";
import { useTheme } from "next-themes";
import type { CSSProperties } from "react";
import { Toaster as Sonner } from "sonner";
import type { ToasterProps } from "sonner";

export const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <Sonner
      className="toaster group"
      icons={{
        error: (
          <XSquareIcon className="size-5 text-destructive sm:size-6" />
        ),
        info: (
          <InfoIcon className="size-5 text-blue-600 sm:size-6 dark:text-blue-300" />
        ),
        loading: (
          <CircleNotchIcon className="size-5 animate-spin text-theme sm:size-6" />
        ),
        success: (
          <CheckCircleIcon className="size-5 text-green-600 sm:size-6 dark:text-green-300" />
        ),
        warning: (
          <WarningIcon className="size-5 text-amber-600 sm:size-6 dark:text-amber-300" />
        ),
      }}
      position={isDesktop ? "top-right" : "top-center"}
      style={
        {
          "--border-radius": "var(--radius-lg)",
          "--normal-bg": "var(--popover)",
          "--normal-border": "var(--input)",
          "--normal-text": "var(--popover-foreground)",
        } as CSSProperties
      }
      theme={theme as ToasterProps["theme"]}
      toastOptions={{
        classNames: {
          description:
            "ps-1 sm:ps-2 text-xs sm:text-sm text-muted-foreground",
          title: "text-sm font-medium text-foreground",
          toast: "border-edge shadow-lg backdrop-blur-sm",
        },
      }}
      {...props}
    />
  );
};
