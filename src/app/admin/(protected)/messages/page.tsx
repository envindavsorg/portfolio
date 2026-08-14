import { readFileSync } from "node:fs";
import { join } from "node:path";

import { MessagesEditor } from "@/components/admin/MessagesEditor";
import { requireAdminSession } from "@/lib/admin/auth";
import type { MessageBundle } from "@/lib/admin/messages";

/**
 * Les 627 messages, dans les deux langues.
 *
 * Lus sur le DISQUE, contrairement au contenu MDX qui est relu depuis GitHub.
 * La différence est assumée : un fichier de messages n'a pas de SHA à
 * transporter puisque l'action relit l'état courant juste avant d'écrire, et
 * charger deux fichiers de 40 Ko par l'API à chaque ouverture d'écran serait du
 * gaspillage pour une donnée qui change au rythme du build.
 */
const read = (locale: string): MessageBundle =>
  JSON.parse(
    readFileSync(
      join(process.cwd(), `messages/${locale}.json`),
      "utf8"
    )
  );

const MessagesPage = async () => {
  await requireAdminSession();

  return <MessagesEditor english={read("en")} french={read("fr")} />;
};

export default MessagesPage;
