import { CaretDownIcon } from "@phosphor-icons/react/ssr";

import { Button } from "@/components/primitives/Button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/primitives/Collapsible";
import {
  Panel,
  PanelContent,
  PanelFooter,
  PanelHeader,
} from "@/components/primitives/Panel";
import { Prose } from "@/components/primitives/Typography";

import { EXPERIENCES } from "./content";
import { ExperienceItem } from "./ExperienceItem";

const VISIBLE_COUNT = 3;

export const Experiences = () => {
  const visibleContent = EXPERIENCES.slice(0, VISIBLE_COUNT);
  const hiddenContent = EXPERIENCES.slice(VISIBLE_COUNT);
  const hasHidden = hiddenContent.length > 0;

  return (
    <Panel>
      <PanelHeader sticky title="mes expériences pro" />

      <PanelContent>
        <Prose>
          -- retour sur <i>mon parcours professionnel</i> et les
          expériences qui m'ont permis de grandir en tant que{" "}
          <span>développeur Front-End</span>, puis{" "}
          <span>Full-Stack</span> --
        </Prose>
        <Prose>
          -- ensemble, ces <span>expériences</span> constituent le
          socle de mes compétences actuelles et reflètent ma passion
          pour la création de solutions web innovantes et performantes
          --
        </Prose>
        <Prose>
          -- de la <span>refonte d'applications</span> à grande
          échelle à l'intégration de fonctionnalités complexes, chaque
          poste a été une opportunité d'apprendre, de relever des{" "}
          <span>défis techniques</span> et de collaborer avec des
          équipes talentueuses --
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
                  afficher plus
                </span>
                <span className="hidden group-data-[state=open]:inline">
                  afficher moins
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
