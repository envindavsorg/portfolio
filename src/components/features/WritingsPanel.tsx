import type { ReactNode } from "react";

import {
  Panel,
  PanelContent,
  PanelHeader,
  PanelTitle,
} from "@/components/base/Panel";

interface WritingsPanelProps {
  children: ReactNode;
  title: string;
}

/**
 * Panneau annexe d'une page de contenu : série, sujets abordés, à lire aussi.
 *
 * Deux écarts au `Panel` de l'accueil, tous deux mesurés à 1440 px :
 * - le titre fait 20 px et non 30. À 30 px, « à lire aussi » dépassait les
 *   sections de l'article (20 px) et talonnait son h1 (36 px) : une annexe se
 *   lisait comme un second titre de page ;
 * - pas de `border-x`. La mise en page des écrits porte déjà ce filet, et le
 *   panneau en traçait un second collé au premier — un trait de 2 px sur les
 *   seuls panneaux, 1 px partout ailleurs dans la colonne.
 *
 * L'élément `Panel` et le `data-slot="panel-title"` restent : les tests de bout
 * en bout remontent du titre au panneau par ces deux prises.
 */
export const WritingsPanel = ({
  children,
  title,
}: WritingsPanelProps) => (
  <Panel className="border-x-0" data-print="hide">
    <PanelHeader>
      <PanelTitle className="text-lg sm:text-xl">{title}</PanelTitle>
    </PanelHeader>

    <PanelContent reset>{children}</PanelContent>
  </Panel>
);
