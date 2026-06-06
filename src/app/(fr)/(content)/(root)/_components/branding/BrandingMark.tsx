import { CopyButton } from "@/components/primitives/Button";
import { m } from "@/paraglide/messages";

import {
  BrandingAssetMark,
  BrandingAssetMarkSVG,
} from "./BrandingAssets";

interface BrandingMarkItem {
  icon: React.ReactNode;
  label: () => string;
  value: () => string;
  copyValue: string;
}

const items: BrandingMarkItem[] = [
  {
    copyValue: BrandingAssetMarkSVG,
    icon: <BrandingAssetMark />,
    label: m.home_branding_mark_logo_label,
    value: m.home_branding_mark_logo_value,
  },
  {
    copyValue: "https://vercel.com/blog/introducing-geist-pixel",
    icon: "@",
    label: m.home_branding_mark_font_label,
    value: () => "Vercel - Geist Pixel",
  },
];

export const BrandingMark = () => (
  <div className="p-4 after:z-1 max-sm:flex max-sm:flex-col max-sm:space-y-4 sm:grid sm:grid-cols-2 sm:items-center sm:gap-x-12">
    {items.map((item) => (
      <div
        className="flex items-center justify-between gap-x-6"
        key={item.copyValue}
      >
        <div className="flex items-center gap-x-4">
          <div className="flex aspect-square size-10 items-center justify-center rounded-md text-4xl sm:size-12">
            {item.icon}
          </div>
          <div className="flex flex-col gap-y-1">
            <p className="text-muted-foreground text-xs">
              {item.label()}
            </p>
            <p className="text-sm">{item.value()}</p>
          </div>
        </div>
        <CopyButton value={item.copyValue} variant="ghost" />
      </div>
    ))}
  </div>
);
