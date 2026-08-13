"use client";

import { memo } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/primitives/Dialog";
import { Kbd, KbdGroup } from "@/components/primitives/Kbd";
import { m } from "@/paraglide/messages";

interface NavBarShortcutsProps {
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
  { keys: ["␛"], label: m.shortcuts_close },
];

export const NavBarShortcuts = memo(
  ({ open, onOpenChange }: NavBarShortcutsProps) => (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent
        className="max-w-md"
        data-slot="shortcuts-sheet"
        overlay
      >
        <DialogTitle className="font-pixel-square lowercase">
          {m.shortcuts_title()}
        </DialogTitle>
        <DialogDescription>
          {m.shortcuts_description()}
        </DialogDescription>

        <ul className="space-y-2 pt-2">
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
      </DialogContent>
    </Dialog>
  )
);
