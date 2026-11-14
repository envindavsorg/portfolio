"use client";

import type { ComponentType } from "react";
import { use } from "react";

/**
 * Les quatorze widgets d'outils, chacun derrière son `import()`.
 *
 * Ce module est CLIENT, et c'est tout l'objet : le découpage du code se décide
 * là où l'`import()` est écrit. Dans un module serveur il ne découpe rien pour
 * le navigateur — le widget y devient une simple référence cliente, et
 * Turbopack range toutes les références clientes d'une page dans UN groupe de
 * chunks, que le HTML charge en entier (voir `utils-widgets.ts`).
 */
const LOADERS = {
  "article-banner-generator": () =>
    import("@/components/utils/ArticleBannerGenerator").then(
      (mod) => mod.ArticleBanner
    ),
  "base64-encode-decode": () =>
    import("@/components/utils/Base64").then((mod) => mod.Base64),
  "case-converter": () =>
    import("@/components/utils/CaseConverter").then(
      (mod) => mod.CaseConverter
    ),
  "color-generator": () =>
    import("@/components/utils/ColorGenerator").then(
      (mod) => mod.ColorGenerator
    ),
  "contrast-checker": () =>
    import("@/components/utils/ContrastChecker").then(
      (mod) => mod.ContrastChecker
    ),
  "cron-explainer": () =>
    import("@/components/utils/CronExplainer").then(
      (mod) => mod.CronExplainer
    ),
  "date-converter": () =>
    import("@/components/utils/DateConverter").then(
      (mod) => mod.DateConverter
    ),
  "diff-viewer": () =>
    import("@/components/utils/DiffViewer").then(
      (mod) => mod.DiffViewer
    ),
  "hash-generator": () =>
    import("@/components/utils/HashGenerator").then(
      (mod) => mod.HashGenerator
    ),
  "internet-speed-test": () =>
    import("@/components/utils/SpeedTest").then(
      (mod) => mod.SpeedTest
    ),
  "json-formatter": () =>
    import("@/components/utils/JSONFormatter").then(
      (mod) => mod.JSONFormatter
    ),
  "jwt-decoder": () =>
    import("@/components/utils/JwtDecoder").then(
      (mod) => mod.JwtDecoder
    ),
  "lorem-ipsum-generator": () =>
    import("@/components/utils/LoremIpsumGenerator").then(
      (mod) => mod.LoremIpsumGenerator
    ),
  "regex-tester": () =>
    import("@/components/utils/RegexTester").then(
      (mod) => mod.RegexTester
    ),
} satisfies Record<string, () => Promise<ComponentType>>;

/** le slug de la page d'outil — c'est lui qui désigne le widget */
export type UtilWidgetName = keyof typeof LOADERS;

const ready = new Map<UtilWidgetName, ComponentType>();
const loading = new Map<UtilWidgetName, Promise<ComponentType>>();

/** une promesse par widget, toujours la même : `use` en a besoin */
const load = (name: UtilWidgetName): Promise<ComponentType> => {
  const known = loading.get(name);
  if (known) {
    return known;
  }

  const promise = LOADERS[name]().then((Widget) => {
    ready.set(name, Widget);
    return Widget;
  });
  loading.set(name, promise);
  return promise;
};

const TOOL_PATH = /\/utils\/(?<slug>[^/]+)\/?$/u;

/** le widget de la page que le navigateur vient de charger, s'il y en a un */
const widgetOfThisDocument = (): UtilWidgetName | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const slug = TOOL_PATH.exec(window.location.pathname)?.groups?.slug;
  return slug !== undefined && Object.hasOwn(LOADERS, slug)
    ? (slug as UtilWidgetName)
    : null;
};

/**
 * Le widget de la page est attendu ICI, au niveau du module, et non au rendu.
 *
 * Laisser le rendu le demander (`next/dynamic`, `lazy`) suffit à découper, et
 * c'est ce qui a d'abord été fait. Mais le widget n'arrive alors qu'au moment
 * où l'hydratation l'atteint, et tant qu'il n'est pas là React ne peut pas
 * hydrater la page de façon synchrone à la première frappe ou au premier clic :
 * l'événement est perdu. 90 des 123 passages de `utils-tools.spec.ts` et
 * `utils-tools-2.spec.ts`, qui saisissent dès la fin du chargement, échouaient.
 *
 * Avec cet `await`, le module est asynchrone : React attend qu'il soit prêt
 * avant de résoudre la référence cliente, comme il attend n'importe quel chunk,
 * et le rendu du widget est ensuite synchrone. Le slug se lit dans l'URL parce
 * que rien d'autre n'est connu à ce niveau — c'est déjà lui qui désigne le
 * widget côté serveur. Si l'URL des outils change sans que ce motif suive, le
 * widget retombe sur le chargement au rendu (le chemin d'attente ci-dessous),
 * celui-là même que ces deux fichiers de tests ont mis en défaut.
 *
 * Le module n'est évalué qu'une fois par document : précharger le lien d'un
 * autre outil n'amène donc PAS son widget (quatorze modules asynchrones, un par
 * widget, le faisaient — essayé aussi).
 */
const initial = widgetOfThisDocument();
if (initial) {
  await load(initial);
}

/**
 * Rendu dans le HTML statique, sans état d'attente : pas de frontière Suspense,
 * donc la navigation vers un autre outil garde la page précédente jusqu'à
 * l'arrivée du widget, puis affiche tout d'un coup.
 */
export const UtilWidget = ({
  name,
}: Readonly<{ name: UtilWidgetName }>) => {
  const Widget = ready.get(name) ?? use(load(name));

  return <Widget />;
};
