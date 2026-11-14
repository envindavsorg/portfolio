import type { MDXRemoteProps } from "next-mdx-remote/rsc";
import { createElement } from "react";

import type { UtilWidgetName } from "./UtilWidget";
import { UtilWidget } from "./UtilWidget";

/**
 * Le widget d'une page d'outil, et lui seul — dans la table MDX comme dans le
 * navigateur.
 *
 * DANS LA TABLE MDX (août 2026). Les quatorze widgets étaient déclarés dans la
 * table de composants partagée par TOUTES les pages de contenu : chaque article
 * embarquait @cloudflare/speedtest et le générateur de bannière sur canvas. La
 * table de base n'en contient plus aucun, et la page d'outil ajoute le sien à
 * partir de son slug. Vérifié sur les 28 fichiers .mdx des deux locales : chaque
 * page n'invoque qu'un widget, celui de son slug.
 *
 * DANS LE NAVIGATEUR (novembre 2026). Les pages d'outil, elles, téléchargeaient
 * toujours les quatorze. Ce module les déclarait par quatorze `dynamic()` — mais
 * c'est un module SERVEUR, et le guide de Next le dit : « When a Server
 * Component dynamically imports a Client Component, automatic code splitting is
 * currently not supported ». Relevé sur le build : dans le manifeste de
 * références clientes de la route `[slug]`, les quatorze widgets portaient la
 * MÊME liste de 23 chunks, celle de la page, et le HTML prérendu de chaque outil
 * citait les mêmes 33 scripts. Un `import()` écrit côté serveur découpe le rendu
 * serveur, pas le code envoyé au navigateur.
 *
 * Ce n'était donc pas une fatalité de la route dynamique, comme l'affirmait la
 * version précédente de ce commentaire (« aucun agencement des `dynamic()` ne
 * change cela ») : il fallait les écrire côté client. Le serveur ne référence
 * plus qu'UNE frontière cliente, `UtilWidget`, à qui il passe le slug ; c'est
 * elle qui importe le widget, toujours rendu dans le HTML statique. Le prix :
 * le chunk du widget n'est pas cité dans le HTML, il part quand les scripts de
 * la page ont été exécutés — une requête de plus, à la suite, que l'événement
 * `load` attend.
 *
 * `Record<UtilWidgetName, …>` lie les deux modules : un widget ajouté d'un côté
 * sans l'autre ne compile pas. `e2e/widget-isolation.spec.ts` garde le résultat
 * ENTRE outils.
 */
const WIDGET_TAG: Record<UtilWidgetName, string> = {
  "article-banner-generator": "ArticleBannerUtils",
  "base64-encode-decode": "Base64Utils",
  "case-converter": "CaseConverterUtils",
  "color-generator": "ColorGeneratorUtils",
  "contrast-checker": "ContrastCheckerUtils",
  "cron-explainer": "CronExplainerUtils",
  "date-converter": "DateConverterUtils",
  "diff-viewer": "DiffViewerUtils",
  "hash-generator": "HashGeneratorUtils",
  "internet-speed-test": "InternetSpeedTestUtils",
  "json-formatter": "JSONFormatterUtils",
  "jwt-decoder": "JwtDecoderUtils",
  "lorem-ipsum-generator": "LoremIpsumGeneratorUtils",
  "regex-tester": "RegexTesterUtils",
};

const isUtilWidgetName = (slug: string): slug is UtilWidgetName =>
  Object.hasOwn(WIDGET_TAG, slug);

/**
 * Un slug inconnu renvoie une table vide plutôt que de lever : le contenu MDX
 * afficherait alors le nom du composant en clair, ce qui est un défaut visible et
 * réparable — là où une exception ferait tomber toute la page.
 */
export const getUtilWidgets = (
  slug: string
): MDXRemoteProps["components"] => {
  if (!isUtilWidgetName(slug)) {
    return {};
  }

  return {
    [WIDGET_TAG[slug]]: () =>
      createElement(UtilWidget, { name: slug }),
  };
};
