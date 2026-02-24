import { BookIcon } from '@/components/blocks/icons/BookIcon';
import { CodeIcon } from '@/components/blocks/icons/CodeIcon';
import { CogIcon } from '@/components/blocks/icons/CogIcon';
import { CpuIcon } from '@/components/blocks/icons/CpuIcon';
import { FileIcon } from '@/components/blocks/icons/FileIcon';
import { FlaskIcon } from '@/components/blocks/icons/FlaskIcon';
import { HomeIcon } from '@/components/blocks/icons/HomeIcon';
import { IdCardIcon } from '@/components/blocks/icons/IdCardIcon';
import { LayersIcon } from '@/components/blocks/icons/LayersIcon';
import { UserIcon } from '@/components/blocks/icons/UserIcon';
import GLOBAL_DATA from '@/content/data/global';
import type { CommandGroupDef, CommandKind } from './types';

export const LABELS: Record<CommandKind, string> = {
	command: 'lancer la commande',
	page: 'aller à la page',
	utils: 'utiliser cet outil',
	article: "lire l'article",
	components: 'voir le composant',
	section: 'aller à la section',
	download: 'télécharger le fichier',
};

export const COMMANDS: CommandGroupDef[] = [
	{
		heading: 'menu principal :',
		items: [
			{
				title: "retourner à l'accueil",
				url: '/',
				icon: HomeIcon,
				kind: 'page',
			},
			{
				title: 'mes articles de blog',
				url: '/articles',
				icon: BookIcon,
				kind: 'page',
			},
			{
				title: 'composants réutilisables',
				url: '/components',
				icon: CodeIcon,
				kind: 'page',
			},
			{
				title: 'outils pour développeurs',
				url: '/utils',
				icon: CogIcon,
				kind: 'page',
			},
		],
	},
	{
		heading: 'contenu de mon portfolio :',
		items: [
			{
				title: 'à propos de moi',
				url: '/#about-me',
				icon: UserIcon,
				kind: 'section',
			},
			{
				title: 'ma stack technique',
				url: '/#my-stack',
				icon: LayersIcon,
				kind: 'section',
			},
			{
				title: 'mes expériences',
				url: '/#my-experiences',
				icon: FlaskIcon,
				kind: 'section',
			},
			{
				title: 'mes projets',
				url: '/#my-projects',
				icon: CpuIcon,
				kind: 'section',
			},
		],
	},
	{
		heading: 'documents à télécharger :',
		items: [
			{
				title: 'ma carte de visite',
				url: '/api/vcard',
				icon: IdCardIcon,
				kind: 'download',
			},
			{
				title: 'télécharger mon CV',
				url: GLOBAL_DATA.CV.url,
				icon: FileIcon,
				kind: 'download',
			},
		],
	},
];

export const CATEGORY: Record<
	string,
	{ route: string; heading: string; kind: CommandKind }
> = {
	article: {
		route: 'blog',
		heading: 'derniers articles de blog :',
		kind: 'article',
	},
	components: {
		route: 'components',
		heading: 'derniers snippets de code :',
		kind: 'components',
	},
	utils: {
		route: 'utils',
		heading: 'derniers outils :',
		kind: 'utils',
	},
};
