import { readFileSync } from "node:fs";
import { extname, join } from "node:path";

import { u } from "unist-builder";
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

const resolveSourceFilePath = (
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

const buildCodeElement = (
  source: string,
  language: string,
  meta?: string
) =>
  u("element", {
    children: [
      u("element", {
        children: [{ type: "text", value: source }],
        data: { meta: meta ?? "" },
        properties: { className: [`language-${language}`] },
        tagName: "code",
      }),
    ],
    properties: {},
    tagName: "pre",
  });

const handleComponentSource = (node: UnistNode) => {
  const name = getAttributeValue(node, "name");
  const srcPath = getAttributeValue(node, "src");
  const fileName = getAttributeValue(node, "fileName");
  const noCollapsible = getNodeAttribute(node, "noCollapsible");

  if (!(name || srcPath)) {
    return;
  }

  // chemin statiquement scopé à src/ (voir remark-component.ts)
  const filePath = srcPath
    ? join(process.cwd(), "src", srcPath.replace(/^src\//u, ""))
    : resolveSourceFilePath(name ?? "", fileName);

  if (!filePath) {
    return;
  }

  const source = normalizeSource(readFileSync(filePath, "utf-8"));
  const title = getAttributeValue(node, "title");
  const showLineNumbers = getNodeAttribute(node, "showLineNumbers");

  const meta = [
    title ? `title="${title}"` : "",
    showLineNumbers ? "showLineNumbers" : "",
  ]
    .filter(Boolean)
    .join(" ");

  // Pass collapsible as a preserved attribute on the node
  if (noCollapsible) {
    node.attributes = node.attributes?.filter(
      (attr) => attr.name !== "noCollapsible"
    );
    node.attributes?.push({
      name: "collapsible",
      type: "mdxJsxAttribute",
      value: "false",
    });
  }

  node.children?.push(
    buildCodeElement(source, extname(filePath).slice(1), meta)
  );
};

const handleComponentPreview = (node: UnistNode) => {
  const name = getAttributeValue(node, "name");
  if (!name) {
    return;
  }

  const filePath = Index[name]?.files[0]?.path;
  if (!filePath) {
    return;
  }

  const source = normalizeSource(readFileSync(filePath, "utf-8"));
  node.children?.push(
    buildCodeElement(source, "tsx", "showLineNumbers")
  );
};

export const rehypeComponent = () => async (tree: UnistTree) => {
  visit(tree, (node: UnistNode) => {
    try {
      if (node.name === "ComponentSource") {
        handleComponentSource(node);
      } else if (node.name === "ComponentPreview") {
        handleComponentPreview(node);
      }
    } catch (error) {
      logger.error(error);
    }
  });
};
