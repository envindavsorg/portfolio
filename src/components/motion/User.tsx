"use client";

import { motion } from "motion/react";
import { forwardRef } from "react";

import useAnimatedIcon from "@/hooks/useAnimatedIcon";

export const User = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
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
          <motion.circle
            animate={controls}
            cx="12"
            cy="8"
            r="5"
            variants={{
              animate: {
                pathLength: [0, 1],
                pathOffset: [1, 0],
                scale: [0.5, 1],
              },
              normal: {
                pathLength: 1,
                pathOffset: 0,
                scale: 1,
              },
            }}
          />

          <motion.path
            animate={controls}
            d="M20 21a8 8 0 0 0-16 0"
            transition={{
              delay: 0.2,
              duration: 0.4,
            }}
            variants={{
              animate: {
                opacity: [0, 1],
                pathLength: [0, 1],
                pathOffset: [1, 0],
              },
              normal: { opacity: 1, pathLength: 1, pathOffset: 0 },
            }}
          />
        </svg>
      </div>
    );
  }
);
