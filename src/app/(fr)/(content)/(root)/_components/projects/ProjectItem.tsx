import {
  CollapsibleChevronsIcon,
  CollapsibleContent,
  CollapsibleTrigger,
  CollapsibleWithContext,
} from "@/components/base/Collapsible";
import { Divider } from "@/components/base/Divider";
import { Tag } from "@/components/primitives/Tag";
import { Prose } from "@/components/primitives/Typography";
import { cn } from "@/lib/utils";

import { DescriptionCards } from "../shared/DescriptionCards";
import {
  ROW_CHEVRON,
  ROW_META,
  ROW_TITLE_HOVER,
} from "../shared/row";
import type { Project } from "./content";

interface ProjectItemProps {
  project: Project;
  isLast?: boolean;
}

export const ProjectItem = ({
  project,
  isLast = false,
}: ProjectItemProps) => (
  <CollapsibleWithContext>
    <article className="group/row screen-line-before flex items-center hover:bg-accent2">
      <CollapsibleTrigger className="w-full cursor-pointer -outline-offset-2">
        <div className="flex w-full flex-1 items-center justify-between">
          <div className="w-full select-none border-edge border-r px-3 py-4">
            <h2
              className={cn(
                "text-start font-pixel-square text-base lowercase sm:text-xl",
                ROW_TITLE_HOVER
              )}
            >
              {project.name}{" "}
              <span className="font-normal text-theme text-xs">
                ({project.type()})
              </span>
            </h2>
          </div>
          <div className={ROW_CHEVRON}>
            <CollapsibleChevronsIcon />
          </div>
        </div>
      </CollapsibleTrigger>
    </article>

    <div className={ROW_META}>
      <span className="shrink-0 text-theme max-sm:hidden">---</span>
      <Prose className="lowercase">{project.title()}</Prose>
    </div>

    <CollapsibleContent
      className={cn(
        "group overflow-hidden duration-300",
        "data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down"
      )}
    >
      <DescriptionCards items={project.description} />

      <div className="border-edge border-t p-3 duration-300 group-data-[state=closed]:animate-fade-out group-data-[state=open]:animate-fade-in">
        {project.skills.length > 0 && (
          <ul className="flex flex-wrap gap-1.5">
            {project.skills.map((skill) => (
              <li className="flex" key={skill}>
                <Tag>{skill}</Tag>
              </li>
            ))}
          </ul>
        )}
      </div>
    </CollapsibleContent>

    {!isLast && <Divider after={false} border={false} type="half" />}
  </CollapsibleWithContext>
);
