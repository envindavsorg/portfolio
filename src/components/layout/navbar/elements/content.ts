import { Book } from "@/components/motion/Book";
import { Code } from "@/components/motion/Code";
import { Cog } from "@/components/motion/Cog";
import { File } from "@/components/motion/File";
import { Flask } from "@/components/motion/Flask";
import { Home } from "@/components/motion/Home";
import { IdCard } from "@/components/motion/IdCard";
import { Keyboard } from "@/components/motion/Keyboard";
import { Layers } from "@/components/motion/Layers";
import { Search } from "@/components/motion/Search";
import { User } from "@/components/motion/User";
import GLOBAL_DATA from "@/data/global";
import { m } from "@/paraglide/messages";

import type { CommandGroupDef, CommandKind } from "./types";

export const LABELS: Record<CommandKind, () => string> = {
  article: m.nav_command_label_article,
  command: m.nav_command_label_command,
  components: m.nav_command_label_components,
  download: m.nav_command_label_download,
  page: m.nav_command_label_page,
  section: m.nav_command_label_section,
  utils: m.nav_command_label_utils,
};

export const COMMANDS: CommandGroupDef[] = [
  {
    heading: m.nav_command_group_main_menu,
    items: [
      {
        icon: Home,
        kind: "page",
        title: m.nav_command_home,
        url: "/",
      },
      {
        icon: Book,
        kind: "page",
        title: m.nav_command_blog_articles,
        url: "/articles",
      },
      {
        icon: Code,
        kind: "page",
        title: m.nav_command_reusable_components,
        url: "/components",
      },
      {
        icon: Cog,
        kind: "page",
        title: m.nav_command_dev_tools,
        url: "/utils",
      },
      {
        icon: Layers,
        kind: "page",
        title: m.nav_command_tags,
        url: "/tags",
      },
      {
        icon: Search,
        kind: "page",
        title: m.nav_command_search_page,
        url: "/search",
      },
      {
        icon: Book,
        kind: "page",
        title: m.nav_command_series,
        url: "/series",
      },
    ],
  },
  {
    heading: m.nav_command_group_portfolio,
    items: [
      {
        icon: User,
        kind: "section",
        title: m.nav_command_about_me,
        url: "/#about-me",
      },
      {
        icon: Layers,
        kind: "section",
        title: m.nav_command_my_stack,
        url: "/#my-stack",
      },
      {
        icon: Flask,
        kind: "section",
        title: m.nav_command_my_experiences,
        url: "/#my-experiences",
      },
      {
        icon: Keyboard,
        kind: "section",
        title: m.nav_command_my_projects,
        url: "/#my-projects",
      },
    ],
  },
  {
    heading: m.nav_command_group_downloads,
    items: [
      {
        icon: IdCard,
        kind: "download",
        title: m.nav_command_business_card,
        url: "/api/vcard",
      },
      {
        icon: File,
        kind: "download",
        title: m.nav_command_download_cv,
        url: GLOBAL_DATA.CV.url,
      },
    ],
  },
];

export const CATEGORY: Record<
  string,
  { route: string; heading: () => string; kind: CommandKind }
> = {
  articles: {
    heading: m.nav_command_group_latest_articles,
    kind: "article",
    route: "articles",
  },
  components: {
    heading: m.nav_command_group_latest_snippets,
    kind: "components",
    route: "components",
  },
  utils: {
    heading: m.nav_command_group_latest_utils,
    kind: "utils",
    route: "utils",
  },
};
