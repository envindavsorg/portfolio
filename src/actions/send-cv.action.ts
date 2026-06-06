"use server";

import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { Resend } from "resend";

import { actionClient } from "@/actions/safe-action";
import { CvTemplate } from "@/app/(fr)/(content)/(root)/_components/cv/CvTemplate";
import GLOBAL_DATA from "@/data/global";
import { env } from "@/env";
import { emailSchema } from "@/schemas/emailSchema";

const resend = new Resend(env.RESEND_API_KEY);

export const sendCvAction = actionClient
  .inputSchema(emailSchema)
  .action(async ({ parsedInput }) => {
    const { firstName, recipientEmail } = parsedInput;

    const path = join(
      process.cwd(),
      "public",
      "documents",
      "resume.pdf"
    );
    const buffer: Buffer = await readFile(path);
    const filename = GLOBAL_DATA.CV.name;
    const content = buffer.toString("base64");

    const { error } = await resend.emails.send({
      attachments: [{ content, filename }],
      from: `${GLOBAL_DATA.USER.fullName} <${GLOBAL_DATA.USER.emailAddress}>`,
      react: CvTemplate({ firstName, recipientEmail }),
      subject: `CV - ${GLOBAL_DATA.USER.fullName} | ${GLOBAL_DATA.SOCIAL.portfolio}`,
      to: [recipientEmail],
    });

    if (error) {
      throw new Error("Erreur lors de l'envoi du mail !");
    }

    return { sent: true };
  });
