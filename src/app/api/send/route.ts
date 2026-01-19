import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { Resend } from "resend";
import GLOBAL_DATA from "@/content/data/global";
import { CvTemplate } from "@/features/(homepage)/4_cv/CvTemplate";
import emailSchema from "@/schemas/email.schema";

const resend = new Resend(process.env.RESEND_API_KEY);

interface BodyData {
  firstName: string;
  recipientEmail: string;
}

export const POST = async (request: Request): Promise<Response> => {
  try {
    const body = (await request.json()) satisfies BodyData;
    const validation = emailSchema.safeParse(body);

    if (!validation.success) {
      return Response.json(
        {
          error: "Données invalides",
          details: validation.error.issues,
        },
        { status: 400 },
      );
    }

    const { firstName, recipientEmail } = validation.data;

    const path = join(process.cwd(), "public", "documents", "resume.pdf");
    const buffer: Buffer = await readFile(path);
    const filename = GLOBAL_DATA.CV.name;
    const content = buffer.toString("base64");

    const { error } = await resend.emails.send({
      from: `${GLOBAL_DATA.USER.fullName} <${GLOBAL_DATA.USER.emailAddress}>`,
      to: [recipientEmail],
      subject: `CV - ${GLOBAL_DATA.USER.fullName} | ${GLOBAL_DATA.SOCIAL.portfolio}`,
      react: CvTemplate({ firstName, recipientEmail }),
      attachments: [{ filename, content }],
    });

    if (error) {
      return Response.json(
        { error: "Erreur lors de l'envoi du mail !" },
        { status: 500 },
      );
    }

    return Response.json({
      message: "Email envoyé avec succès ! ",
    });
  } catch {
    return Response.json(
      { error: "Une erreur serveur est survenue !" },
      { status: 500 },
    );
  }
};
