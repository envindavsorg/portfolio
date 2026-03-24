import { CopyButton } from "@/components/primitives/Button";

const BRANDING_COLORS = [
  { hex: "#F3B993", label: "couleur principale" },
  { hex: "#FAD7C1", label: "couleur secondaire" },
] as const;

export const BrandingColors = () => (
  <div className="p-4 after:z-1 max-sm:flex max-sm:flex-col max-sm:space-y-4 sm:grid sm:grid-cols-2 sm:items-center sm:gap-x-12">
    {BRANDING_COLORS.map(({ label, hex }) => (
      <div
        className="flex items-center justify-between gap-x-6"
        key={hex}
      >
        <div className="flex items-center gap-x-4">
          <div
            className="aspect-square size-10 rounded-md sm:size-12"
            style={{ backgroundColor: hex }}
          />
          <div className="flex flex-col gap-y-1">
            <p className="text-muted-foreground text-xs">{label}</p>
            <p className="text-sm">{hex}</p>
          </div>
        </div>
        <CopyButton value={hex} variant="ghost" />
      </div>
    ))}
  </div>
);
