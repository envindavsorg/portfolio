import { Book } from '@/components/motion/Book';
import { Code } from '@/components/motion/Code';
import { Cog } from '@/components/motion/Cog';
import { File } from '@/components/motion/File';
import { Flask } from '@/components/motion/Flask';
import { Home } from '@/components/motion/Home';
import { IdCard } from '@/components/motion/IdCard';
import { Keyboard } from '@/components/motion/Keyboard';
import { Layers } from '@/components/motion/Layers';
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
				icon: Code,
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
				icon: Layers,
				kind: 'section',
			},
			{
				title: 'mes expériences',
				url: '/#my-experiences',
				icon: Flask,
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
				icon: IdCard,
				kind: 'download',
			},
			{
				title: 'télécharger mon CV',
				url: GLOBAL_DATA.CV.url,
				icon: File,
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
