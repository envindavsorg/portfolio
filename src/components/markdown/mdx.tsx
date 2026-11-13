import { FileIcon } from "@phosphor-icons/react/ssr";
import type { MDXRemoteProps } from "next-mdx-remote/rsc";
import { MDXRemote } from "next-mdx-remote/rsc";
import type React from "react";
import rehypeExternalLinks from "rehype-external-links";
import type { LineElement } from "rehype-pretty-code";
import rehypePretty from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { visit } from "unist-util-visit";

import { CodeBlockCommand } from "@/components/blog/CodeBlockCommand";
import { Callout } from "@/components/markdown/Callout";
import { CopyButton } from "@/components/primitives/Button";
import {
  Code,
  Heading,
  Prose,
} from "@/components/primitives/Typography";
import { rehypeAddQueryParams } from "@/lib/rehype-add-query-params";
import { rehypeComponent } from "@/lib/rehype-component";
import { rehypeNpmCommand } from "@/lib/rehype-npm-command";
import {
  CODE_BLOCK_BACKGROUND,
  rehypeShikiContrast,
} from "@/lib/rehype-shiki-contrast";
import { remarkAlert } from "@/lib/remark-alert";
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

// `ComponentPreview`, `ComponentSource` et `CodeCollapsibleWrapper` ne sont PAS
// ici : seules les pages /components s'en servent, et les déclarer dans cette
// table les faisait télécharger par chaque article. Voir `component-docs.ts`.
const components: MDXRemoteProps["components"] = {
  Callout,
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
  // les titres de SECTION sont désormais des h2 : la couleur de marque et le
  // décalage d'ancre suivent le rôle sémantique, pas le niveau
  h2: (props: React.ComponentProps<"h2">) => (
    <Heading
      as="h2"
      className="scroll-mt-32 text-theme!"
      {...props}
    />
  ),
  h3: (props: React.ComponentProps<"h3">) => (
    <Heading as="h3" className="scroll-mt-32" {...props} />
  ),
  h4: (props: React.ComponentProps<"h4">) => (
    <Heading as="h4" className="scroll-mt-32" {...props} />
  ),
  h5: (props: React.ComponentProps<"h5">) => (
    <Heading as="h5" className="scroll-mt-32" {...props} />
  ),
  h6: (props: React.ComponentProps<"h6">) => (
    <Heading as="h6" className="scroll-mt-32" {...props} />
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
  /**
   * Les cellules d'un tableau MDX reviennent à la ligne.
   *
   * `TableCell` pose `whitespace-nowrap` sur chaque cellule, ce qui convient au
   * tableau de chiffres de /weight. Dans un contenu, la colonne « description »
   * est une phrase : le tableau des props de l'effet Apple mesurait 1109px dans
   * un conteneur de 734px, la phrase coupée net ; à 390px la troisième colonne
   * de /utils/contrast-checker était entièrement hors champ, derrière une barre
   * de défilement presque invisible.
   *
   * La première colonne (le nom) et le code en ligne restent insécables : un
   * `() => void` coupé en deux ne se lit plus. `align-baseline` aligne les
   * premières lignes entre elles quand une cellule en compte plusieurs.
   *
   * Corrigé ici et non dans la primitive, pour ne pas toucher /weight.
   */
  td: ({ className, ...props }: React.ComponentProps<"td">) => (
    <TableCell
      className={cn(
        "whitespace-normal align-baseline first:whitespace-nowrap [&_code]:whitespace-nowrap",
        className
      )}
      {...props}
    />
  ),
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
          /**
           * Une clôture SANS langage (un schéma en ASCII, une expression cron)
           * n'était pas prise en charge du tout : pas de figure, donc le `pre`
           * recevait le fond sombre par défaut du plugin typography — une dalle
           * noire en thème clair — et son `code`, sans `data-language`, était
           * habillé comme du code en ligne, une pastille par ligne. Huit blocs
           * concernés, sur /utils/cron-explainer et /utils/jwt-decoder.
           * `plaintext` les fait passer par le même rendu que les autres, sans
           * rien colorer. Les blocs seulement : le code en ligne reste tel quel.
           */
          defaultLang: { block: "plaintext" },
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
      // APRÈS rehypePretty, qui crée les spans porteurs de --shiki-light /
      // --shiki-dark : c'est là que se corrige la dernière dette de contraste
      [rehypeShikiContrast, { backgrounds: CODE_BLOCK_BACKGROUND }],
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
    // APRÈS remarkGfm, qui produit le blockquote que remarkAlert repose en
    // Callout — remark-gfm ne transforme pas les alertes GitHub lui-même
    remarkPlugins: [remarkGfm, remarkCodeImport, remarkAlert],
  },
};

interface MDXProps {
  code: string;
  isDivider?: boolean;
  /**
   * Composants supplémentaires, ajoutés à la table de base.
   *
   * Les widgets d'outils passent par ici et non par la table partagée : celle-ci
   * est un module unique, donc y déclarer les quatorze widgets faisait
   * référencer les quatorze chunks par CHAQUE page de contenu, y compris les
   * articles. Voir `utils-widgets.ts`.
   */
  components?: MDXRemoteProps["components"];
}

/**
 * Le corps de lecture, distinct des courtes lignes d'introduction `-- … --`
 * qui partagent `Prose`.
 *
 * Mesuré avant : 14px, 106 caractères par ligne à 1440, et 4,83:1 en thème
 * clair. `prose-sm` et la couleur atténuée conviennent à une phrase d'accroche,
 * pas à huit minutes de lecture.
 *
 * - le `!` sur la taille est nécessaire : tailwind-merge ne connaît pas
 *   `prose-sm` et ne peut donc pas l'écarter ;
 * - l'interligne est sans unité (1.7) pour suivre les deux tailles, 15px sur
 *   mobile et 16px au-delà ;
 * - `max-w-[72ch]` ne borne QUE le texte courant (paragraphes, listes,
 *   citations). Code, tableaux et encarts gardent toute la colonne : un bloc de
 *   code raccourci déborderait pour rien ;
 * - h2 et h3 ne différaient que de 2px (20 et 18) et se distinguaient surtout
 *   par la couleur.
 *
 * La couleur du corps vit dans globals.css (`.prose[data-longform]`) : la règle
 * `.prose` y est `!important` dans `@layer base`, une utilité ne la bat pas.
 */
const LONGFORM_CLASSNAME = cn(
  "px-2 text-[15px]! sm:px-4 sm:text-base!",
  "prose-p:my-4 prose-p:max-w-[72ch] prose-p:leading-[1.7]",
  "prose-li:max-w-[72ch] prose-li:leading-[1.7]",
  "prose-blockquote:max-w-[72ch]",
  "prose-h2:mt-12 prose-h2:text-[22px] sm:prose-h2:text-2xl",
  "prose-h3:mt-9 prose-h3:text-lg sm:prose-h3:text-xl"
);

export const Mdx = ({
  code,
  components: extra,
  isDivider = true,
}: MDXProps) => (
  <>
    <Prose className={LONGFORM_CLASSNAME} data-longform>
      <MDXRemote
        components={extra ? { ...components, ...extra } : components}
        options={options}
        source={code}
      />
    </Prose>

    {isDivider && <Divider border={false} />}
  </>
);
