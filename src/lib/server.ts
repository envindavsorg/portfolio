import sharp from 'sharp';
import { logger } from './logger';

/**
 * Server-only utilities
 * This file contains utilities that can ONLY be used on the server-side
 * (API routes, Server Components, Server Actions, etc.)
 *
 * DO NOT import this file from Client Components!
 */

export const convertImageToJpeg = async (imageBuffer: Buffer): Promise<Buffer> => {
	try {
		return await sharp(imageBuffer)
			.rotate()
			.jpeg({
				quality: 80,
				progressive: true,
				mozjpeg: true,
				chromaSubsampling: '4:4:4',
			})
			.toBuffer();
	} catch (error) {
		logger.error(`Image conversion failed: ${(error as Error).message}`);
		throw error;
	}
};
