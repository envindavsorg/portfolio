import type { Message } from "@/lib/i18n";
import { m } from "@/paraglide/messages";

/**
 * Ce que j'utilise.
 *
 * ⚠️ RÈGLE DE CETTE PAGE : n'y figure que ce qui est VÉRIFIABLE dans ce dépôt.
 *
 * Un /uses est une page où il est très facile d'écrire ce qui fait bien plutôt
 * que ce qu'on utilise. Les entrées ci-dessous se recoupent toutes avec le
 * `package.json`, les workflows ou les compétences déjà déclarées dans les
 * expériences — un lecteur peut donc les contrôler ligne par ligne.
 *
 * Le groupe « environnement » suit la même règle, et c'est le dépôt qui le
 * remplit : `.zed/settings.json` est VERSIONNÉ (le `/.zed` du `.gitignore` ne
 * couvre pas un fichier déjà suivi), tout comme `.node-version`, `.editorconfig`
 * et `.claude/settings.json`. Chacune de ces entrées se contrôle en ouvrant le
 * fichier correspondant.
 *
 * Ce qui n'y est toujours PAS, et ne peut pas y être sans que le propriétaire du
 * site le renseigne lui-même : le matériel — machine, clavier, écran — et la
 * police de l'éditeur. Aucun fichier n'en parle, et les deviner produirait une
 * page fausse : exactement le défaut que cette page est censée éviter. Un groupe
 * vide n'est de toute façon pas rendu (voir `usesGroups`).
 */

export interface UsesItem {
  name: string;
  link?: string;
}

export interface UsesGroup {
  id: string;
  title: Message;
  note: Message;
  items: UsesItem[];
}

export const USES: UsesGroup[] = [
  {
    id: "site",
    items: [
      {
        link: "https://nextjs.org/",
        name: "Next.js 16 (App Router)",
      },
      { link: "https://react.dev/", name: "React 19" },
      { link: "https://tailwindcss.com/", name: "Tailwind CSS v4" },
      { link: "https://base-ui.com/", name: "Base UI" },
      { link: "https://motion.dev/", name: "Motion" },
      {
        link: "https://inlang.com/m/gerre34r/library-inlang-paraglideJs",
        name: "Paraglide JS",
      },
      { link: "https://mdxjs.com/", name: "MDX" },
      { link: "https://shiki.style/", name: "Shiki" },
      { link: "https://zustand-demo.pmnd.rs/", name: "Zustand" },
      { link: "https://zod.dev/", name: "Zod" },
    ],
    note: m.uses_group_site_note,
    title: m.uses_group_site,
  },
  {
    id: "languages",
    items: [
      { name: "TypeScript" },
      { name: "JavaScript" },
      { name: "CSS" },
      { name: "HTML" },
    ],
    note: m.uses_group_languages_note,
    title: m.uses_group_languages,
  },
  {
    id: "tools",
    items: [
      { link: "https://pnpm.io/", name: "pnpm" },
      { link: "https://biomejs.dev/", name: "Biome" },
      { link: "https://vitest.dev/", name: "Vitest" },
      { link: "https://playwright.dev/", name: "Playwright" },
      { link: "https://www.deque.com/axe/", name: "axe-core" },
      { link: "https://lefthook.dev/", name: "lefthook" },
      { link: "https://knip.dev/", name: "knip" },
      {
        link: "https://github.com/features/actions",
        name: "GitHub Actions",
      },
    ],
    note: m.uses_group_tools_note,
    title: m.uses_group_tools,
  },
  {
    id: "services",
    items: [
      { link: "https://vercel.com/", name: "Vercel" },
      { link: "https://resend.com/", name: "Resend" },
      {
        link: "https://docs.github.com/en/graphql",
        name: "API GraphQL GitHub",
      },
    ],
    note: m.uses_group_services_note,
    title: m.uses_group_services,
  },
  {
    id: "environment",
    items: [
      // `.zed/settings.json` : format à l'enregistrement, Biome en LSP
      { link: "https://zed.dev/", name: "Zed" },
      {
        link: "https://github.com/typescript-language-server/typescript-language-server",
        name: "typescript-language-server",
      },
      // `.node-version`
      { link: "https://nodejs.org/", name: "Node.js 25" },
      // `.editorconfig` : tabulations, LF, UTF-8
      { link: "https://editorconfig.org/", name: "EditorConfig" },
      // `.claude/settings.json` : `pnpm fix` après chaque écriture
      {
        link: "https://claude.com/claude-code",
        name: "Claude Code",
      },
    ],
    note: m.uses_group_environment_note,
    title: m.uses_group_environment,
  },
];

/** les groupes réellement affichables : un groupe vide n'est pas rendu */
export const usesGroups = (groups: UsesGroup[] = USES): UsesGroup[] =>
  groups.filter((group) => group.items.length > 0);
