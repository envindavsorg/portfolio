"use client";

import { motion } from "motion/react";
import { forwardRef } from "react";

import useAnimatedIcon from "@/hooks/useAnimatedIcon";

export const Play = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
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
        <motion.svg
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
          <motion.polygon
            animate={controls}
            points="6 3 20 12 6 21 6 3"
            variants={{
              animate: {
                rotate: [0, -10, 0, 0],
                transition: {
                  damping: 20,
                  duration: 0.5,
                  stiffness: 260,
                  times: [0, 0.2, 0.5, 1],
                },
                x: [0, -1, 2, 0],
              },
              normal: { rotate: 0, x: 0 },
            }}
          />
        </motion.svg>
      </div>
    );
  }
);
