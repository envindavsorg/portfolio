import { Divider } from "@/components/primitives/Divider";
import { Panel, PanelHeader } from "@/components/primitives/Panel";

import { BrandingColors } from "./BrandingColors";
import { BrandingMark } from "./BrandingMark";

interface BrandingSectionProps {
  label: string;
  children: React.ReactNode;
}

const BrandingSection = ({
  label,
  children,
}: BrandingSectionProps) => (
  <div className="grid grid-cols-[2rem_1fr]">
    <div className="flex items-center justify-center border-edge border-r bg-background sm:h-22">
      <span className="rotate-270 select-none text-muted-foreground text-xs sm:text-sm">
        {label}
      </span>
    </div>
    {children}
  </div>
);

export const Branding = () => (
  <Panel>
    <PanelHeader sticky title="mon branding" />
    <BrandingSection label="assets">
      <BrandingMark />
    </BrandingSection>
    <Divider border={false} type="half" />
    <BrandingSection label="couleurs">
      <BrandingColors />
    </BrandingSection>
  </Panel>
);
