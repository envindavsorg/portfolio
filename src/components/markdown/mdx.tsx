import { FileIcon } from "@phosphor-icons/react/ssr";
import type { MDXRemoteProps } from "next-mdx-remote/rsc";
import { MDXRemote } from "next-mdx-remote/rsc";
import dynamic from "next/dynamic";
import type React from "react";
import rehypeExternalLinks from "rehype-external-links";
import type { LineElement } from "rehype-pretty-code";
import rehypePretty from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { visit } from "unist-util-visit";

import { CodeBlockCommand } from "@/components/blog/CodeBlockCommand";
import { CodeCollapsibleWrapper } from "@/components/blog/CodeCollapsibleWrapper";
import { ComponentPreview } from "@/components/blog/ComponentPreview";
import { ComponentSource } from "@/components/blog/ComponentSource";
import { CopyButton } from "@/components/primitives/Button";
import {
  Code,
  Heading,
  Prose,
} from "@/components/primitives/Typography";
import { rehypeAddQueryParams } from "@/lib/rehype-add-query-params";
import { rehypeComponent } from "@/lib/rehype-component";
import { rehypeNpmCommand } from "@/lib/rehype-npm-command";
import { remarkCodeImport } from "@/lib/remark-code-import";
import { cn } from "@/lib/utils";

import { Divider } from "../base/Divider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../primitives/Table";
import { CSSIcon } from "../svgs/stack/CSS";
import { JavaScriptIcon } from "../svgs/stack/JavaScript";
import { JSONIcon } from "../svgs/stack/JSON";
import { ReactIcon } from "../svgs/stack/React";
import { TypeScriptIcon } from "../svgs/stack/TypeScript";

/**
 * Widgets d'outils chargés à la demande.
 *
 * La table de composants MDX est partagée par TOUTES les pages de contenu :
 * en import statique, @cloudflare/speedtest, poline et le générateur de
 * bannière sur canvas atterrissaient dans le bundle de chaque page MDX, même
 * celles qui n'utilisent aucun outil. Chaque widget a désormais son propre
 * chunk, chargé seulement si le contenu l'invoque.
 */
const ArticleBanner = dynamic(async () => {
  const mod =
    await import("@/components/utils/ArticleBannerGenerator");
  return mod.ArticleBanner;
});
const Base64 = dynamic(async () => {
  const mod = await import("@/components/utils/Base64");
  return mod.Base64;
});
const ColorGenerator = dynamic(async () => {
  const mod = await import("@/components/utils/ColorGenerator");
  return mod.ColorGenerator;
});
const CaseConverter = dynamic(async () => {
  const mod = await import("@/components/utils/CaseConverter");
  return mod.CaseConverter;
});
const ContrastChecker = dynamic(async () => {
  const mod = await import("@/components/utils/ContrastChecker");
  return mod.ContrastChecker;
});
const CronExplainer = dynamic(async () => {
  const mod = await import("@/components/utils/CronExplainer");
  return mod.CronExplainer;
});
const DateConverter = dynamic(async () => {
  const mod = await import("@/components/utils/DateConverter");
  return mod.DateConverter;
});
const RegexTester = dynamic(async () => {
  const mod = await import("@/components/utils/RegexTester");
  return mod.RegexTester;
});
const DiffViewer = dynamic(async () => {
  const mod = await import("@/components/utils/DiffViewer");
  return mod.DiffViewer;
});
const HashGenerator = dynamic(async () => {
  const mod = await import("@/components/utils/HashGenerator");
  return mod.HashGenerator;
});
const JSONFormatter = dynamic(async () => {
  const mod = await import("@/components/utils/JSONFormatter");
  return mod.JSONFormatter;
});
const JwtDecoder = dynamic(async () => {
  const mod = await import("@/components/utils/JwtDecoder");
  return mod.JwtDecoder;
});
const LoremIpsumGenerator = dynamic(async () => {
  const mod = await import("@/components/utils/LoremIpsumGenerator");
  return mod.LoremIpsumGenerator;
});
const SpeedTest = dynamic(async () => {
  const mod = await import("@/components/utils/SpeedTest");
  return mod.SpeedTest;
});

const getIconForLanguageExtension = (language: string) => {
  switch (language) {
    case "json": {
      return <JSONIcon />;
    }
    case "css": {
      return <CSSIcon />;
    }
    case "js": {
      return <JavaScriptIcon />;
    }
    case "ts":
    case "typescript": {
      return <TypeScriptIcon />;
    }
    case "jsx":
    case "tsx": {
      return <ReactIcon />;
    }
    default: {
      return <FileIcon />;
    }
  }
};

