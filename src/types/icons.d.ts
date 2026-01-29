import type { HTMLAttributes } from "react";

declare global {
  interface AnimatedIconHandle {
    startAnimation: () => void;
    stopAnimation: () => void;
  }

  interface AnimatedIconProps extends HTMLAttributes<HTMLDivElement> {
    size?: number;
  }
}
