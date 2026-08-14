import matter from "gray-matter";
import { notFound } from "next/navigation";

import { ContentEditor } from "@/components/admin/ContentEditor";
import { requireAdminSession } from "@/lib/admin/auth";
import { readFile } from "@/lib/admin/commit";
import { toDay } from "@/lib/admin/frontmatter";
import { contentFilePath, parseLocationKey } from "@/lib/admin/paths";

/**
 * L'éditeur d'un contenu.
 *
 * Le fichier est relu depuis GITHUB, pas depuis le disque local. Deux raisons :
 * le disque de la fonction serverless porte l'état du dernier build, donc
 * potentiellement périmé si un commit a eu lieu depuis ; et c'est la lecture qui
 * fournit le SHA, sans lequel l'écriture ne peut pas détecter une modification
 * concurrente.
 */
const EditorPage = async ({
  params,
}: {
  params: Promise<{ path: string[] }>;
}) => {
  await requireAdminSession();

  const { path: segments } = await params;
  const location = parseLocationKey(segments);

  if (!location) {
    notFound();
  }

  const filePath = contentFilePath(location);

  if (!filePath) {
    notFound();
  }

  const file = await readFile(filePath).catch(() => null);

  // un fichier absent n'est pas une erreur : c'est le cas « créer la traduction »
  const parsed = file ? matter(file.content) : null;
  const data = (parsed?.data ?? {}) as Record<string, unknown>;

  const asString = (value: unknown): string =>
    value === null || value === undefined ? "" : String(value);

  const today = toDay(new Date());

  return (
    <ContentEditor
      initial={{
        author: asString(data.author),
        body: parsed?.content ?? "",
        category: location.category,
        cover: asString(data.cover),
        createdAt: data.createdAt
          ? toDay(data.createdAt as Date | string)
          : today,
        description: asString(data.description),
        image: asString(data.image),
        locale: location.locale,
        series: asString(data.series),
        seriesName: asString(data.seriesName),
        seriesOrder:
          typeof data.seriesOrder === "number"
            ? data.seriesOrder
            : undefined,
        sha: file?.sha,
        slug: location.slug,
        tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
        title: asString(data.title),
        updatedAt: today,
      }}
      isNew={file === null}
    />
  );
};

export default EditorPage;