const components: MDXRemoteProps["components"] = {
  ArticleBannerUtils: ArticleBanner,
  Base64Utils: Base64,
  CaseConverterUtils: CaseConverter,
  CodeCollapsibleWrapper,
  ColorGeneratorUtils: ColorGenerator,
  ComponentPreview,
  ComponentSource,
  ContrastCheckerUtils: ContrastChecker,
  CronExplainerUtils: CronExplainer,
  DateConverterUtils: DateConverter,
  DiffViewerUtils: DiffViewer,
  HashGeneratorUtils: HashGenerator,
  InternetSpeedTestUtils: SpeedTest,
  JSONFormatterUtils: JSONFormatter,
  JwtDecoderUtils: JwtDecoder,
  LoremIpsumGeneratorUtils: LoremIpsumGenerator,
  RegexTesterUtils: RegexTester,
  code: Code,
  figcaption: ({
    children,
    ...props
  }: React.ComponentProps<"figcaption">) => {
    const iconExtension =
      "data-language" in props &&
      typeof props["data-language"] === "string"
        ? getIconForLanguageExtension(props["data-language"])
        : null;

    return (
      <figcaption className="flex items-center gap-x-3" {...props}>
        {iconExtension}
        {children}
      </figcaption>
    );
  },
  figure({ className, ...props }: React.ComponentProps<"figure">) {
    const hasPrettyCode = "data-rehype-pretty-code-figure" in props;

    return (
      <figure
        className={cn(hasPrettyCode && "not-prose", className)}
        {...props}
      />
    );
  },
  h1: (props: React.ComponentProps<"h1">) => (
    <Heading
      as="h1"
      className="scroll-mt-32 text-theme!"
      {...props}
    />
  ),
  h2: (props: React.ComponentProps<"h2">) => (
    <Heading as="h2" className="scroll-mt-32" {...props} />
  ),
  h3: (props: React.ComponentProps<"h3">) => (
    <Heading as="h3" {...props} />
  ),
  h4: (props: React.ComponentProps<"h4">) => (
    <Heading as="h4" {...props} />
  ),
  h5: (props: React.ComponentProps<"h5">) => (
    <Heading as="h5" {...props} />
  ),
  h6: (props: React.ComponentProps<"h6">) => (
    <Heading as="h6" {...props} />
  ),
  pre({
    __withMeta__,
    __rawString__,
    __pnpm__,
    __yarn__,
    __npm__,
    __bun__,
    ...props
  }: React.ComponentProps<"pre"> & {
    __withMeta__?: boolean;
    __rawString__?: string;
  } & {
    __pnpm__?: string;
    __yarn__?: string;
    __npm__?: string;
    __bun__?: string;
  }) {
    const isNpmCommand = __pnpm__ && __yarn__ && __npm__ && __bun__;
    if (isNpmCommand) {
      return (
        <CodeBlockCommand
          __bun__={__bun__}
          __npm__={__npm__}
          __pnpm__={__pnpm__}
          __yarn__={__yarn__}
        />
      );
    }

    return (
      <div className="rounded-md border border-input">
        <pre {...props} />

        {__rawString__ && (
          <CopyButton
            className="absolute top-1 right-0"
            value={__rawString__}
            variant="ghost"
          />
        )}
      </div>
    );
  },
  table: Table,
  tbody: TableBody,
  td: TableCell,
  th: TableHead,
  thead: TableHeader,
  tr: TableRow,
};

const options: MDXRemoteProps["options"] = {
  mdxOptions: {
    rehypePlugins: [
      [
        rehypeExternalLinks,
        { rel: "nofollow noopener noreferrer", target: "_blank" },
      ],
      rehypeSlug,
      rehypeComponent,
      () => (tree) => {
        visit(tree, (node) => {
          if (node?.type === "element" && node?.tagName === "pre") {
            const [codeEl] = node.children;
            if (codeEl.tagName !== "code") {
              return;
            }

            node.__rawString__ = codeEl.children?.[0].value;
          }
        });
      },
      [
        rehypePretty,
        {
          keepBackground: false,
          onVisitLine(node: LineElement) {
            if (node.children.length === 0) {
              node.children = [{ type: "text", value: " " }];
            }
          },
          theme: {
            dark: "github-dark",
            light: "github-light",
          },
        },
      ],
      () => (tree) => {
        visit(tree, (node) => {
          if (
            node?.type === "element" &&
            node?.tagName === "figure"
          ) {
            if (
              !("data-rehype-pretty-code-figure" in node.properties)
            ) {
              return;
            }

            const preElement = node.children.at(-1);
            if (preElement.tagName !== "pre") {
              return;
            }

            preElement.properties.__withMeta__ =
              node.children.at(0).tagName === "figcaption";
            preElement.properties.__rawString__ = node.__rawString__;
          }
        });
      },
      rehypeNpmCommand,
      [rehypeAddQueryParams],
    ],
    remarkPlugins: [remarkGfm, remarkCodeImport],
  },
};

interface MDXProps {
  code: string;
  isDivider?: boolean;
}

export const Mdx = ({ code, isDivider = true }: MDXProps) => (
  <>
    <Prose className="px-2 sm:px-4">
      <MDXRemote
        components={components}
        options={options}
        source={code}
      />
    </Prose>

    {isDivider && <Divider border={false} />}
  </>
);
