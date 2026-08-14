"use server";

import { revalidatePath } from "next/cache";

import { actionClient } from "@/actions/safe-action";
import { requireAdminSession } from "@/lib/admin/auth";
import { commitFile, readFile } from "@/lib/admin/commit";
import {
  checkMessages,
  isBlocking,
  serializeMessages,
} from "@/lib/admin/messages";
import { z } from "@/lib/zod-config";

/**
 * Enregistrer les traductions.
 *
 * Deux fichiers, donc DEUX commits éventuels : l'API `contents` de GitHub écrit
 * un fichier à la fois, et passer par l'API des arbres pour un commit atomique
 * demanderait six appels et autant de modes de panne.
 *
 * Ce découpage est sûr ici, mais pas par hasard : la seule asymétrie dangereuse
 * est une clé anglaise sans équivalent français — `compile-i18n.mts` compte les
 * clés françaises et échouerait. Or `checkMessages` la refuse AVANT d'écrire.
 * L'asymétrie inverse, une clé française pas encore traduite, est le cas normal :
 * Paraglide retombe sur le français.
 */

const schema = z.object({
  english: z.record(z.string(), z.string()),
  french: z.record(z.string(), z.string()),
});

const FILES = {
  en: "messages/en.json",
  fr: "messages/fr.json",
} as const;

export const saveMessagesAction = actionClient
  .inputSchema(schema)
  .action(async ({ parsedInput }) => {
    await requireAdminSession();

    const blocking = checkMessages(
      parsedInput.french,
      parsedInput.english
    ).filter(isBlocking);

    if (blocking.length > 0) {
      // on refuse plutôt que de laisser un build casser deux minutes plus tard,
      // quand personne ne regardera plus l'écran
      return {
        blocking,
        committed: [],
        saved: false,
      };
    }

    const payloads = [
      {
        content: serializeMessages(parsedInput.french),
        locale: "fr" as const,
        path: FILES.fr,
      },
      {
        content: serializeMessages(parsedInput.english),
        locale: "en" as const,
        path: FILES.en,
      },
    ];

    const committed: { locale: string; url: string }[] = [];

    for (const payload of payloads) {
      const existing = await readFile(payload.path);

      // rien à écrire si le fichier est déjà exactement celui-là
      if (existing?.content === payload.content) {
        continue;
      }

      const commit = await commitFile({
        content: payload.content,
        message: `traductions : ${payload.locale} depuis l'administration`,
        path: payload.path,
        sha: existing?.sha,
      });

      committed.push({ locale: payload.locale, url: commit.url });
    }

    revalidatePath("/admin");

    return { blocking: [], committed, saved: true };
  });
