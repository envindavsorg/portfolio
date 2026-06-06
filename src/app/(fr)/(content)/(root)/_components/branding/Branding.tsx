import { Divider } from "@/components/base/Divider";
import { Panel, PanelHeader } from "@/components/base/Panel";
import { m } from "@/paraglide/messages";

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
    <PanelHeader sticky title={m.home_branding_panel_title()} />
    <BrandingSection label={m.home_branding_section_assets()}>
      <BrandingMark />
    </BrandingSection>
    <Divider border={false} type="half" />
    <BrandingSection label={m.home_branding_section_colors()}>
      <BrandingColors />
    </BrandingSection>
  </Panel>
);
