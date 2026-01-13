import { ArrowElbowDownLeftIcon } from '@phosphor-icons/react';
import { useCommandState } from 'cmdk';
import type React from 'react';
import { useMemo } from 'react';
import { DOCUMENTS_LINKS, MAIN_LINKS } from '@/components/navigation/command/content';
import { Kbd } from '@/components/ui/Kbd';
import { Separator } from '@/components/ui/Separator';

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

	for (const post of posts) {
		commandMetaMap.set(post.metadata.title, {
			commandKind: post.metadata.category as CommandKind,
		});
	}

	return commandMetaMap;
};

interface CommandFooterProps {
	posts: Post[];
}

export const CommandFooter = ({ posts }: CommandFooterProps): React.JSX.Element => {
	const commandMetaMap = useMemo(() => buildCommandMetaMap(posts), [posts]);

	const selectedCommandKind = useCommandState((state) => commandMetaMap.get(state.value)?.commandKind ?? 'page');

	return (
		<>
			<div className="flex h-10" />

			<div className="absolute inset-x-0 bottom-0 flex h-10 shrink-0 items-center justify-end gap-2 border-t bg-zinc-100/30 px-4 font-medium text-xs dark:bg-zinc-800/30">
				<span>{ENTER_ACTION_LABELS[selectedCommandKind]}</span>
				<Kbd>
					<ArrowElbowDownLeftIcon className="size-3" />
				</Kbd>
				<Separator className="data-[orientation=vertical]:h-4" orientation="vertical" />
				<span>Fermer</span>
				<Kbd className="font-medium text-destructive text-xs">esc</Kbd>
			</div>
		</>
	);
};
