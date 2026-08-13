import type { ElementType } from "react";

export type CommandKind =
  | "command"
  | "page"
  | "utils"
  | "article"
  | "components"
  | "section"
  | "download";

export interface CommandItemProps {
  title: () => string;
  /**
   * Destination du lien. Absente pour une ACTION, qui exécute `run` au lieu de
   * naviguer — c'est ce que le `kind: "command"` déclaré ici depuis le début
   * désignait, sans qu'aucun item ne s'en serve.
   */
  url?: string;
  /** exécuté à la sélection ; exclusif avec `url` */
  run?: () => void;
  icon?: ElementType;
  keywords?: string[];
  openInNewTab?: boolean;
  kind?: CommandKind;
}

export interface CommandGroupDef {
  heading: () => string;
  items: CommandItemProps[];
}
