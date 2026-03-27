"use client";

import type { Variants } from "motion/react";
import { motion } from "motion/react";
import { forwardRef } from "react";

import useAnimatedIcon from "@/hooks/useAnimatedIcon";

const dotTransition = (custom: number) => ({
  opacity: {
    duration: 1.5,
    times: [
      0,
      0.1,
      0.1 + custom * 0.1,
      0.1 + custom * 0.1 + 0.1,
      0.5,
      0.6,
      0.6 + custom * 0.1,
      0.6 + custom * 0.1 + 0.1,
    ],
  },
});

const dotVariants: Variants = {
  animate: (custom: number) => ({
    opacity: [1, 0, 0, 1, 1, 0, 0, 1],
    transition: dotTransition(custom),
  }),
  normal: {
    opacity: 1,
  },
};

export const More = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
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
          strokeWidth="1.25"
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.circle
            animate={controls}
            custom={0}
            cx="6"
            cy="12"
            r="0.5"
            variants={dotVariants}
          />

          <motion.circle
            animate={controls}
            custom={1}
            cx="12"
            cy="12"
            r="0.5"
            variants={dotVariants}
          />

          <motion.circle
            animate={controls}
            custom={2}
            cx="18"
            cy="12"
            r="0.5"
            variants={dotVariants}
          />
        </svg>
      </div>
    );
  }
);
