"use client";

import { motion } from "motion/react";
import { forwardRef } from "react";

import useAnimatedIcon from "@/hooks/useAnimatedIcon";

export const Llm = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
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
            custom={0}
            height="8"
            initial="normal"
            rx="2"
            variants={{
              animate: (custom: number) => ({
                opacity: [0, 1],
                pathLength: [0, 1],
                transition: {
                  delay: 0.1 * custom,
                  transition: {
                    duration: 0.3,
                    opacity: { delay: 0.15 },
                  },
                },
              }),
              normal: {
                opacity: 1,
                pathLength: 1,
              },
            }}
            width="8"
            x="3"
            y="3"
          />
          <motion.path
            animate={controls}
            custom={3}
            d="M7 11v4a2 2 0 0 0 2 2h4"
            initial="normal"
            variants={{
              animate: (custom: number) => ({
                opacity: [0, 1],
                pathLength: [0, 1],
                transition: {
                  delay: 0.1 * custom,
                  transition: {
                    duration: 0.3,
                    opacity: { delay: 0.15 },
                  },
                },
              }),
              normal: {
                opacity: 1,
                pathLength: 1,
              },
            }}
          />
          <motion.rect
            animate={controls}
            custom={0}
            height="8"
            initial="normal"
            rx="2"
            variants={{
              animate: (custom: number) => ({
                opacity: [0, 1],
                pathLength: [0, 1],
                transition: {
                  delay: 0.1 * custom,
                  transition: {
                    duration: 0.3,
                    opacity: { delay: 0.15 },
                  },
                },
              }),
              normal: {
                opacity: 1,
                pathLength: 1,
              },
            }}
            width="8"
            x="13"
            y="13"
          />
        </svg>
      </div>
    );
  }
);
