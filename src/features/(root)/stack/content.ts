import type React from 'react';

import { BunIcon } from '@/components/stack/Bun';
import { CSSIcon } from '@/components/stack/CSS';
import { ExpressIcon } from '@/components/stack/Express';
import { FastifyIcon } from '@/components/stack/Fastify';
import { FigmaIcon } from '@/components/stack/Figma';
import { GitIcon } from '@/components/stack/Git';
import { HTML5Icon } from '@/components/stack/HTML';
import { JavaScriptIcon } from '@/components/stack/JavaScript';
import { MarkdownIcon } from '@/components/stack/Markdown';
import { MongoDBIcon } from '@/components/stack/MongoDB';
import { MotionIcon } from '@/components/stack/Motion';
import { NextJSIcon } from '@/components/stack/Next';
import { NodejsIcon } from '@/components/stack/Node';
import { NPMIcon } from '@/components/stack/NPM';
import { PNPMIcon } from '@/components/stack/PNPM';
import { PostgreIcon } from '@/components/stack/Postgre';
import { PugIcon } from '@/components/stack/Pug';
import { ReactIcon } from '@/components/stack/React';
import { SassIcon } from '@/components/stack/Sass';
import { TailwindIcon } from '@/components/stack/Tailwind';
import { TypeScriptIcon } from '@/components/stack/TypeScript';
import { VueIcon } from '@/components/stack/Vue';

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
