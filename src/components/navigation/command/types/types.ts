import type { StaticImageData } from 'next/image';
import type React from 'react';

export type CommandLinkItem = {
	title: string;
	href: string;
	icon?: React.ElementType;
	iconImage?: StaticImageData;
	keywords?: string[];
	openInNewTab?: boolean;
};

export type CommandKind =
	| 'command'
	| 'page'
	| 'link'
	| 'utils'
	| 'article'
	| 'components'
	| 'section'
	| 'download';

export type CommandMetaMap = Map<string, { commandKind: CommandKind }>;
