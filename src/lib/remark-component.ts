import { readFileSync } from "node:fs";
import { extname, join } from "node:path";

import { visit } from "unist-util-visit";

import { Index } from "@/__registry__";

import { logger } from "./logger";
import type { UnistNode, UnistTree } from "./remark-code-import";

const getNodeAttribute = (node: UnistNode, name: string) =>
  node.attributes?.find((attr) => attr.name === name);

const getAttributeValue = (
  node: UnistNode,
  name: string
): string | undefined =>
  getNodeAttribute(node, name)?.value as string | undefined;

const normalizeSource = (source: string): string =>
  source
    .replaceAll("@/registry/", "@/components/")
    .replaceAll("export default", "export");

const resolveFilePath = (
  name: string,
  fileName?: string
): string | undefined => {
  const component = Index[name];
  if (!component) {
    return undefined;
  }

  if (!fileName) {
    return component.files[0]?.path;
  }

  return (
    component.files.find(
      (file: unknown) =>
        typeof file === "string" &&
        (file.endsWith(`${fileName}.tsx`) ||
          file.endsWith(`${fileName}.ts`))
    ) || component.files[0]?.path
  );
};

const replaceNode = (
  parent: UnistNode | undefined,
  index: number | undefined,
  codeBlock: UnistNode
) => {
  if (parent?.children && typeof index === "number") {
    parent.children.splice(index, 1, codeBlock);
  }
};

const handleComponentSource = (
  node: UnistNode,
  parent: UnistNode | undefined,
  index: number | undefined
) => {
  const name = getAttributeValue(node, "name");
  const srcPath = getAttributeValue(node, "src");
  const fileName = getAttributeValue(node, "fileName");

  // chemin statiquement scopé à src/ pour éviter que l'analyse NFT de
  // Turbopack ne trace tout le projet (warning "unexpected file in NFT list")
  let filePath: string | undefined;
  if (srcPath) {
    filePath = join(
      process.cwd(),
      "src",
      srcPath.replace(/^src\//u, "")
    );
  } else if (name) {
    filePath = resolveFilePath(name, fileName);
  }

  if (!filePath) {
    return;
  }

  const source = normalizeSource(readFileSync(filePath, "utf-8"));
  const title = getAttributeValue(node, "title");
  const showLineNumbers = getNodeAttribute(node, "showLineNumbers");

  replaceNode(parent, index, {
    lang: extname(filePath).slice(1),
    meta: [
      title ? `title="${title}"` : "",
      showLineNumbers ? "showLineNumbers" : "",
    ]
      .filter(Boolean)
      .join(" "),
    type: "code",
    value: source,
  } as UnistNode);
};

const handleComponentPreview = (
  node: UnistNode,
  parent: UnistNode | undefined,
  index: number | undefined
) => {
  const name = getAttributeValue(node, "name");
  if (!name) {
    return;
  }

  const filePath = Index[name]?.files[0]?.path;
  if (!filePath) {
    return;
  }

  const source = normalizeSource(readFileSync(filePath, "utf-8"));

  replaceNode(parent, index, {
    lang: "tsx",
    type: "code",
    value: source,
  } as UnistNode);
};

export const remarkComponent = () => async (tree: UnistTree) => {
  visit(tree, (node: UnistNode, index, parent) => {
    try {
      if (node.name === "ComponentSource") {
        handleComponentSource(node, parent, index);
      } else if (node.name === "ComponentPreview") {
        handleComponentPreview(node, parent, index);
      }
    } catch (error) {
      // tslog 5 exige une chaîne en premier argument : l'erreur passe en
      // argument supplémentaire, ce qui garde sa pile plutôt que de la réduire
      // à un `[object Object]` via une interpolation
      logger.error(
        `injection de composant impossible (${node.name})`,
        error
      );
    }
  });
};
