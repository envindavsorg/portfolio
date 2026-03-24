"use client";

import { motion } from "motion/react";
import { forwardRef } from "react";

import useAnimatedIcon from "@/hooks/useAnimatedIcon";

export const Copy = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  (
    { onMouseEnter, onMouseLeave, className, size = 28, ...props },
    ref
  ) => {
    const { controls, handleMouseEnter, handleMouseLeave } =
      useAnimatedIcon(ref, onMouseEnter, onMouseLeave);

    return (
      <div
        className={className}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        <svg
          aria-hidden="true"
          fill="none"
          height={size}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.rect
            animate={controls}
            height="14"
            rx="2"
            ry="2"
            transition={{
              damping: 17,
              mass: 1,
              stiffness: 160,
              type: "spring",
            }}
            variants={{
              animate: { translateX: -3, translateY: -3 },
              normal: { translateX: 0, translateY: 0 },
            }}
            width="14"
            x="8"
            y="8"
          />
          <motion.path
            animate={controls}
            d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"
            transition={{
              damping: 17,
              mass: 1,
              stiffness: 160,
              type: "spring",
            }}
            variants={{
              animate: { x: 3, y: 3 },
              normal: { x: 0, y: 0 },
            }}
          />
        </svg>
      </div>
    );
  }
);
