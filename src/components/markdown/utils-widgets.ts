import type { MDXRemoteProps } from "next-mdx-remote/rsc";
import dynamic from "next/dynamic";

/**
 * Widgets d'outils chargés à la demande.
 *
 * La table de composants MDX est partagée par TOUTES les pages de contenu :
 * en import statique, @cloudflare/speedtest, poline et le générateur de
 * bannière sur canvas atterrissaient dans le bundle de chaque page MDX, même
 * celles qui n'utilisent aucun outil. Chaque widget a désormais son propre
 * chunk, chargé seulement si le contenu l'invoque.
 */
const ArticleBanner = dynamic(async () => {
  const mod =
    await import("@/components/utils/ArticleBannerGenerator");
  return mod.ArticleBanner;
});
const Base64 = dynamic(async () => {
  const mod = await import("@/components/utils/Base64");
  return mod.Base64;
});
const ColorGenerator = dynamic(async () => {
  const mod = await import("@/components/utils/ColorGenerator");
  return mod.ColorGenerator;
});
const CaseConverter = dynamic(async () => {
  const mod = await import("@/components/utils/CaseConverter");
  return mod.CaseConverter;
});
const ContrastChecker = dynamic(async () => {
  const mod = await import("@/components/utils/ContrastChecker");
  return mod.ContrastChecker;
});
const CronExplainer = dynamic(async () => {
  const mod = await import("@/components/utils/CronExplainer");
  return mod.CronExplainer;
});
const DateConverter = dynamic(async () => {
  const mod = await import("@/components/utils/DateConverter");
  return mod.DateConverter;
});
const RegexTester = dynamic(async () => {
  const mod = await import("@/components/utils/RegexTester");
  return mod.RegexTester;
});
const DiffViewer = dynamic(async () => {
  const mod = await import("@/components/utils/DiffViewer");
  return mod.DiffViewer;
});
const HashGenerator = dynamic(async () => {
  const mod = await import("@/components/utils/HashGenerator");
  return mod.HashGenerator;
});
const JSONFormatter = dynamic(async () => {
  const mod = await import("@/components/utils/JSONFormatter");
  return mod.JSONFormatter;
});
const JwtDecoder = dynamic(async () => {
  const mod = await import("@/components/utils/JwtDecoder");
  return mod.JwtDecoder;
});
const LoremIpsumGenerator = dynamic(async () => {
  const mod = await import("@/components/utils/LoremIpsumGenerator");
  return mod.LoremIpsumGenerator;
});
const SpeedTest = dynamic(async () => {
  const mod = await import("@/components/utils/SpeedTest");
  return mod.SpeedTest;
});

/**
 * Le widget d'une page d'outil, et lui seul.
 *
 * Les quatorze widgets étaient déclarés dans la table de composants MDX, partagée
 * par TOUTES les pages de contenu. Chacun avait bien son propre chunk — mais
 * comme la table est un module unique, chaque page les référençait tous : la
 * différence symétrique entre les scripts de /utils/base64-encode-decode et ceux
 * de /utils/internet-speed-test était de ZÉRO, et le chunk du test de débit
 * (@cloudflare/speedtest) était référencé par 270 fichiers du build. Le
 * découpage existait sur le papier et ne servait à rien.
 *
 * La table de base ne contient donc plus aucun widget, et la page d'outil ajoute
 * le sien à partir de son slug. Vérifié sur les 28 fichiers .mdx des deux
 * locales : chaque page n'invoque qu'un seul widget, celui qui correspond à son
 * slug.
 *
 * CE QUE CE MODULE NE FAIT PAS, mesuré dans un navigateur le 13 août 2026.
 *
 * Le gain est réel mais il porte sur les pages SANS outil : un article ou la page
 * d'accueil ne reçoivent plus aucun code de widget (vérifié par
 * `e2e/widget-isolation.spec.ts`, qui cherche une chaîne de @cloudflare/speedtest
 * dans les scripts réellement téléchargés).
 *
 * Sur les pages d'outil, en revanche, les quatorze widgets arrivent TOUS, quel
 * que soit le slug : /utils/case-converter télécharge le chunk du test de débit
 * et celui du générateur de bannière. La différence symétrique entre les scripts
 * de deux pages d'outil est toujours zéro. La raison est structurelle : les
 * quatorze `dynamic()` sont déclarés dans ce module unique, importé par la route
 * `[slug]`, et une route dynamique n'a qu'UN manifeste de références clientes,
 * partagé par toutes ses tranches. Aucun agencement des `dynamic()` ne change
 * cela.
 *
 * L'écart mesuré est de 64 Kio entre une page d'outil (644 Kio de JS) et un
 * article (580 Kio) — et cet écart contient aussi le widget légitimement utilisé.
 * Le récupérer demanderait soit `ssr: false` sur chaque widget, ce qui retire le
 * rendu serveur du contenu principal de quatorze pages, soit quatorze routes
 * statiques explicites à la place de `[slug]`. Moins de 10 % du JS de la page ne
 * paie ni l'un ni l'autre ; c'est un arbitrage assumé, pas un oubli.
 */
const WIDGET_BY_SLUG: Record<string, MDXRemoteProps["components"]> = {
  "article-banner-generator": { ArticleBannerUtils: ArticleBanner },
  "base64-encode-decode": { Base64Utils: Base64 },
  "case-converter": { CaseConverterUtils: CaseConverter },
  "color-generator": { ColorGeneratorUtils: ColorGenerator },
  "contrast-checker": { ContrastCheckerUtils: ContrastChecker },
  "cron-explainer": { CronExplainerUtils: CronExplainer },
  "date-converter": { DateConverterUtils: DateConverter },
  "diff-viewer": { DiffViewerUtils: DiffViewer },
  "hash-generator": { HashGeneratorUtils: HashGenerator },
  "internet-speed-test": { InternetSpeedTestUtils: SpeedTest },
  "json-formatter": { JSONFormatterUtils: JSONFormatter },
  "jwt-decoder": { JwtDecoderUtils: JwtDecoder },
  "lorem-ipsum-generator": {
    LoremIpsumGeneratorUtils: LoremIpsumGenerator,
  },
  "regex-tester": { RegexTesterUtils: RegexTester },
};

/**
 * Un slug inconnu renvoie une table vide plutôt que de lever : le contenu MDX
 * afficherait alors le nom du composant en clair, ce qui est un défaut visible et
 * réparable — là où une exception ferait tomber toute la page.
 */
export const getUtilWidgets = (
  slug: string
): MDXRemoteProps["components"] => WIDGET_BY_SLUG[slug] ?? {};
