import { formatIncompletePhoneNumber } from '@/lib/libphonenumber';

const safeDecode = (str: string): string => {
	if (!str) {
		return '';
	}

	try {
		if (typeof Buffer !== 'undefined') {
			return Buffer.from(str, 'base64').toString('utf-8');
		}
		return atob(str);
	} catch (e) {
		console.warn(`Failed to decode: ${str}`, e);
		return str;
	}
};

export const decodeEmail = (email: string): string => safeDecode(email);

export const decodePhoneNumber = (phone: string): string => safeDecode(phone);

export { formatIncompletePhoneNumber as formatPhoneNumber };
