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
import { m } from "@/paraglide/messages";
import { getLocale, localizeHref } from "@/paraglide/runtime";

import { ToolItem } from "./ToolItem";

export const Tools = () => {
  const tools = getContentByCategory("utils")
    .toSorted((a, b) =>
      dayjs(b.metadata.createdAt).diff(dayjs(a.metadata.createdAt))
    )
    .slice(0, 3);

  return (
    <Panel>
      <PanelHeader sticky title={m.home_tools_panel_title()} />

      <PanelContent>
        {getLocale() === "en" ? (
          <>
            <Prose>
              -- a suite of free <span>web tools</span> to simplify
              your daily developer life --
            </Prose>
            <Prose>
              -- all your <span>essential utilities</span> gathered in
              one place for a more efficient workflow --
            </Prose>
            <Prose>
              -- fewer <i>repetitive</i> tasks, more{" "}
              <i>productivity</i>, with no technical constraints --
            </Prose>
          </>
        ) : (
          <>
            <Prose>
              -- une suite <span>d'outils web</span> gratuits pour
              simplifier votre quotidien de développeur --
            </Prose>
            <Prose>
              -- tous vos <span>utilitaires essentiels</span> réunis
              au même endroit pour un workflow plus efficace --
            </Prose>
            <Prose>
              -- moins de tâches <i>répétitives</i>, plus de{" "}
              <i>productivité</i>, sans aucune contrainte technique --
            </Prose>
          </>
        )}
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
          <Link
            aria-label={m.home_tools_footer_aria_label()}
            href={localizeHref("/utils")}
          >
            {m.home_tools_footer_button()}
          </Link>
        </Button>
      </PanelFooter>
    </Panel>
  );
};
