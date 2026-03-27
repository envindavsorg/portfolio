import { Divider } from "@/components/base/Divider";
import {
  CollapsibleChevronsIcon,
  CollapsibleContent,
  CollapsibleTrigger,
  CollapsibleWithContext,
} from "@/components/primitives/Collapsible";
import { Tag } from "@/components/primitives/Tag";
import { Prose } from "@/components/primitives/Typography";
import { cn } from "@/lib/utils";

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
    <article className="screen-line-before flex items-center hover:bg-accent2">
      <CollapsibleTrigger className="w-full cursor-pointer">
        <div className="flex w-full flex-1 items-center justify-between">
          <div className="w-full select-none border-edge border-r p-4">
            <h2 className="text-start font-pixel-square text-base lowercase sm:text-xl">
              {project.name}{" "}
              <span className="font-normal text-theme text-xs">
                ({project.type})
              </span>
            </h2>
          </div>
          <div className="relative m-4 flex size-6 shrink-0 items-center justify-center sm:size-8">
            <CollapsibleChevronsIcon />
          </div>
        </div>
      </CollapsibleTrigger>
    </article>

    <div className="screen-line-before flex items-center justify-between gap-2 px-2 py-2 sm:gap-4 sm:px-4">
      <span className="text-theme max-sm:hidden">---</span>
      <Prose className="lowercase">{project.title}</Prose>
    </div>

    <CollapsibleContent
      className={cn(
        "group overflow-hidden duration-300",
        "data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down"
      )}
    >
      <div
        className={cn(
          "grid auto-rows-[120px] grid-cols-1 gap-4 border-edge border-t p-4 duration-300 md:grid-cols-3",
          "group-data-[state=closed]:animate-fade-out group-data-[state=open]:animate-fade-in"
        )}
      >
        {project.description.map((text, idx) => {
          const isWide =
            idx === 0 || idx === 3 || idx === 4 || idx === 7;

          return (
            <div
              className={cn(
                "group relative flex flex-col justify-between overflow-hidden rounded-xl border border-input bg-background p-4",
                isWide ? "md:col-span-2" : "md:col-span-1"
              )}
              key={text}
            >
              <span className="absolute -top-2 -right-1 select-none font-bold text-[3rem] text-theme leading-none tracking-tighter opacity-[0.3] transition-opacity duration-300">
                {idx + 1}
              </span>
              <div className="z-10 flex items-center gap-2">
                <span className="flex h-6 items-center justify-center rounded-full bg-theme/10 px-2.5 font-bold text-[10px] text-theme">
                  {(idx + 1).toString().padStart(2, "0")}
                </span>
                <div className="h-px w-8 bg-theme" />
              </div>
              <Prose className="z-10">{text}</Prose>
              <div className="pointer-events-none absolute inset-0 bg-linear-to-tr from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </div>
          );
        })}
      </div>

      <div className="border-edge border-t p-4 duration-300 group-data-[state=closed]:animate-fade-out group-data-[state=open]:animate-fade-in">
        {project.skills.length > 0 && (
          <ul className="flex flex-wrap gap-1.5">
            {project.skills.map((skill, index) => (
              <li className="flex" key={index + skill}>
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
