import type { ReactNode } from "react";

import { PanelContent } from "../base/Panel";
import { PixelHeading } from "../blocks/PixelHeading";
import { Prose } from "../primitives/Typography";

interface WritingsHeadingProps {
  title: string;
  description: string;
  meta?: ReactNode;
}

export const WritingsHeading = ({
  title,
  description,
  meta,
}: WritingsHeadingProps) => (
  <>
    <div className="flex w-full items-center justify-between gap-x-3 pr-3">
      <PixelHeading
        autoPlay
        className="text-3xl sm:text-4xl px-3 py-1 text-theme"
        mode="multi"
      >
        {title}
      </PixelHeading>
      {meta}
    </div>
    <PanelContent reset className="screen-line-before px-3 py-1.5">
      <Prose>-- {description} --</Prose>
    </PanelContent>
  </>
);
