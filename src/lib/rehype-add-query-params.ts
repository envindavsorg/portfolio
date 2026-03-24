import { visit } from "unist-util-visit";

import { addQueryParams } from "@/lib/functions";

import type { UnistNode, UnistTree } from "./remark-code-import";

const SKIP_PREFIXES = ["/", "mailto:", "tel:", "#"];

export const rehypeAddQueryParams =
  (params: Record<string, string>) => (tree: UnistTree) => {
    visit(tree, (node: UnistNode) => {
      if (
        node.type !== "element" ||
        node.tagName !== "a" ||
        !node.properties
      ) {
        return;
      }

      const href = node.properties.href as string | undefined;
      if (
        !href ||
        SKIP_PREFIXES.some((prefix) => href.startsWith(prefix))
      ) {
        return;
      }

      node.properties.href = addQueryParams(href, params);
    });
  };
