'use client';

import { type ComponentType, lazy, Suspense } from 'react';
import { logger } from '@/lib/logger';
import { cn } from '@/lib/utils';

type IconProps = {
	className?: string;
	'aria-hidden'?: boolean;
};

const icons: Record<
	string,
	() => Promise<{ default: ComponentType<IconProps> }>
> = {
	bash: () =>
		import('./content/Bash').then((mod) => ({ default: mod.BashIcon })),
	bun: () => import('./content/Bun').then((mod) => ({ default: mod.BunIcon })),
	css: () => import('./content/CSS').then((mod) => ({ default: mod.CSSIcon })),
	express: () =>
		import('./content/Express').then((mod) => ({
			default: mod.ExpressIcon,
		})),
	fastify: () =>
		import('./content/Fastify').then((mod) => ({
			default: mod.FastifyIcon,
		})),
	figma: () =>
		import('./content/Figma').then((mod) => ({ default: mod.FigmaIcon })),
	flask: () =>
		import('./content/Flask').then((mod) => ({ default: mod.FlaskIcon })),
	motion: () =>
		import('./content/Motion').then((mod) => ({
			default: mod.MotionIcon,
		})),
	git: () => import('./content/Git').then((mod) => ({ default: mod.GitIcon })),
	github: () =>
		import('./content/GitHub').then((mod) => ({ default: mod.GitHubIcon })),
	html: () =>
		import('./content/HTML').then((mod) => ({ default: mod.HTML5Icon })),
	javascript: () =>
		import('./content/JavaScript').then((mod) => ({
			default: mod.JavaScriptIcon,
		})),
	js: () =>
		import('./content/JavaScript').then((mod) => ({
			default: mod.JavaScriptIcon,
		})),
	json: () =>
		import('./content/JSON').then((mod) => ({ default: mod.JSONIcon })),
	markdown: () =>
		import('./content/Markdown').then((mod) => ({
			default: mod.MarkdownIcon,
		})),
	mongodb: () =>
		import('./content/MongoDB').then((mod) => ({
			default: mod.MongoDBIcon,
		})),
	mysql: () =>
		import('./content/MySQL').then((mod) => ({ default: mod.MySQLIcon })),
	next: () =>
		import('./content/Next').then((mod) => ({ default: mod.NextJSIcon })),
	node: () =>
		import('./content/Node').then((mod) => ({ default: mod.NodejsIcon })),
	npm: () => import('./content/NPM').then((mod) => ({ default: mod.NPMIcon })),
	pnpm: () =>
		import('./content/PNPM').then((mod) => ({ default: mod.PNPMIcon })),
	postgre: () =>
		import('./content/Postgre').then((mod) => ({
			default: mod.PostgreIcon,
		})),
	pug: () => import('./content/Pug').then((mod) => ({ default: mod.PugIcon })),
	python: () =>
		import('./content/Python').then((mod) => ({ default: mod.PythonIcon })),
	react: () =>
		import('./content/React').then((mod) => ({ default: mod.ReactIcon })),
	sass: () =>
		import('./content/Sass').then((mod) => ({ default: mod.SassIcon })),
	shadcn: () =>
		import('./content/Shadcn').then((mod) => ({ default: mod.ShadcnIcon })),
	shell: () =>
		import('./content/Shell').then((mod) => ({ default: mod.ShellIcon })),
	storybook: () =>
		import('./content/Storybook').then((mod) => ({
			default: mod.StorybookIcon,
		})),
	tailwind: () =>
		import('./content/Tailwind').then((mod) => ({
			default: mod.TailwindIcon,
		})),
	typescript: () =>
		import('./content/TypeScript').then((mod) => ({
			default: mod.TypeScriptIcon,
		})),
	ts: () =>
		import('./content/TypeScript').then((mod) => ({
			default: mod.TypeScriptIcon,
		})),
	v0: () => import('./content/V0').then((mod) => ({ default: mod.V0Icon })),
	vue: () => import('./content/Vue').then((mod) => ({ default: mod.VueIcon })),
	vuetify: () =>
		import('./content/Vuetify').then((mod) => ({
			default: mod.VuetifyIcon,
		})),
};

interface IconSkeletonProps extends IconProps {
	className?: string;
}

const IconSkeleton = ({ className }: IconSkeletonProps) => (
	<span
		className={cn(
			'inline-block animate-pulse rounded bg-neutral-200 dark:bg-neutral-700',
			className
		)}
	/>
);

interface DynamicIconProps extends IconProps {
	name: string;
}

export const DynamicIcon = ({
	name,
	className,
	...props
}: DynamicIconProps) => {
	const iconKey = name.toLowerCase().replace(/\s+/g, '');
	const iconLoader = icons[iconKey];

	if (!iconLoader) {
		logger.warn(`Icon "${name}" not found in icon components`);
		return <IconSkeleton className={className} />;
	}

	const LazyIcon = lazy(iconLoader);

	return (
		<Suspense fallback={<IconSkeleton className={className} />}>
			<LazyIcon className={className} {...props} />
		</Suspense>
	);
};

export const availableIcons = Object.keys(icons);
