import { visit } from "unist-util-visit";

import type { UnistNode, UnistTree } from "./remark-code-import";

interface CommandMapping {
  prefix: string;
  pnpm: string;
  yarn: string;
  bun: string;
  replace: "all" | "first";
}

const COMMAND_MAPPINGS: CommandMapping[] = [
  {
    bun: "bun add",
    pnpm: "pnpm add",
    prefix: "npm install",
    replace: "all",
    yarn: "yarn add",
  },
  {
    bun: "bunx --bun create-",
    pnpm: "pnpm create ",
    prefix: "npx create-",
    replace: "first",
    yarn: "yarn create ",
  },
  {
    bun: "bun create",
    pnpm: "pnpm create",
    prefix: "npm create",
    replace: "first",
    yarn: "yarn create",
  },
  {
    bun: "bunx --bun",
    pnpm: "pnpm dlx",
    prefix: "npx",
    replace: "first",
    yarn: "npx",
  },
  {
    bun: "bun",
    pnpm: "pnpm",
    prefix: "npm run",
    replace: "first",
    yarn: "yarn",
  },
];

const applyMapping = (command: string, mapping: CommandMapping) => {
  const transform =
    mapping.replace === "all"
      ? (cmd: string, from: string, to: string) =>
          cmd.replaceAll(from, to)
      : (cmd: string, from: string, to: string) =>
          cmd.replace(from, to);

  return {
    __bun__: transform(command, mapping.prefix, mapping.bun),
    __npm__: command,
    __pnpm__: transform(command, mapping.prefix, mapping.pnpm),
    __yarn__: transform(command, mapping.prefix, mapping.yarn),
  };
};

export const rehypeNpmCommand = () => (tree: UnistTree) => {
  visit(tree, (node: UnistNode) => {
    if (
      node.type !== "element" ||
      node.tagName !== "pre" ||
      !node.properties
    ) {
      return;
    }

    const rawString = node.properties.__rawString__ as
      | string
      | undefined;
    if (!rawString) {
      return;
    }

    const mapping = COMMAND_MAPPINGS.find((m) =>
      rawString.startsWith(m.prefix)
    );
    if (!mapping) {
      return;
    }

    Object.assign(node.properties, applyMapping(rawString, mapping));
  });
};
