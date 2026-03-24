import { STACK_ICONS } from "@/app/(content)/(root)/_components/stack/content";
import GLOBAL_DATA from "@/data/global";

const content = `
# À propos de moi

Tout a commencé lorsqu'un ami m'a initié aux bases du HTML et du CSS. Ce qui n'était au départ qu'une expérimentation ludique est vite devenu une passion dévorante.

J'ai appris "à la dure", en passant de sites statiques bruts à la complexité de JavaScript. J'ai passé des semaines à décortiquer la logique des Promises et de l'asynchrone jusqu'au déclic. Cette courbe d'apprentissage m'a enseigné une leçon précieuse : chaque erreur est une opportunité de comprendre le "pourquoi" derrière le "comment". C'est cette gratification de voir une idée abstraite devenir une réalité interactive qui me motive chaque jour.J'ai appris "à la dure", en passant de sites statiques bruts à la complexité de JavaScript. J'ai passé des semaines à décortiquer la logique des Promises et de l'asynchrone jusqu'au déclic. Cette courbe d'apprentissage m'a enseigné une leçon précieuse : chaque erreur est une opportunité de comprendre le "pourquoi" derrière le "comment". C'est cette gratification de voir une idée abstraite devenir une réalité interactive qui me motive chaque jour.

La transition vers l'écosystème moderne a marqué un véritable tournant. D'abord sceptique, j'ai rapidement adopté la logique modulaire de React et la robustesse de TypeScript, qui ont remplacé la manipulation manuelle du DOM et le débogage fastidieux par une architecture fiable. L'ajout de Next.js et Tailwind CSS a ensuite décuplé ma productivité : fini les configurations lourdes et le CSS ingérable.La transition vers l'écosystème moderne a marqué un véritable tournant. D'abord sceptique, j'ai rapidement adopté la logique modulaire de React et la robustesse de TypeScript, qui ont remplacé la manipulation manuelle du DOM et le débogage fastidieux par une architecture fiable. L'ajout de Next.js et Tailwind CSS a ensuite décuplé ma productivité : fini les configurations lourdes et le CSS ingérable.

Aujourd'hui, je maîtrise cette stack (Next.js/TS/Tailwind) pour déployer rapidement des applications performantes et propres, animé par une veille technique constante pour optimiser chaque ligne de code.Aujourd'hui, je maîtrise cette stack (Next.js/TS/Tailwind) pour déployer rapidement des applications performantes et propres, animé par une veille technique constante pour optimiser chaque ligne de code.

## Informations personnelles

- Prénom: ${GLOBAL_DATA.USER.firstName}
- Nom: ${GLOBAL_DATA.USER.lastName}
- Nom d'affichage: ${GLOBAL_DATA.USER.firstName}
- Ville: ${GLOBAL_DATA.USER.location.city}
- Site internet: ${GLOBAL_DATA.SOCIAL.portfolio}

## Stack technique

${STACK_ICONS.map((item) => `- [${item.title}]`).join("\n")}\n`;

export const dynamic = "force-static";

export const GET = async (): Promise<Response> =>
  new Response(content, {
    headers: {
      "Content-Type": "text/markdown;charset=utf-8",
    },
  });
