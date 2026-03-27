import Link from "next/link";

import {
  Panel,
  PanelContent,
  PanelFooter,
  PanelHeader,
} from "@/components/base/Panel";
import { Button } from "@/components/primitives/Button";
import { Prose } from "@/components/primitives/Typography";
import { getContentByCategory } from "@/lib/content";
import { dayjs } from "@/lib/functions";

import { ToolItem } from "./ToolItem";

export const Tools = () => {
  const tools = getContentByCategory("utils")
    .toSorted((a, b) =>
      dayjs(b.metadata.createdAt).diff(dayjs(a.metadata.createdAt))
    )
    .slice(0, 3);

  return (
    <Panel>
      <PanelHeader sticky title="outils pour développeurs" />

      <PanelContent>
        <Prose>
          -- une suite <span>d'outils web</span> gratuits pour
          simplifier votre quotidien de développeur --
        </Prose>
        <Prose>
          -- tous vos <span>utilitaires essentiels</span> réunis au
          même endroit pour un workflow plus efficace --
        </Prose>
        <Prose>
          -- moins de tâches <i>répétitives</i>, plus de{" "}
          <i>productivité</i>, sans aucune contrainte technique --
        </Prose>
      </PanelContent>

      {tools.map((item, idx) => (
        <ToolItem
          isLast={idx === tools.length - 1}
          key={item.slug}
          tool={item}
        />
      ))}

      <PanelFooter>
        <Button asChild variant="outline">
          <Link aria-label="Voir tous les outils" href="/utils">
            voir tous les outils
          </Link>
        </Button>
      </PanelFooter>
    </Panel>
  );
};
