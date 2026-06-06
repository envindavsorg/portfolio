import { NextResponse } from "next/server";
import { VCard } from "vcard-creator";

import GLOBAL_DATA from "@/data/global";
import { convertImageToJpeg } from "@/lib/server";

export const dynamic = "force-static";

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

    const contentType = res.headers.get("Content-Type") || "";
    if (!contentType.startsWith("image/")) {
      return null;
    }

    const jpegBuffer = await convertImageToJpeg(buffer);
    const image = jpegBuffer.toString("base64");

    return {
      image,
      mime: "jpeg",
    };
  } catch {
    return null;
  }
};

export const GET = async (): Promise<Response> => {
  const card = new VCard();

  card
    .addName({
      familyName: GLOBAL_DATA.USER.lastName,
      givenName: GLOBAL_DATA.USER.firstName,
    })
    .addPhoneNumber({ number: GLOBAL_DATA.USER.phoneNumber })
    .addAddress({ locality: GLOBAL_DATA.USER.location.city })
    .addEmail({ address: GLOBAL_DATA.USER.emailAddress })
    .addUrl({ url: GLOBAL_DATA.SOCIAL.portfolio });

  const photo = await getVCardPhoto(GLOBAL_DATA.USER.avatar);
  if (photo) {
    card.addPhoto({ image: photo.image, mime: photo.mime });
  }

  if (GLOBAL_DATA.WORK.jobs.length > 0) {
    const [company] = GLOBAL_DATA.WORK.jobs;
    card
      .addCompany({ name: company.company })
      .addJobtitle(company.title);
  }

  return new NextResponse(card.toString(), {
    headers: {
      "Content-Disposition": `attachment; filename=${GLOBAL_DATA.USER.firstName}-vcard.vcf`,
      "Content-Type": "text/x-vcard",
    },
    status: 200,
  });
};
