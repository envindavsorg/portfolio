import { clsx } from "clsx";
import type { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputClasses: ClassValue[]): string =>
  twMerge(clsx(inputClasses));
