import { BookIcon } from "@/components/icons/BookIcon";
import { CodeIcon } from "@/components/icons/CodeIcon";
import { CogIcon } from "@/components/icons/CogIcon";
import { CpuIcon } from "@/components/icons/CpuIcon";
import { FileIcon } from "@/components/icons/FileIcon";
import { FlaskIcon } from "@/components/icons/FlaskIcon";
import { HomeIcon } from "@/components/icons/HomeIcon";
import { IdCardIcon } from "@/components/icons/IdCardIcon";
import { LayersIcon } from "@/components/icons/LayersIcon";
import { UserIcon } from "@/components/icons/UserIcon";
import GLOBAL_DATA from "@/content/data/global";
import type { CommandGroupDef, CommandKind } from "./types";

export const LABELS: Record<CommandKind, string> = {
  command: "Lancer la commande",
  page: "Aller à la page",
  utils: "Utiliser cet outil",
  article: "Lire l'article",
  components: "Voir le composant",
  section: "Aller à la section",
  download: "Télécharger le fichier",
};

export const COMMANDS: CommandGroupDef[] = [
  {
    heading: "Menu principal :",
    items: [
      {
        title: "Retourner à l'accueil",
        url: "/",
        icon: HomeIcon,
        kind: "page",
      },
      {
        title: "Mes articles de blog",
        url: "/blog",
        icon: BookIcon,
        kind: "page",
      },
      {
        title: "Composants réutilisables",
        url: "/components",
        icon: CodeIcon,
        kind: "page",
      },
      {
        title: "Outils pour développeurs",
        url: "/utils",
        icon: CogIcon,
        kind: "page",
      },
    ],
  },
  {
    heading: "Contenu de mon portfolio :",
    items: [
      {
        title: "À propos de moi",
        url: "/#about-me",
        icon: UserIcon,
        kind: "section",
      },
      {
        title: "Ma stack technique",
        url: "/#my-stack",
        icon: LayersIcon,
        kind: "section",
      },
      {
        title: "Mes expériences",
        url: "/#my-experiences",
        icon: FlaskIcon,
        kind: "section",
      },
      {
        title: "Mes projets",
        url: "/#my-projects",
        icon: CpuIcon,
        kind: "section",
      },
    ],
  },
  {
    heading: "Documents à télécharger :",
    items: [
      {
        title: "Ma carte de visite",
        url: "/api/vcard",
        icon: IdCardIcon,
        kind: "download",
      },
      {
        title: "Télécharger mon CV",
        url: GLOBAL_DATA.CV.url,
        icon: FileIcon,
        kind: "download",
      },
    ],
  },
];

export const CATEGORY: Record<
  string,
  { route: string; heading: string; kind: CommandKind }
> = {
  article: {
    route: "blog",
    heading: "Derniers articles de blog :",
    kind: "article",
  },
  components: {
    route: "components",
    heading: "Derniers snippets de code :",
    kind: "components",
  },
  utils: {
    route: "utils",
    heading: "Derniers outils :",
    kind: "utils",
  },
};
