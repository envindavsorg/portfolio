'use client';

import { TerminalWindowIcon } from '@phosphor-icons/react';
import type React from 'react';
import { lazy, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import type { PackageManager } from '@/hooks/use-config';
import useConfig from '@/hooks/use-config';
import { CopyButton } from './CopyButton';

const PNPMIcon = lazy(() =>
	import('@/components/icons/content/PNPM').then((m) => ({
		default: m.PNPMIcon,
	}))
);

const YarnIcon = lazy(() =>
	import('@/components/icons/content/Yarn').then((m) => ({
		default: m.YarnIcon,
	}))
);

const NPMIcon = lazy(() =>
	import('@/components/icons/content/NPM').then((m) => ({
		default: m.NPMIcon,
	}))
);

const BunIcon = lazy(() =>
	import('@/components/icons/content/Bun').then((m) => ({
		default: m.BunIcon,
	}))
);

const getIconForPackageManager = (manager: string) => {
	switch (manager) {
		case 'pnpm':
			return <PNPMIcon />;
		case 'yarn':
			return <YarnIcon />;
		case 'npm':
			return <NPMIcon />;
		case 'bun':
			return <BunIcon />;
		default:
			return <TerminalWindowIcon />;
	}
};

export const CodeBlockCommand = ({
	__pnpm__,
	__yarn__,
	__npm__,
	__bun__,
}: {
	__pnpm__?: string;
	__yarn__?: string;
	__npm__?: string;
	__bun__?: string;
}): React.JSX.Element => {
	const [config, setConfig] = useConfig();

	const packageManager = config.packageManager || 'pnpm';

	const tabs = useMemo(
		() => ({
			pnpm: __pnpm__,
			yarn: __yarn__,
			npm: __npm__,
			bun: __bun__,
		}),
		[__pnpm__, __yarn__, __npm__, __bun__]
	);

	return (
		<div className="relative overflow-hidden rounded-lg bg-code">
			<Tabs
				className="gap-0"
				onValueChange={(value) => {
					setConfig((prev) => ({
						...prev,
						packageManager: value as PackageManager,
					}));
				}}
				value={packageManager}
			>
				<div className="border-b px-4">
					<TabsList className="h-auto translate-y-px gap-3 rounded-none bg-transparent p-0 dark:bg-transparent [&_svg]:size-4 [&_svg]:text-muted-foreground">
						{getIconForPackageManager(packageManager)}

						{Object.entries(tabs).map(([key]) => (
							<TabsTrigger
								className="h-10 rounded-none border-transparent border-b p-0 font-mono data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none dark:data-[state=active]:inset-shadow-none dark:data-[state=active]:bg-transparent"
								key={key}
								value={key}
							>
								{key}
							</TabsTrigger>
						))}
					</TabsList>
				</div>

				{Object.entries(tabs).map(([key, value]) => (
					<TabsContent key={key} value={key}>
						<pre>
							<code
								className="font-mono text-code-foreground text-sm leading-none"
								data-language="bash"
								data-slot="code-block"
							>
								{value}
							</code>
						</pre>
					</TabsContent>
				))}
			</Tabs>

			<CopyButton
				className="absolute top-2 right-2"
				value={tabs[packageManager] || ''}
			/>
		</div>
	);
};
