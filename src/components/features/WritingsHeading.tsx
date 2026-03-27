import { PanelContent } from "../base/Panel";
import { PixelHeading } from "../blocks/PixelHeading";
import { Prose } from "../primitives/Typography";

interface WritingsHeadingProps {
  title: string;
  description: string;
}

export const WritingsHeading = ({
  title,
  description,
}: WritingsHeadingProps) => (
  <>
    <PixelHeading
      autoPlay
      className="text-3xl sm:text-4xl px-3 py-1 text-theme"
      mode="multi"
    >
      {title}
    </PixelHeading>
    <PanelContent reset className="screen-line-before px-3 py-1.5">
      <Prose>-- {description} --</Prose>
    </PanelContent>
  </>
);
