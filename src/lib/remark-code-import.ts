import { readFileSync } from "node:fs";
import { EOL } from "node:os";
import { isAbsolute, join, relative, resolve, sep } from "node:path";

import stripIndent from "strip-indent";
import { visit } from "unist-util-visit";
import type { VFile } from "vfile";

export interface UnistNode {
  type: string;
  name?: string;
  tagName?: string;
  value?: string;
  meta?: string;
  data?: Record<string, unknown>;
  properties?: {
    __rawString__?: string;
    [key: string]: unknown;
  } & {
    __pnpm__?: string;
    __yarn__?: string;
    __npm__?: string;
    __bun__?: string;
  };
  attributes?: {
    name: string;
    value: unknown;
    type?: string;
  }[];
  children?: UnistNode[];
}

export interface UnistTree {
  type: string;
  children: UnistNode[];
}

interface RemarkCodeImportOptions {
  rootDir?: string;
  preserveTrailingNewline?: boolean;
  removeRedundantIndentations?: boolean;
}

const extractLines = (
  content: string,
  fromLine: number | undefined,
  hasDash: boolean,
  toLine: number | undefined,
  preserveTrailingNewline = false
): string => {
  const lines = content.split(EOL);
  const start = fromLine ?? 1;

  let end: number;
  if (hasDash) {
    if (toLine) {
      end = toLine;
    } else if (lines.at(-1) === "" && !preserveTrailingNewline) {
      end = lines.length - 1;
    } else {
      end = lines.length;
    }
  } else {
    end = start;
  }

  return lines.slice(start - 1, end).join("\n");
};

const FILE_META_REGEX =
  /^file=(?<path>.+?)(?:(?:#(?:L(?<from>\d+)(?<dash>-)?)?)(?:L(?<to>\d+))?)?$/u;

export const remarkCodeImport = (
  options: RemarkCodeImportOptions = {}
) => {
  const rootDir = options.rootDir ?? join(process.cwd(), "src");

  if (!isAbsolute(rootDir)) {
    throw new Error('"rootDir" has to be an absolute path');
  }

  return (tree: UnistTree, file: VFile) => {
    const codes: [
      UnistNode,
      number | undefined,
      UnistNode | undefined,
    ][] = [];
    visit(tree, "code", (node: UnistNode, index, parent) => {
      codes.push([node, index, parent]);
    });

    for (const [node] of codes) {
      const fileMeta = (node.meta || "")
        .split(/(?<!\\) /gu)
        .find((meta: string) => meta.startsWith("file="));

      if (!fileMeta) {
        continue;
      }

      const res = FILE_META_REGEX.exec(fileMeta);
      if (!res?.groups?.path) {
        throw new Error(`Unable to parse file path ${fileMeta}`);
      }

      const fromLine = res.groups.from
        ? Number.parseInt(res.groups.from, 10)
        : undefined;
      const hasDash = !!res.groups.dash || fromLine === undefined;
      const toLine = res.groups.to
        ? Number.parseInt(res.groups.to, 10)
        : undefined;

      const dirname = file.dirname ?? file.cwd;
      const normalizedFilePath = res.groups.path
        .replace(/^@/u, rootDir)
        .replaceAll("\\ ", " ");
      const fileAbsPath = resolve(dirname, normalizedFilePath);
      const relativePath = relative(rootDir, fileAbsPath);

      if (
        relativePath.startsWith(`..${sep}`) ||
        isAbsolute(relativePath)
      ) {
        throw new Error(
          `Attempted to import code from "${fileAbsPath}", which is outside from the rootDir "${rootDir}"`
        );
      }

      let value = extractLines(
        readFileSync(fileAbsPath, "utf-8"),
        fromLine,
        hasDash,
        toLine,
        options.preserveTrailingNewline
      );

      if (options.removeRedundantIndentations) {
        value = stripIndent(value);
      }

      node.value = value;
    }
  };
};
