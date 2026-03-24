"use client";

import { motion } from "motion/react";
import { forwardRef } from "react";

import useAnimatedIcon from "@/hooks/useAnimatedIcon";

export const Link = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
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
            d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
            variants={{
              animate: {
                pathLength: [1, 0.97, 1, 0.97, 1],
                pathOffset: [0, 0.05, 0, 0.05, 0],
                rotate: [0, -5, 0],
                transition: {
                  duration: 1,
                  ease: "easeInOut",
                  rotate: {
                    duration: 0.5,
                  },
                  times: [0, 0.2, 0.4, 0.6, 1],
                },
              },
              initial: { pathLength: 1, pathOffset: 0, rotate: 0 },
            }}
          />
          <motion.path
            animate={controls}
            d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
            variants={{
              animate: {
                pathLength: [1, 0.97, 1, 0.97, 1],
                pathOffset: [0, 0.05, 0, 0.05, 0],
                rotate: [0, -5, 0],
                transition: {
                  duration: 1,
                  ease: "easeInOut",
                  rotate: {
                    duration: 0.5,
                  },
                  times: [0, 0.2, 0.4, 0.6, 1],
                },
              },
              initial: { pathLength: 1, pathOffset: 0, rotate: 0 },
            }}
          />
        </svg>
      </div>
    );
  }
);
