import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputClasses: ClassValue[]): string =>
	twMerge(clsx(inputClasses));
