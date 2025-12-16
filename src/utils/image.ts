import sharp from 'sharp';

const convertImageToJpeg = async (imageBuffer: Buffer): Promise<Buffer> => {
	try {
		return await sharp(imageBuffer)
			.rotate()
			.jpeg({
				quality: 80,
				progressive: true,
				mozjpeg: true,
				// Prevents color bleeding on red text/sharp lines
				chromaSubsampling: '4:4:4',
			})
			.toBuffer();
	} catch (error) {
		console.error(`Image conversion failed: ${(error as Error).message}`);
		throw error;
	}
};

export default convertImageToJpeg;
