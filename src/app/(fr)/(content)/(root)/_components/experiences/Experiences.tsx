import { CaretDownIcon } from "@phosphor-icons/react/ssr";

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

import { EXPERIENCES } from "./content";
import { ExperienceItem } from "./ExperienceItem";

const VISIBLE_COUNT = 3;

export const Experiences = () => {
  const visibleContent = EXPERIENCES.slice(0, VISIBLE_COUNT);
  const hiddenContent = EXPERIENCES.slice(VISIBLE_COUNT);
  const hasHidden = hiddenContent.length > 0;

  return (
    <Panel>
      <PanelHeader sticky title={m.home_experiences_panel_title()} />

      <PanelContent>
        <Prose>
          {getLocale() === "en" ? (
            <>
              -- a look back at <i>my professional journey</i> and the
              experiences that helped me grow as a{" "}
              <span>Front-End</span>, then <span>Full-Stack</span>{" "}
              developer --
            </>
          ) : (
            <>
              -- retour sur <i>mon parcours professionnel</i> et les
              expériences qui m'ont permis de grandir en tant que{" "}
              <span>développeur Front-End</span>, puis{" "}
              <span>Full-Stack</span> --
            </>
          )}
        </Prose>
        <Prose>
          {getLocale() === "en" ? (
            <>
              -- together, these <span>experiences</span> form the
              foundation of my current skills and reflect my passion
              for building innovative, high-performing web solutions
              --
            </>
          ) : (
            <>
              -- ensemble, ces <span>expériences</span> constituent le
              socle de mes compétences actuelles et reflètent ma
              passion pour la création de solutions web innovantes et
              performantes --
            </>
          )}
        </Prose>
        <Prose>
          {getLocale() === "en" ? (
            <>
              -- from large-scale <span>application redesigns</span>{" "}
              to integrating complex features, every role has been a
              chance to learn, take on{" "}
              <span>technical challenges</span> and collaborate with
              talented teams --
            </>
          ) : (
            <>
              -- de la <span>refonte d'applications</span> à grande
              échelle à l'intégration de fonctionnalités complexes,
              chaque poste a été une opportunité d'apprendre, de
              relever des <span>défis techniques</span> et de
              collaborer avec des équipes talentueuses --
            </>
          )}
        </Prose>
      </PanelContent>

      <Collapsible>
        {visibleContent.map((item, idx) => (
          <ExperienceItem
            experience={item}
            isLast={idx === visibleContent.length - 1}
            key={item.id}
          />
        ))}

        {hasHidden && (
          <CollapsibleContent>
            {hiddenContent.map((item, idx) => (
              <ExperienceItem
                experience={item}
                isLast={idx === hiddenContent.length - 1}
                key={item.id}
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
                  {m.home_experiences_show_more()}
                </span>
                <span className="hidden group-data-[state=open]:inline">
                  {m.home_experiences_show_less()}
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
