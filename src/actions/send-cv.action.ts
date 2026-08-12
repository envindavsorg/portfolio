"use server";

import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { headers } from "next/headers";
import { Resend } from "resend";

import { actionClient } from "@/actions/safe-action";
import { CvTemplate } from "@/app/(fr)/(content)/(root)/_components/cv/CvTemplate";
import GLOBAL_DATA from "@/data/global";
import { env } from "@/env";
import { logger } from "@/lib/logger";
import { RateLimiter } from "@/lib/rate-limit";
import { emailSchema } from "@/schemas/emailSchema";

/**
 * `new Resend(undefined)` lève « Missing API key » dès l'évaluation du module.
 * Comme RESEND_API_KEY est optionnelle, on instancie à la demande : sans clé,
 * l'action répond proprement au lieu de faire échouer le chargement du module.
 */
let resendClient: Resend | null = null;
const getResend = (apiKey: string): Resend => {
  resendClient ??= new Resend(apiKey);
  return resendClient;
};

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

/**
 * L'action est un endpoint public : sans garde-fou, n'importe qui peut faire
 * envoyer le CV à des adresses arbitraires depuis l'adresse du site (spam,
 * quota Resend épuisé, réputation du domaine dégradée).
 *
 * Trois limites complémentaires :
 * - par IP     : freine l'abus le plus courant ;
 * - par e-mail : évite de harceler une même adresse via des IP différentes ;
 * - globale    : plafonne la consommation du quota Resend, quoi qu'il arrive.
 */
const perIpLimiter = new RateLimiter({
  limit: 3,
  windowMs: 10 * MINUTE,
});
const perRecipientLimiter = new RateLimiter({
  limit: 2,
  windowMs: 24 * HOUR,
});
const globalLimiter = new RateLimiter({ limit: 60, windowMs: HOUR });

const getClientIp = async (): Promise<string> => {
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  if (forwardedFor) {
    // le premier maillon est l'IP cliente, les suivants sont les proxies
    const [first] = forwardedFor.split(",");
    if (first?.trim()) {
      return first.trim();
    }
  }
  return headerList.get("x-real-ip")?.trim() ?? "unknown";
};

const CV_PATH = join(
  process.cwd(),
  "public",
  "documents",
  "resume.pdf"
);

// le PDF ne change pas entre deux requêtes : on le lit et l'encode une fois
let cachedAttachment: string | null = null;
const getCvAttachment = async (): Promise<string> => {
  if (cachedAttachment) {
    return cachedAttachment;
  }
  const buffer = await readFile(CV_PATH);
  cachedAttachment = buffer.toString("base64");
  return cachedAttachment;
};

export const sendCvAction = actionClient
  .inputSchema(emailSchema)
  .action(async ({ parsedInput }) => {
    const { firstName, recipientEmail } = parsedInput;

    const apiKey = env.RESEND_API_KEY;
    if (!apiKey) {
      logger.error("RESEND_API_KEY is not configured");
      return { reason: "unavailable" as const, sent: false };
    }

    const ip = await getClientIp();
    const recipientKey = recipientEmail.trim().toLowerCase();

    const limits = [
      { name: "global", result: globalLimiter.check("all") },
      { name: "ip", result: perIpLimiter.check(ip) },
      {
        name: "recipient",
        result: perRecipientLimiter.check(recipientKey),
      },
    ];

    const exceeded = limits.find(({ result }) => !result.success);
    if (exceeded) {
      logger.warn(
        `CV send rate limited (${exceeded.name}) for ip=${ip}, retry in ${Math.ceil(
          exceeded.result.retryAfter / 1000
        )}s`
      );
      return { reason: "rate_limited" as const, sent: false };
    }

    const content = await getCvAttachment();

    const { error } = await getResend(apiKey).emails.send({
      attachments: [{ content, filename: GLOBAL_DATA.CV.name }],
      from: `${GLOBAL_DATA.USER.fullName} <${GLOBAL_DATA.USER.emailAddress}>`,
      react: CvTemplate({ firstName, recipientEmail }),
      subject: `CV - ${GLOBAL_DATA.USER.fullName} | ${GLOBAL_DATA.SOCIAL.portfolio}`,
      to: [recipientEmail],
    });

    if (error) {
      // le détail reste côté serveur : pas de fuite vers le client
      logger.error("Resend failed to send the CV:", error);
      return { reason: "send_failed" as const, sent: false };
    }

    return { reason: null, sent: true };
  });
