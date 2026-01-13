import type { MetadataJson } from 'libphonenumber-js/core';
import { formatIncompletePhoneNumber as _formatIncompletePhoneNumber } from 'libphonenumber-js/core';
import metadataJson from '@/assets/libphonenumber.metadata.json' with { type: 'json' };

const metadata = metadataJson as MetadataJson;

/**
 * Formats an incomplete phone number string according to the metadata provided (currently only for Vietnam).
 *
 * Uses `libphonenumber-js`'s `formatIncompletePhoneNumber` function with custom metadata.
 *
 * @param phone - The phone number string to format (maybe incomplete).
 * @returns The formatted phone number string.
 *
 * @remarks
 * - Only Vietnam (VN) metadata is included by default. To add more countries, update and run the `generate-libphonenumber-metadata` script in `package.json`.
 * - This function is useful for formatting user input as they type a phone number.
 *
 * @see https://www.npmjs.com/package/libphonenumber-js#customizing-metadata
 */
export const formatIncompletePhoneNumber = (phone: string) => _formatIncompletePhoneNumber(phone, metadata);
