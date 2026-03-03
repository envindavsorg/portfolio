import type { ElementType } from 'react';

export type CommandKind = 'command' | 'page' | 'utils' | 'article' | 'components' | 'section' | 'download';

export interface CommandItemProps {
	title: string;
	url: string;
	icon?: ElementType;
	keywords?: string[];
	openInNewTab?: boolean;
	kind?: CommandKind;
}

export interface CommandGroupDef {
	heading: string;
	items: CommandItemProps[];
}
