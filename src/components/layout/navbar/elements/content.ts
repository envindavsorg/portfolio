import { Book } from "@/components/motion/Book";
import { Code } from "@/components/motion/Code";
import { Cog } from "@/components/motion/Cog";
import { File } from "@/components/motion/File";
import { Flask } from "@/components/motion/Flask";
import { Home } from "@/components/motion/Home";
import { IdCard } from "@/components/motion/IdCard";
import { Keyboard } from "@/components/motion/Keyboard";
import { Layers } from "@/components/motion/Layers";
import { User } from "@/components/motion/User";
import GLOBAL_DATA from "@/data/global";

import type { CommandGroupDef, CommandKind } from "./types";

export const LABELS: Record<CommandKind, string> = {
  article: "lire l'article",
  command: "lancer la commande",
  components: "voir le composant",
  download: "télécharger le fichier",
  page: "aller à la page",
  section: "aller à la section",
  utils: "utiliser cet outil",
};

export const COMMANDS: CommandGroupDef[] = [
  {
    heading: "menu principal :",
    items: [
      {
        icon: Home,
        kind: "page",
        title: "retourner à l'accueil",
        url: "/",
      },
      {
        icon: Book,
        kind: "page",
        title: "mes articles de blog",
        url: "/articles",
      },
      {
        icon: Code,
        kind: "page",
        title: "composants réutilisables",
        url: "/components",
      },
      {
        icon: Cog,
        kind: "page",
        title: "outils pour développeurs",
        url: "/utils",
      },
    ],
  },
  {
    heading: "contenu de mon portfolio :",
    items: [
      {
        icon: User,
        kind: "section",
        title: "à propos de moi",
        url: "/#about-me",
      },
      {
        icon: Layers,
        kind: "section",
        title: "ma stack technique",
        url: "/#my-stack",
      },
      {
        icon: Flask,
        kind: "section",
        title: "mes expériences",
        url: "/#my-experiences",
      },
      {
        icon: Keyboard,
        kind: "section",
        title: "mes projets",
        url: "/#my-projects",
      },
    ],
  },
  {
    heading: "documents à télécharger :",
    items: [
      {
        icon: IdCard,
        kind: "download",
        title: "ma carte de visite",
        url: "/api/vcard",
      },
      {
        icon: File,
        kind: "download",
        title: "télécharger mon CV",
        url: GLOBAL_DATA.CV.url,
      },
    ],
  },
];

export const CATEGORY: Record<
  string,
  { route: string; heading: string; kind: CommandKind }
> = {
  article: {
    heading: "derniers articles de blog :",
    kind: "article",
    route: "blog",
  },
  components: {
    heading: "derniers snippets de code :",
    kind: "components",
    route: "components",
  },
  utils: {
    heading: "derniers outils :",
    kind: "utils",
    route: "utils",
  },
};
