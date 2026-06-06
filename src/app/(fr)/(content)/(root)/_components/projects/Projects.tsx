import { CaretDownIcon } from "@phosphor-icons/react/dist/ssr";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/base/Collapsible";
import {
  Panel,
  PanelContent,
  PanelFooter,
  PanelHeader,
} from "@/components/base/Panel";
import { Button } from "@/components/primitives/Button";
import { Prose } from "@/components/primitives/Typography";
import { m } from "@/paraglide/messages";
import { getLocale } from "@/paraglide/runtime";

import { PROJECTS } from "./content";
import { ProjectItem } from "./ProjectItem";

const VISIBLE_COUNT = 2;

export const Projects = () => {
  const visibleContent = PROJECTS.slice(0, VISIBLE_COUNT);
  const hiddenContent = PROJECTS.slice(VISIBLE_COUNT);
  const hasHidden = hiddenContent.length > 0;

  return (
    <Panel>
      <PanelHeader sticky title={m.home_projects_panel_title()} />

      <PanelContent>
        <Prose>
          {getLocale() === "en" ? (
            <>
              -- a <i>selection of projects</i> that illustrate my
              journey and my skills --
            </>
          ) : (
            <>
              -- une <i>sélection de projets</i> qui illustrent mon
              parcours et mes compétences --
            </>
          )}
        </Prose>
        <Prose>
          {getLocale() === "en" ? (
            <>
              -- from building modern web <span>applications</span> to{" "}
              <span>technical experiments</span>, each project
              represents a challenge met and skills gained --
            </>
          ) : (
            <>
              -- du <span>développement</span> d'applications web
              modernes aux <span>expérimentations techniques</span>,
              chaque projet représente un défi relevé et des
              compétences acquises --
            </>
          )}
        </Prose>
        <Prose>{m.home_projects_prose_3()}</Prose>
      </PanelContent>

      <Collapsible>
        {visibleContent.map((item, idx) => (
          <ProjectItem
            isLast={idx === visibleContent.length - 1}
            key={item.id}
            project={item}
          />
        ))}

        {hasHidden && (
          <CollapsibleContent>
            {hiddenContent.map((item, idx) => (
              <ProjectItem
                isLast={idx === hiddenContent.length - 1}
                key={item.id}
                project={item}
              />
            ))}
          </CollapsibleContent>
        )}

        {hasHidden && (
          <PanelFooter>
            <CollapsibleTrigger asChild>
              <Button
                className="group flex items-center gap-2"
                variant="outline"
              >
                <span className="group-data-[state=open]:hidden">
                  {m.home_projects_show_more()}
                </span>
                <span className="hidden group-data-[state=open]:inline">
                  {m.home_projects_show_less()}
                </span>
                <CaretDownIcon
                  aria-hidden="true"
                  className="size-4 transition-transform duration-300 ease-in-out group-data-[state=open]:rotate-180"
                />
              </Button>
            </CollapsibleTrigger>
          </PanelFooter>
        )}
      </Collapsible>
    </Panel>
  );
};
