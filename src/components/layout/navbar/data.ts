import { m } from "@/paraglide/messages";

interface NavigationData {
  title: () => string;
  link: string;
}

export const NAVIGATION_DATA: NavigationData[] = [
  { link: "/", title: m.nav_home },
  { link: "/articles", title: m.nav_articles },
  { link: "/components", title: m.nav_components },
  { link: "/utils", title: m.nav_utils },
];
