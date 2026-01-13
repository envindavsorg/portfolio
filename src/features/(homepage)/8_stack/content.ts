import type React from 'react';
import { lazy } from 'react';

export interface Stack {
	icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
	title: string;
}

const BunIcon = lazy(() =>
	import('@/components/icons/stack/Bun').then((m) => ({
		default: m.BunIcon,
	}))
);
const CSSIcon = lazy(() =>
	import('@/components/icons/stack/CSS').then((m) => ({
		default: m.CSSIcon,
	}))
);
const ExpressIcon = lazy(() =>
	import('@/components/icons/stack/Express').then((m) => ({
		default: m.ExpressIcon,
	}))
);
const FastifyIcon = lazy(() =>
	import('@/components/icons/stack/Fastify').then((m) => ({
		default: m.FastifyIcon,
	}))
);
const FigmaIcon = lazy(() =>
	import('@/components/icons/stack/Figma').then((m) => ({
		default: m.FigmaIcon,
	}))
);
const MotionIcon = lazy(() =>
	import('@/components/icons/stack/Motion').then((m) => ({
		default: m.MotionIcon,
	}))
);
const GitIcon = lazy(() =>
	import('@/components/icons/stack/Git').then((m) => ({
		default: m.GitIcon,
	}))
);
const HTML5Icon = lazy(() =>
	import('@/components/icons/stack/HTML').then((m) => ({
		default: m.HTML5Icon,
	}))
);
const JavaScriptIcon = lazy(() =>
	import('@/components/icons/stack/JavaScript').then((m) => ({
		default: m.JavaScriptIcon,
	}))
);
const MarkdownIcon = lazy(() =>
	import('@/components/icons/stack/Markdown').then((m) => ({
		default: m.MarkdownIcon,
	}))
);
const MongoDBIcon = lazy(() =>
	import('@/components/icons/stack/MongoDB').then((m) => ({
		default: m.MongoDBIcon,
	}))
);
const NextJSIcon = lazy(() =>
	import('@/components/icons/stack/Next').then((m) => ({
		default: m.NextJSIcon,
	}))
);
const NodejsIcon = lazy(() =>
	import('@/components/icons/stack/Node').then((m) => ({
		default: m.NodejsIcon,
	}))
);
const NPMIcon = lazy(() =>
	import('@/components/icons/stack/NPM').then((m) => ({
		default: m.NPMIcon,
	}))
);
const PNPMIcon = lazy(() =>
	import('@/components/icons/stack/PNPM').then((m) => ({
		default: m.PNPMIcon,
	}))
);
const PostgreIcon = lazy(() =>
	import('@/components/icons/stack/Postgre').then((m) => ({
		default: m.PostgreIcon,
	}))
);
const PugIcon = lazy(() =>
	import('@/components/icons/stack/Pug').then((m) => ({
		default: m.PugIcon,
	}))
);
const ReactIcon = lazy(() =>
	import('@/components/icons/stack/React').then((m) => ({
		default: m.ReactIcon,
	}))
);
const SassIcon = lazy(() =>
	import('@/components/icons/stack/Sass').then((m) => ({
		default: m.SassIcon,
	}))
);
const TailwindIcon = lazy(() =>
	import('@/components/icons/stack/Tailwind').then((m) => ({
		default: m.TailwindIcon,
	}))
);
const TypeScriptIcon = lazy(() =>
	import('@/components/icons/stack/TypeScript').then((m) => ({
		default: m.TypeScriptIcon,
	}))
);
const VueIcon = lazy(() =>
	import('@/components/icons/stack/Vue').then((m) => ({
		default: m.VueIcon,
	}))
);

export const TECH_STACK: Stack[] = [
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
