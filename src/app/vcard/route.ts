import { NextResponse } from 'next/server';
import VCard from 'vcard-creator';
import { USER } from '@/content/user';
import convertImageToJpeg from '@/utils/image';
import { decodeEmail, decodePhoneNumber } from '@/utils/string';

export const dynamic = 'force-static';

const getVCardPhoto = async (url: string) => {
	try {
		const res = await fetch(url);

		if (!res.ok) {
			return null;
		}

		const buffer = Buffer.from(await res.arrayBuffer());
		if (buffer.length === 0) {
			return null;
		}

		const contentType = res.headers.get('Content-Type') || '';
		if (!contentType.startsWith('image/')) {
			return null;
		}

		const jpegBuffer = await convertImageToJpeg(buffer);
		const image = jpegBuffer.toString('base64');

		return {
			image,
			mine: 'jpeg',
		};
	} catch {
		return null;
	}
};

export const GET = async (): Promise<Response> => {
	const card = new VCard();

	card.addName(USER.lastName, USER.firstName)
		.addPhoneNumber(decodePhoneNumber(USER.phoneNumber))
		.addAddress(USER.address)
		.addEmail(decodeEmail(USER.email))
		.addURL(USER.website);

	const photo = await getVCardPhoto(USER.avatar);
	if (photo) {
		card.addPhoto(photo.image, photo.mine);
	}

	if (USER.jobs.length > 0) {
		const company = USER.jobs[0];
		card.addCompany(company.company).addJobtitle(company.title);
	}

	return new NextResponse(card.toString(), {
		status: 200,
		headers: {
			'Content-Type': 'text/x-vcard',
			'Content-Disposition': `attachment; filename=${USER.username}-vcard.vcf`,
		},
	});
};
