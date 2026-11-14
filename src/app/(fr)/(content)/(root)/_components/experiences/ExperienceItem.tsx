import {
  CollapsibleChevronsIcon,
  CollapsibleContent,
  CollapsibleTrigger,
  CollapsibleWithContext,
} from "@/components/base/Collapsible";
import { Divider } from "@/components/base/Divider";
import { Badge } from "@/components/primitives/Badge";
import { PulsatingCircle } from "@/components/primitives/PulsatingCircle";
import { Tag } from "@/components/primitives/Tag";
import { cn } from "@/lib/utils";
import * as m from "@/paraglide/messages";

import { DescriptionCards } from "../shared/DescriptionCards";
import {
  ROW_CHEVRON,
  ROW_META,
  ROW_TITLE_HOVER,
} from "../shared/row";
import type { Experience } from "./content";

interface ExperienceItemProps {
  experience: Experience;
  isLast?: boolean;
}

export const ExperienceItem = ({
  experience,
  isLast = false,
}: ExperienceItemProps) => {
  const { description, skills } = experience;
  const { start, end } = experience.period;
  const isOngoing = !end;
  /**
   * Une formation n'a ni puces ni compétences : rien à déplier.
   *
   * Elle passait pourtant par `CollapsibleTrigger` — un `<button>` portant
   * `aria-expanded`, sans chevron, qui prenait le fond de survol et dont le clic
   * ouvrait un repli vide. Trois arrêts de tabulation pour rien. La rangée n'est
   * un bouton que si elle a quelque chose à montrer.
   */
  const details =
    description && skills ? { description, skills } : null;

  const heading = (
    <div className="flex items-center gap-x-3">
      {experience.isCurrentEmployer && <PulsatingCircle />}
      <h2
        className={cn(
          "text-start font-pixel-square text-base lowercase sm:text-xl",
          details && ROW_TITLE_HOVER
        )}
      >
        {experience.company}
      </h2>
    </div>
  );

  return (
    <CollapsibleWithContext>
      {details ? (
        <article className="group/row screen-line-before flex items-center hover:bg-accent2">
          <CollapsibleTrigger className="w-full cursor-pointer -outline-offset-2">
            <div className="flex w-full flex-1 items-center justify-between">
              <div className="w-full select-none border-edge border-r px-3 py-4">
                {heading}
              </div>
              <div className={ROW_CHEVRON}>
                <CollapsibleChevronsIcon />
              </div>
            </div>
          </CollapsibleTrigger>
        </article>
      ) : (
        <article className="screen-line-before px-3 py-4">
          {heading}
        </article>
      )}

      {/* sous `sm` l'ornement cède sa place : l'intitulé du poste — le fait le
        plus utile de la rangée — y était masqué faute de largeur, et il ne
        restait que « cdi » et les dates */}
      <div className={ROW_META}>
        <span className="shrink-0 text-theme max-sm:hidden">---</span>
        <div className="flex flex-1 flex-wrap items-center justify-end gap-2 sm:gap-x-4">
          {experience.type && (
            <Badge className="lowercase">{experience.type()}</Badge>
          )}
          {experience.title && (
            <Badge className="text-theme lowercase">
              {experience.title()}
            </Badge>
          )}
          <Badge className="lowercase">
            {start} -{" "}
            {isOngoing ? m.home_experiences_item_ongoing() : end}
          </Badge>
        </div>
      </div>

      {details && (
        <CollapsibleContent
          className={cn(
            "group overflow-hidden duration-300",
            "data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down"
          )}
        >
          <DescriptionCards items={details.description} />

          <div className="border-edge border-t p-3 duration-300 group-data-[state=closed]:animate-fade-out group-data-[state=open]:animate-fade-in">
            {details.skills.length > 0 && (
              <ul className="flex flex-wrap gap-1.5">
                {details.skills.map((skill) => (
                  <li className="flex" key={skill}>
                    <Tag>{skill}</Tag>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CollapsibleContent>
      )}

      {!isLast && (
        <Divider after={false} border={false} type="half" />
      )}
    </CollapsibleWithContext>
  );
};
