import { CERTS } from "@/app/(fr)/(content)/(root)/_components/certs/content";

const content = `
# Mes certifications

${CERTS.map((item) => `- [${item.title}](${item.credentialURL})`).join("\n")}
`;

export const dynamic = "force-static";

export const GET = async (): Promise<Response> =>
  new Response(content, {
    headers: {
      "Content-Type": "text/markdown;charset=utf-8",
    },
  });
