import type React from 'react';

import { BunIcon } from '@/components/icons/stack/Bun';
import { CSSIcon } from '@/components/icons/stack/CSS';
import { ExpressIcon } from '@/components/icons/stack/Express';
import { FastifyIcon } from '@/components/icons/stack/Fastify';
import { FigmaIcon } from '@/components/icons/stack/Figma';
import { GitIcon } from '@/components/icons/stack/Git';
import { HTML5Icon } from '@/components/icons/stack/HTML';
import { JavaScriptIcon } from '@/components/icons/stack/JavaScript';
import { MarkdownIcon } from '@/components/icons/stack/Markdown';
import { MongoDBIcon } from '@/components/icons/stack/MongoDB';
import { MotionIcon } from '@/components/icons/stack/Motion';
import { NextJSIcon } from '@/components/icons/stack/Next';
import { NodejsIcon } from '@/components/icons/stack/Node';
import { NPMIcon } from '@/components/icons/stack/NPM';
import { PNPMIcon } from '@/components/icons/stack/PNPM';
import { PostgreIcon } from '@/components/icons/stack/Postgre';
import { PugIcon } from '@/components/icons/stack/Pug';
import { ReactIcon } from '@/components/icons/stack/React';
import { SassIcon } from '@/components/icons/stack/Sass';
import { TailwindIcon } from '@/components/icons/stack/Tailwind';
import { TypeScriptIcon } from '@/components/icons/stack/TypeScript';
import { VueIcon } from '@/components/icons/stack/Vue';

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
