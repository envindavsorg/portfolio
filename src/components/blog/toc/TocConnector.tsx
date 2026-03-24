import { cn } from "@/lib/utils";

interface TocConnectorProps {
  direction: "up" | "down";
}

export const TocConnector = ({ direction }: TocConnectorProps) => (
  <div
    className={cn(
      "h-3 w-4 border-input border-b",
      direction === "down"
        ? "rounded-bl-xl border-l"
        : "rounded-br-xl border-r"
    )}
  />
);
