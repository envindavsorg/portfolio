import type React from "react";

import { BunIcon } from "@/components/svgs/stack/Bun";
import { CSSIcon } from "@/components/svgs/stack/CSS";
import { ExpressIcon } from "@/components/svgs/stack/Express";
import { FastifyIcon } from "@/components/svgs/stack/Fastify";
import { FigmaIcon } from "@/components/svgs/stack/Figma";
import { GitIcon } from "@/components/svgs/stack/Git";
import { HTML5Icon } from "@/components/svgs/stack/HTML";
import { JavaScriptIcon } from "@/components/svgs/stack/JavaScript";
import { MarkdownIcon } from "@/components/svgs/stack/Markdown";
import { MongoDBIcon } from "@/components/svgs/stack/MongoDB";
import { MotionIcon } from "@/components/svgs/stack/Motion";
import { NextJSIcon } from "@/components/svgs/stack/Next";
import { NodejsIcon } from "@/components/svgs/stack/Node";
import { NPMIcon } from "@/components/svgs/stack/NPM";
import { PNPMIcon } from "@/components/svgs/stack/PNPM";
import { PostgreIcon } from "@/components/svgs/stack/Postgre";
import { PugIcon } from "@/components/svgs/stack/Pug";
import { ReactIcon } from "@/components/svgs/stack/React";
import { SassIcon } from "@/components/svgs/stack/Sass";
import { TailwindIcon } from "@/components/svgs/stack/Tailwind";
import { TypeScriptIcon } from "@/components/svgs/stack/TypeScript";
import { VueIcon } from "@/components/svgs/stack/Vue";

export interface Stack {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
}

export const STACK_ICONS: Stack[] = [
  { icon: HTML5Icon, title: "HTML5" },
  { icon: CSSIcon, title: "CSS" },
  { icon: SassIcon, title: "Sass" },
  { icon: JavaScriptIcon, title: "JavaScript" },
  { icon: TypeScriptIcon, title: "TypeScript" },
  { icon: ReactIcon, title: "React" },
  { icon: NextJSIcon, title: "Next.js" },
  { icon: MongoDBIcon, title: "MongoDB" },
  { icon: ExpressIcon, title: "Express" },
  { icon: FastifyIcon, title: "Fastify" },
  { icon: MarkdownIcon, title: "Markdown" },
  { icon: TailwindIcon, title: "Tailwind CSS" },
  { icon: VueIcon, title: "Vue" },
  { icon: PugIcon, title: "Pug" },
  { icon: GitIcon, title: "Git" },
  { icon: NodejsIcon, title: "Node.js" },
  { icon: BunIcon, title: "Bun" },
  { icon: NPMIcon, title: "npm" },
  { icon: PNPMIcon, title: "pnpm" },
  { icon: FigmaIcon, title: "Figma" },
  { icon: MotionIcon, title: "Framer Motion" },
  { icon: PostgreIcon, title: "PostgreSQL" },
];
