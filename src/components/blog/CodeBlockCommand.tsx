'use client';

import type { ReactNode } from 'react';
import { CopyButton } from '@/components/primitives/Button';
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from '@/components/primitives/Tabs';
import { Bun } from '@/components/svgs/bun';
import { Npm } from '@/components/svgs/npm';
import { Pnpm } from '@/components/svgs/pnpm';
import { Yarn } from '@/components/svgs/yarn';
import type { PackageManager } from '@/hooks/useConfig';
import useConfig from '@/hooks/useConfig';

const PACKAGE_MANAGERS: PackageManager[] = ['npm', 'pnpm', 'yarn', 'bun'];

const PACKAGE_MANAGER_ICONS: Record<PackageManager, ReactNode> = {
	npm: <Npm />,
	pnpm: <Pnpm />,
	yarn: <Yarn />,
	bun: <Bun />,
};

interface CodeBlockCommandProps {
	__npm__?: string;
	__pnpm__?: string;
	__yarn__?: string;
	__bun__?: string;
}

export const CodeBlockCommand = (props: CodeBlockCommandProps) => {
	const [config, setConfig] = useConfig();
	const { packageManager } = config;

	const commands: Record<PackageManager, string | undefined> = {
		npm: props.__npm__,
		pnpm: props.__pnpm__,
		yarn: props.__yarn__,
		bun: props.__bun__,
	};

	return (
		<div className="relative mt-6 overflow-hidden">
			<Tabs
				onValueChange={(value) =>
					setConfig((prev) => ({
						...prev,
						packageManager: value as PackageManager,
					}))
				}
				value={packageManager}
			>
				<div className="flex w-full items-center justify-between">
					<div className="flex items-center gap-x-3 [&_svg]:size-5">
						{PACKAGE_MANAGER_ICONS[packageManager]}
						<TabsList>
							{PACKAGE_MANAGERS.map((key) => (
								<TabsTrigger key={key} value={key}>
									{key}
								</TabsTrigger>
							))}
						</TabsList>
					</div>
					<CopyButton value={commands[packageManager] ?? ''} variant="ghost" />
				</div>
				<div className="rounded-b-md border border-input">
					{PACKAGE_MANAGERS.map((key) => (
						<TabsContent key={key} value={key}>
							<pre>
								<code data-language="bash" data-slot="code-block">
									{commands[key]}
								</code>
							</pre>
						</TabsContent>
					))}
				</div>
			</Tabs>
		</div>
	);
};
