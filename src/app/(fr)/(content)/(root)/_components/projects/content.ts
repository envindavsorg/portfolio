import type { Message } from "@/lib/i18n";
import { m } from "@/paraglide/messages";

export interface Project {
  id: string;
  name: string;
  type: Message;
  link: string;
  skills: string[];
  title: Message;
  description: Message[];
}

export const PROJECTS: Project[] = [
  {
    description: [
      m.home_proj_tssafepath_desc_1,
      () => "Tree-shakeable",
      m.home_proj_tssafepath_desc_3,
      m.home_proj_tssafepath_desc_4,
      m.home_proj_tssafepath_desc_5,
      m.home_proj_tssafepath_desc_6,
      m.home_proj_tssafepath_desc_7,
      m.home_proj_tssafepath_desc_8,
    ],
    id: "ts-safe-path",
    link: "https://www.npmjs.com/package/ts-safe-path",
    name: "ts-safe-path",
    skills: [
      "Open Source",
      "TypeScript",
      "Node.js",
      "ESM",
      "Vite",
      "Rollup",
      "Vitest",
      "Playwright",
    ],
    title: m.home_proj_tssafepath_title,
    type: m.home_proj_tssafepath_type,
  },
  {
    description: [
      m.home_proj_portfolio_desc_1,
      m.home_proj_portfolio_desc_2,
      m.home_proj_portfolio_desc_3,
      m.home_proj_portfolio_desc_4,
      m.home_proj_portfolio_desc_5,
      m.home_proj_portfolio_desc_6,
      m.home_proj_portfolio_desc_7,
      m.home_proj_portfolio_desc_8,
    ],
    id: "portfolio",
    // le dépôt s'appelle « portfolio » : l'ancienne URL (…/cuzeacflorin.fr)
    // renvoyait un 404 GitHub, sur la fiche du projet ET dans /projects.md
    link: "https://github.com/envindavsorg/portfolio",
    name: "cuzeacflorin.fr",
    // la stack annoncée doit rester vraie : « React 18, Next.js 15, Radix UI »
    // contredisait package.json (19.2, 16.2) et le choix explicite de Base UI,
    // radix ayant justement été retiré parce que son Slot casse l'hydratation
    skills: [
      "Open Source",
      "React 19",
      "Next.js 16",
      "Tailwind CSS v4",
      "Base UI",
      "Motion",
      "shadcn/ui",
      "Component Registry",
      "Vercel",
    ],
    title: m.home_proj_portfolio_title,
    type: m.home_proj_portfolio_type,
  },
];
