import type React from 'react';

import { BunIcon } from '@/components/blocks/icons/stack/Bun';
import { CSSIcon } from '@/components/blocks/icons/stack/CSS';
import { ExpressIcon } from '@/components/blocks/icons/stack/Express';
import { FastifyIcon } from '@/components/blocks/icons/stack/Fastify';
import { FigmaIcon } from '@/components/blocks/icons/stack/Figma';
import { GitIcon } from '@/components/blocks/icons/stack/Git';
import { HTML5Icon } from '@/components/blocks/icons/stack/HTML';
import { JavaScriptIcon } from '@/components/blocks/icons/stack/JavaScript';
import { MarkdownIcon } from '@/components/blocks/icons/stack/Markdown';
import { MongoDBIcon } from '@/components/blocks/icons/stack/MongoDB';
import { MotionIcon } from '@/components/blocks/icons/stack/Motion';
import { NextJSIcon } from '@/components/blocks/icons/stack/Next';
import { NodejsIcon } from '@/components/blocks/icons/stack/Node';
import { NPMIcon } from '@/components/blocks/icons/stack/NPM';
import { PNPMIcon } from '@/components/blocks/icons/stack/PNPM';
import { PostgreIcon } from '@/components/blocks/icons/stack/Postgre';
import { PugIcon } from '@/components/blocks/icons/stack/Pug';
import { ReactIcon } from '@/components/blocks/icons/stack/React';
import { SassIcon } from '@/components/blocks/icons/stack/Sass';
import { TailwindIcon } from '@/components/blocks/icons/stack/Tailwind';
import { TypeScriptIcon } from '@/components/blocks/icons/stack/TypeScript';
import { VueIcon } from '@/components/blocks/icons/stack/Vue';

export interface Stack {
	icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
	title: string;
}

export const STACK_ICONS: Stack[] = [
	{ icon: HTML5Icon, title: 'HTML5' },
	{ icon: CSSIcon, title: 'CSS' },
	{ icon: SassIcon, title: 'Sass' },
	{ icon: JavaScriptIcon, title: 'JavaScript' },
	{ icon: TypeScriptIcon, title: 'TypeScript' },
	{ icon: ReactIcon, title: 'React' },
	{ icon: NextJSIcon, title: 'Next.js' },
	{ icon: MongoDBIcon, title: 'MongoDB' },
	{ icon: ExpressIcon, title: 'Express' },
	{ icon: FastifyIcon, title: 'Fastify' },
	{ icon: MarkdownIcon, title: 'Markdown' },
	{ icon: TailwindIcon, title: 'Tailwind CSS' },
	{ icon: VueIcon, title: 'Vue' },
	{ icon: PugIcon, title: 'Pug' },
	{ icon: GitIcon, title: 'Git' },
	{ icon: NodejsIcon, title: 'Node.js' },
	{ icon: BunIcon, title: 'Bun' },
	{ icon: NPMIcon, title: 'npm' },
	{ icon: PNPMIcon, title: 'pnpm' },
	{ icon: FigmaIcon, title: 'Figma' },
	{ icon: MotionIcon, title: 'Framer Motion' },
	{ icon: PostgreIcon, title: 'PostgreSQL' },
];
