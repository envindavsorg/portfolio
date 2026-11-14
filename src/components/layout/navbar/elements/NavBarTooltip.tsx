import type { ReactElement } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/base/Tooltip";
import { Kbd } from "@/components/primitives/Kbd";

interface NavBarTooltipProps {
  /** le bouton ou le lien décrit : il reste l'élément qui reçoit le focus */
  children: ReactElement;
  label: string;
  /** raccourci clavier, affiché à la suite du libellé */
  shortcut?: string;
}

/**
 * Infobulle des boutons à icône seule de la barre.
 *
 * Deux carrés liés (llms.txt) ou un « EN » nu ne disent pas ce qu'ils font, et
 * ⌘K comme alt+D n'étaient lisibles que dans la feuille ouverte par « ? ».
 * Le libellé est le nom accessible du bouton, jamais un second texte : ce que
 * l'on voit au survol est ce qu'un lecteur d'écran annonce.
 */
export const NavBarTooltip = ({
  children,
  label,
  shortcut,
}: NavBarTooltipProps) => (
  <Tooltip>
    <TooltipTrigger
      render={children as ReactElement<Record<string, unknown>>}
    />
    <TooltipContent side="bottom">
      {label}
      {shortcut && (
        // un contour plutôt que la pastille prévue par `Kbd` dans une
        // infobulle : en clair son fond éclaircit le bleu et le texte n'y
        // tient plus que 3,2:1. Sur le bleu nu il garde les 4,5 du libellé.
        <Kbd className="border border-background/40 in-data-[slot=tooltip-content]:bg-transparent text-xs dark:in-data-[slot=tooltip-content]:bg-transparent">
          {shortcut}
        </Kbd>
      )}
    </TooltipContent>
  </Tooltip>
);
