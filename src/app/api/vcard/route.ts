import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { NextResponse } from "next/server";
import { VCard } from "vcard-creator";

import GLOBAL_DATA from "@/data/global";
import { logger } from "@/lib/logger";
import { convertImageToJpeg } from "@/lib/server";

export const dynamic = "force-static";

/**
 * Lit l'avatar depuis `public/` plutôt que par HTTP.
 *
 * La route est `force-static` : elle s'exécute au build, où aucun serveur
 * n'écoute. `fetch("/images/avatar.webp")` sur une URL relative lève donc
 * systématiquement, et le `catch` avalait l'erreur — la vCard n'a jamais pu
 * contenir de photo.
 */
const getVCardPhoto = async (publicPath: string) => {
  try {
    const filePath = join(
      process.cwd(),
      "public",
      // le chemin déclaré est une URL publique : on retire le / initial
      publicPath.replace(/^\//u, "").split("?")[0]
    );

    const buffer = await readFile(filePath);
    if (buffer.length === 0) {
      return null;
    }

    const jpegBuffer = await convertImageToJpeg(buffer);

    return {
      image: jpegBuffer.toString("base64"),
      mime: "jpeg",
    };
  } catch (error) {
    logger.warn(
      `vCard photo unavailable (${publicPath}): ${(error as Error).message}`
    );
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
