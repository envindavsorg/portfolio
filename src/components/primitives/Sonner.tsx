"use client";

import {
  CheckCircleIcon,
  CircleNotchIcon,
  InfoIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import { useMediaQuery } from "@uidotdev/usehooks";
import { useTheme } from "next-themes";
import type { CSSProperties } from "react";
import type { ToasterProps } from "sonner";
import { Toaster as Sonner } from "sonner";

import { cn } from "@/lib/utils";

import { Frown } from "../motion/Frown";

export const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <Sonner
      className="toaster group lowercase"
      icons={{
        error: <Frown size={22} />,
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
          "--border-radius": "var(--radius-md)",
          "--normal-bg": "var(--background)",
          "--normal-border": "var(--input)",
          "--normal-text": "var(--foreground)",
        } as CSSProperties
      }
      theme={theme as ToasterProps["theme"]}
      toastOptions={{
        classNames: {
          actionButton: "action-button",
          cancelButton: "cancel-button",
          closeButton: "close-button",
          description: "text-sm",
          error: "border! border-red-600! dark:border-red-300!",
          icon: cn(
            "group-data-[type=error]/toast:text-red-600! dark:group-data-[type=error]/toast:text-red-300!",
            "group-data-[type=info]/toast:text-blue-600! dark:group-data-[type=info]/toast:text-blue-300!"
          ),
          info: "border! border-blue-600! dark:border-blue-300!",
          title: cn(
            "text-base leading-none text-balance",
            "group-data-[type=error]/toast:text-red-600! dark:group-data-[type=error]/toast:text-red-300!",
            "group-data-[type=info]/toast:text-blue-600! dark:group-data-[type=info]/toast:text-blue-300!"
          ),
          toast:
            "group/toast flex! items-center! gap-x-3! font-pixel-square",
        },
      }}
      {...props}
    />
  );
};
