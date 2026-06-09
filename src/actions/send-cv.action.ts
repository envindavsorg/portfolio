"use server";

import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { headers } from "next/headers";
import { Resend } from "resend";

import { ActionError, actionClient } from "@/actions/safe-action";
import { CvTemplate } from "@/app/(fr)/(content)/(root)/_components/cv/CvTemplate";
import GLOBAL_DATA from "@/data/global";
import { env } from "@/env";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { emailSchema } from "@/schemas/emailSchema";

const RATE_LIMIT_PER_IP = { limit: 3, windowMs: 10 * 60 * 1000 };
const RATE_LIMIT_GLOBAL = { limit: 20, windowMs: 60 * 60 * 1000 };

export const sendCvAction = actionClient
  .inputSchema(emailSchema)
  .action(async ({ parsedInput }) => {
    const { firstName, recipientEmail } = parsedInput;

    const clientIp = getClientIp(await headers());
    const perIp = checkRateLimit(
      `send-cv:ip:${clientIp}`,
      RATE_LIMIT_PER_IP
    );
    const global = checkRateLimit(
      "send-cv:global",
      RATE_LIMIT_GLOBAL
    );

    if (!(perIp.allowed && global.allowed)) {
      throw new ActionError(
        "Trop de demandes, réessayez dans quelques minutes !"
      );
    }

    if (!env.RESEND_API_KEY) {
      throw new ActionError(
        "L'envoi d'e-mails n'est pas disponible pour le moment !"
      );
    }

    const resend = new Resend(env.RESEND_API_KEY);

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
