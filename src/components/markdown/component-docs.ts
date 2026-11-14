import type { MDXRemoteProps } from "next-mdx-remote/rsc";

import { CodeCollapsibleWrapper } from "@/components/blog/CodeCollapsibleWrapper";
import { ComponentPreview } from "@/components/blog/ComponentPreview";
import { ComponentSource } from "@/components/blog/ComponentSource";

/**
 * Les trois balises MDX propres aux pages /components, et à elles seules.
 *
 * Elles vivaient dans la table de base de `mdx.tsx`, partagée par les trois
 * routes `[slug]`. Usage réel dans le contenu : 6 fichiers sur 6 côté
 * composants, 0 sur 10 côté articles, 0 sur 28 côté outils. Un article
 * téléchargeait pourtant `ComponentPreview`, le bac à sable, les trois démos du
 * registre, Base UI Checkbox + Field et react-number-format — de quoi dessiner
 * un aperçu qu'il n'affiche jamais.
 *
 * Même remède que pour les widgets d'outils (`utils-widgets.ts`) : la table de
 * base ne les connaît plus, et `ComponentView` les passe par la prop
 * `components` de `Mdx`. Le découpage prend effet parce que articles, outils et
 * composants sont trois routes distinctes, donc trois manifestes de références
 * clientes. Entre les quatorze widgets d'UNE même route, cela ne suffisait pas :
 * il a fallu une frontière cliente, voir `utils-widgets.ts`.
 *
 * Contrepartie : un article qui écrirait `<ComponentPreview>` afficherait le nom
 * de la balise en clair. `component-docs.test.ts` relit les contenus et échoue
 * avant que cela n'arrive en production.
 */
export const COMPONENT_DOCS: MDXRemoteProps["components"] = {
  CodeCollapsibleWrapper,
  ComponentPreview,
  ComponentSource,
};
