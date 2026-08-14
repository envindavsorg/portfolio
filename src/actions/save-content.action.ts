"use server";

import { revalidatePath } from "next/cache";

import { actionClient } from "@/actions/safe-action";
import { requireAdminSession } from "@/lib/admin/auth";
import { commitFile, readFile } from "@/lib/admin/commit";
import { serializeMdx } from "@/lib/admin/frontmatter";
import {
  contentFilePath,
  contentPublicPath,
} from "@/lib/admin/paths";
import { z } from "@/lib/zod-config";

/**
 * Enregistrer un contenu : un commit dans le dépôt, puis un redéploiement.
 *
 * ⚠️ La garde est APPELÉE ICI, pas seulement dans la page qui affiche le
 * formulaire. Une action serveur est un point d'entrée HTTP à part entière : elle
 * est atteignable sans jamais charger la page, donc protéger l'écran ne protège
 * pas l'écriture. C'est le même raisonnement que pour la garde de page, appliqué
 * à l'autre porte.
 */

const schema = z.object({
  author: z.string().optional(),
  body: z.string(),
  category: z.enum(["articles", "components", "utils"]),
  cover: z.string().optional(),
  createdAt: z.string(),
  description: z.string().min(1, "une description est requise"),
  image: z.string().optional(),
  locale: z.enum(["fr", "en"]),
  series: z.string().optional(),
  seriesName: z.string().optional(),
  seriesOrder: z.number().int().positive().optional(),
  /**
   * SHA lu à l'ouverture du formulaire.
   *
   * Transmis à GitHub, il fait échouer l'écriture si le fichier a changé
   * entre-temps — plutôt que d'écraser en silence le travail d'un autre onglet.
   */
  sha: z.string().optional(),
  slug: z.string().min(1),
  tags: z.array(z.string()),
  title: z.string().min(1, "un titre est requis"),
  updatedAt: z.string(),
});

export const saveContentAction = actionClient
  .inputSchema(schema)
  .action(async ({ parsedInput }) => {
    const session = await requireAdminSession();

    const location = {
      category: parsedInput.category,
      locale: parsedInput.locale,
      slug: parsedInput.slug,
    };

    const path = contentFilePath(location);

    if (!path) {
      // ne pas dire POURQUOI : « refusé » et « inexistant » se ressemblent
      throw new Error("emplacement invalide");
    }

    const existing = await readFile(path);

    const content = serializeMdx({
      body: parsedInput.body,
      frontmatter: {
        author: parsedInput.author ?? null,
        category: parsedInput.category,
        cover: parsedInput.cover ?? null,
        createdAt: parsedInput.createdAt,
        description: parsedInput.description,
        image: parsedInput.image ?? null,
        series: parsedInput.series ?? null,
        seriesName: parsedInput.seriesName ?? null,
        seriesOrder: parsedInput.seriesOrder ?? null,
        tags: parsedInput.tags,
        title: parsedInput.title,
        updatedAt: parsedInput.updatedAt,
      },
    });

    // rien à faire si le fichier est déjà exactement celui-là : un commit vide
    // encombrerait l'historique et déclencherait un build pour rien
    if (existing?.content === content) {
      return {
        changed: false,
        path,
        publicPath: contentPublicPath(location),
      };
    }

    const commit = await commitFile({
      content,
      message: `contenu : ${parsedInput.category}/${parsedInput.slug} (${parsedInput.locale}) depuis l'administration`,
      path,
      sha: parsedInput.sha ?? existing?.sha,
    });

    /**
     * Le cache local est purgé, mais la page publique ne changera qu'après le
     * redéploiement : les MDX sont lus au BUILD. On le dit à l'appelant plutôt
     * que de laisser croire à une mise à jour immédiate.
     */
    revalidatePath("/admin");

    return {
      author: session.githubLogin,
      changed: true,
      commitUrl: commit.url,
      path,
      publicPath: contentPublicPath(location),
    };
  });
