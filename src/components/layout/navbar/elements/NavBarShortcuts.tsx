"use client";

import type { RefObject } from "react";
import { memo, useRef } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/primitives/Dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/primitives/Drawer";
import { Kbd, KbdGroup } from "@/components/primitives/Kbd";
import { cn } from "@/lib/utils";
import * as m from "@/paraglide/messages";

interface NavBarShortcutsProps {
  /**
   * Où rendre le focus quand l'élément qui l'avait a disparu : la palette se
   * referme en lançant sa propre action « raccourcis ».
   */
  fallbackFocusRef: RefObject<HTMLElement | null>;
  /** même requête que la palette : `Dialog` au-dessus, `Drawer` en dessous */
  isDesktop: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * La feuille des raccourcis clavier.
 *
 * Le site en compte cinq et n'en documentait AUCUN. `alt+D` bascule le thème
 * depuis toujours et n'apparaissait dans aucune interface : un raccourci que
 * personne ne peut découvrir n'existe pas.
 *
 * Les touches sont dans des `<kbd>` : c'est l'élément prévu pour, et il porte
 * l'information à un lecteur d'écran comme à un lecteur voyant.
 */
const SHORTCUTS: { keys: string[]; label: () => string }[] = [
  { keys: ["⌘", "K"], label: m.shortcuts_palette },
  { keys: ["/"], label: m.shortcuts_palette_alt },
  { keys: ["←", "→"], label: m.shortcuts_prev_next },
  { keys: ["alt", "D"], label: m.shortcuts_theme },
  { keys: ["?"], label: m.shortcuts_help },
  // « esc » en toutes lettres, comme « alt » : le glyphe ␛ tient trois
  // lettres en diagonale dans six pixels, personne ne le lisait
  { keys: ["esc"], label: m.shortcuts_close },
];

export const NavBarShortcuts = memo(
  ({
    fallbackFocusRef,
    isDesktop,
    open,
    onOpenChange,
  }: NavBarShortcutsProps) => {
    const previousFocusRef = useRef<Element | null>(null);

    // `DialogContent` est `hidden` sous `sm` : sur téléphone la feuille
    // s'ouvrait invisible, modale quand même — page figée, un tap avalé pour
    // la refermer. Elle suit donc la palette et passe en tiroir.
    const Wrapper = isDesktop ? Dialog : Drawer;
    const Content = isDesktop ? DialogContent : DrawerContent;
    const Title = isDesktop ? DialogTitle : DrawerTitle;
    const Description = isDesktop
      ? DialogDescription
      : DrawerDescription;

    return (
      <Wrapper
        onOpenChange={onOpenChange}
        open={open}
        // sans contenu focalisable, le focus se pose sur le tiroir lui-même :
        // c'est ce qui retient Tab dedans au lieu de parcourir la page derrière
        {...(!isDesktop && { autoFocus: true })}
      >
        <Content
          className={isDesktop ? "max-w-md" : "bg-popover"}
          data-slot="shortcuts-sheet"
          // Base UI rend le focus tout seul à la fermeture ; le tiroir, lui,
          // le laisse tomber sur `<body>` faute de déclencheur déclaré
          {...(!isDesktop && {
            onCloseAutoFocus: (event: Event) => {
              event.preventDefault();
              const previous = previousFocusRef.current;
              const target =
                previous instanceof HTMLElement &&
                previous.isConnected
                  ? previous
                  : fallbackFocusRef.current;
              target?.focus();
            },
            onOpenAutoFocus: () => {
              previousFocusRef.current = document.activeElement;
            },
          })}
        >
          <div className={cn(!isDesktop && "px-5 pt-2 pb-6")}>
            <Title className="font-pixel-square font-semibold text-lg text-theme lowercase">
              {m.shortcuts_title()}
            </Title>
            <Description>{m.shortcuts_description()}</Description>

            <ul className="space-y-2 pt-4">
              {SHORTCUTS.map(({ keys, label }) => (
                <li
                  className="flex items-center justify-between gap-x-4"
                  key={keys.join("+")}
                >
                  <span className="text-sm">{label()}</span>
                  <KbdGroup>
                    {keys.map((key) => (
                      <Kbd key={key}>{key}</Kbd>
                    ))}
                  </KbdGroup>
                </li>
              ))}
            </ul>
          </div>
        </Content>
      </Wrapper>
    );
  }
);
