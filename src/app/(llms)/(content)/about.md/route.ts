import { SOCIAL_LINKS } from '@/features/(homepage)/5_contact/content';
import { TECH_STACK } from '@/features/(homepage)/8_stack/content';
import { USER } from '@/lib/user';

const content = `
# À propos de moi

Tout a commencé lorsqu'un ami m'a initié aux bases du HTML et du CSS. Ce qui n'était au départ qu'une expérimentation ludique est vite devenu une passion dévorante.

J'ai appris "à la dure", en passant de sites statiques bruts à la complexité de JavaScript. J'ai passé des semaines à décortiquer la logique des Promises et de l'asynchrone jusqu'au déclic. Cette courbe d'apprentissage m'a enseigné une leçon précieuse : chaque erreur est une opportunité de comprendre le "pourquoi" derrière le "comment". C'est cette gratification de voir une idée abstraite devenir une réalité interactive qui me motive chaque jour.J'ai appris "à la dure", en passant de sites statiques bruts à la complexité de JavaScript. J'ai passé des semaines à décortiquer la logique des Promises et de l'asynchrone jusqu'au déclic. Cette courbe d'apprentissage m'a enseigné une leçon précieuse : chaque erreur est une opportunité de comprendre le "pourquoi" derrière le "comment". C'est cette gratification de voir une idée abstraite devenir une réalité interactive qui me motive chaque jour.

La transition vers l'écosystème moderne a marqué un véritable tournant. D'abord sceptique, j'ai rapidement adopté la logique modulaire de React et la robustesse de TypeScript, qui ont remplacé la manipulation manuelle du DOM et le débogage fastidieux par une architecture fiable. L'ajout de Next.js et Tailwind CSS a ensuite décuplé ma productivité : fini les configurations lourdes et le CSS ingérable.La transition vers l'écosystème moderne a marqué un véritable tournant. D'abord sceptique, j'ai rapidement adopté la logique modulaire de React et la robustesse de TypeScript, qui ont remplacé la manipulation manuelle du DOM et le débogage fastidieux par une architecture fiable. L'ajout de Next.js et Tailwind CSS a ensuite décuplé ma productivité : fini les configurations lourdes et le CSS ingérable.

Aujourd'hui, je maîtrise cette stack (Next.js/TS/Tailwind) pour déployer rapidement des applications performantes et propres, animé par une veille technique constante pour optimiser chaque ligne de code.Aujourd'hui, je maîtrise cette stack (Next.js/TS/Tailwind) pour déployer rapidement des applications performantes et propres, animé par une veille technique constante pour optimiser chaque ligne de code.

## Informations personnelles

- Prénom: ${USER.firstName}
- Nom: ${USER.lastName}
- Nom d'affichage: ${USER.firstName}
- Ville: ${USER.location.city}
- Site internet: ${USER.website}

## Réseaux sociaux

${SOCIAL_LINKS.map((item) => `- [${item.name}](${item.link})`).join('\n')}

## Stack technique

${TECH_STACK.map((item) => `- [${item.title}]`).join('\n')}\n`;

export const dynamic = 'force-static';

export const GET = async (): Promise<Response> =>
	new Response(content, {
		headers: {
			'Content-Type': 'text/markdown;charset=utf-8',
		},
	});
