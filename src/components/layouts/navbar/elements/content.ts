import { CodeIcon } from '@/components/icons/CodeIcon';
import { FileIcon } from '@/components/icons/FileIcon';
import { FlaskIcon } from '@/components/icons/FlaskIcon';
import { IdCardIcon } from '@/components/icons/IdCardIcon';
import { LayersIcon } from '@/components/icons/LayersIcon';
import { Book } from '@/components/motion/Book';
import { Cog } from '@/components/motion/Cog';
import { Home } from '@/components/motion/Home';
import { Keyboard } from '@/components/motion/Keyboard';
import { User } from '@/components/motion/User';
import GLOBAL_DATA from '@/data/global';
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
				icon: Home,
				kind: 'page',
			},
			{
				title: 'mes articles de blog',
				url: '/articles',
				icon: Book,
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
				icon: Cog,
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
				icon: User,
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
				icon: Keyboard,
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
