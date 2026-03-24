import { NextResponse } from "next/server";
import VCard from "vcard-creator";

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
      mine: "jpeg",
    };
  } catch {
    return null;
  }
};

export const GET = async (): Promise<Response> => {
  const card = new VCard();

  card
    .addName(GLOBAL_DATA.USER.fullName)
    .addPhoneNumber(GLOBAL_DATA.USER.phoneNumber)
    .addAddress(GLOBAL_DATA.USER.location.city)
    .addEmail(GLOBAL_DATA.USER.emailAddress)
    .addURL(GLOBAL_DATA.SOCIAL.portfolio);

  const photo = await getVCardPhoto(GLOBAL_DATA.USER.avatar);
  if (photo) {
    card.addPhoto(photo.image, photo.mine);
  }

  if (GLOBAL_DATA.WORK.jobs.length > 0) {
    const company = GLOBAL_DATA.WORK.jobs[0];
    card.addCompany(company.company).addJobtitle(company.title);
  }

  return new NextResponse(card.toString(), {
    headers: {
      "Content-Disposition": `attachment; filename=${GLOBAL_DATA.USER.firstName}-vcard.vcf`,
      "Content-Type": "text/x-vcard",
    },
    status: 200,
  });
};
