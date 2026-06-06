import { m } from "@/paraglide/messages";

export interface Project {
  id: string;
  name: string;
  type: () => string;
  link: string;
  skills: string[];
  title: () => string;
  description: (() => string)[];
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
    link: "https://github.com/envindavsorg/cuzeacflorin.fr",
    name: "cuzeacflorin.fr",
    skills: [
      "Open Source",
      "React 18",
      "Next.js 15",
      "Tailwind CSS v4",
      "Radix UI",
      "Motion",
      "shadcn/ui",
      "Component Registry",
      "Vercel",
    ],
    title: m.home_proj_portfolio_title,
    type: m.home_proj_portfolio_type,
  },
];
