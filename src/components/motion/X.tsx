"use client";

import { motion } from "motion/react";
import { forwardRef } from "react";

import useAnimatedIcon from "@/hooks/useAnimatedIcon";

export const X = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
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
          <motion.path
            animate={controls}
            d="M18 6 6 18"
            initial="normal"
            variants={{
              animate: { opacity: [0, 1], pathLength: [0, 1] },
              normal: { opacity: 1, pathLength: 1 },
            }}
          />
          <motion.path
            animate={controls}
            d="m6 6 12 12"
            initial="normal"
            transition={{ delay: 0.2 }}
            variants={{
              animate: { opacity: [0, 1], pathLength: [0, 1] },
              normal: { opacity: 1, pathLength: 1 },
            }}
          />
        </svg>
      </div>
    );
  }
);
