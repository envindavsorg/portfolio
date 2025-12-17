import { ArrowElbowDownLeftIcon } from '@phosphor-icons/react';
import { useCommandState } from 'cmdk';
import type React from 'react';
import { useMemo } from 'react';
import { CuzeacFlorinMark } from '@/components/assets/CuzeacFlorinMark';
import { Separator } from '@/components/ui/Separator';
import { CommandMenuKbd } from './CommandMenuTrigger';
import {
	DOCUMENTS_LINKS,
	MAIN_LINKS,
	SOCIAL_LINK_ITEMS,
	THEME_OPTIONS,
} from './data/data';
import type { CommandKind, CommandMetaMap } from './types/types';

const ENTER_ACTION_LABELS: Record<CommandKind, string> = {
	command: 'Lancer la commande',
	page: 'Aller à la page',
	link: 'Ouvrir le lien',
	utils: "Ouvrir l'outil",
	article: "Lire l'article",
	components: 'Voir le composant',
	section: 'Aller à la section',
	download: 'Télécharger le fichier',
};

const buildCommandMetaMap = (posts: Post[]): CommandMetaMap => {
	const commandMetaMap: CommandMetaMap = new Map();

	for (const item of DOCUMENTS_LINKS) {
		commandMetaMap.set(item.title, {
			commandKind: 'download',
		});
	}

	for (const item of MAIN_LINKS) {
		commandMetaMap.set(item.title, {
			commandKind: 'section',
		});
	}

	for (const item of SOCIAL_LINK_ITEMS) {
		commandMetaMap.set(item.title, {
			commandKind: 'link',
		});
	}

	for (const post of posts) {
		commandMetaMap.set(post.metadata.title, {
			commandKind: post.metadata.category as CommandKind,
		});
	}

	for (const item of THEME_OPTIONS) {
		commandMetaMap.set(item.label, {
			commandKind: 'command',
		});
	}

	return commandMetaMap;
};

type CommandMenuFooterProps = {
	posts: Post[];
};

export const CommandMenuFooter = ({
	posts,
}: CommandMenuFooterProps): React.JSX.Element => {
	const commandMetaMap = useMemo(() => buildCommandMetaMap(posts), [posts]);

	const selectedCommandKind = useCommandState(
		(state) => commandMetaMap.get(state.value)?.commandKind ?? 'page',
	);

	return (
		<>
			<div className="flex h-10" />

			<div className="absolute inset-x-0 bottom-0 flex h-10 items-center justify-between gap-2 border-t bg-zinc-100/30 px-4 font-medium text-xs dark:bg-zinc-800/30">
				<CuzeacFlorinMark height={16} width={29} />

				<div className="flex shrink-0 items-center gap-2">
					<span>{ENTER_ACTION_LABELS[selectedCommandKind]}</span>
					<CommandMenuKbd>
						<ArrowElbowDownLeftIcon className="size-3" />
					</CommandMenuKbd>
					<Separator
						className="data-[orientation=vertical]:h-4"
						orientation="vertical"
					/>
					<span>Fermer</span>
					<CommandMenuKbd className="font-medium text-destructive text-xs">
						esc
					</CommandMenuKbd>
				</div>
			</div>
		</>
	);
};
