import { BookIcon } from '@/components/icons/BookIcon';
import { CodeIcon } from '@/components/icons/CodeIcon';
import { CogIcon } from '@/components/icons/CogIcon';
import { CpuIcon } from '@/components/icons/CpuIcon';
import { FileIcon } from '@/components/icons/FileIcon';
import { FlaskIcon } from '@/components/icons/FlaskIcon';
import { HomeIcon } from '@/components/icons/HomeIcon';
import { IdCardIcon } from '@/components/icons/IdCardIcon';
import { LayersIcon } from '@/components/icons/LayersIcon';
import { UserIcon } from '@/components/icons/UserIcon';
import { USER } from '@/lib/user';

export const MENU_LINKS: CommandLinkItem[] = [
	{ title: "Retourner à l'accueil", url: '/', icon: HomeIcon },
	{ title: 'Mes articles de blog', url: '/blog', icon: BookIcon },
	{ title: 'Composants réutilisables', url: '/components', icon: CodeIcon },
	{ title: 'Outils pour développeurs', url: '/utils', icon: CogIcon },
];

export const MAIN_LINKS: CommandLinkItem[] = [
	{ title: 'À propos de moi', url: '/#about', icon: UserIcon },
	{ title: 'Ma stack technique', url: '/#stack', icon: LayersIcon },
	{ title: 'Mes expériences', url: '/#experience', icon: FlaskIcon },
	{ title: 'Mes projets', url: '/#projects', icon: CpuIcon },
];

export const DOCUMENTS_LINKS: CommandLinkItem[] = [
	{ title: 'Ma carte de visite', url: '/api/vcard', icon: IdCardIcon },
	{ title: 'Télécharger mon CV', url: USER.documents.cv.url, icon: FileIcon },
];
