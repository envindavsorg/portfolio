import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputClasses: ClassValue[]): string =>
	twMerge(clsx(inputClasses));

export const isRouteActive = (
	href: string,
	pathname: string | null
): boolean => {
	const path = pathname ?? '';

	if (path === href) {
		return true;
	}

	if (href === '/') {
		return false;
	}

	return path.startsWith(`${href}/`);
};
