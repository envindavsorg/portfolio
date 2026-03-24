"use client";

import { motion } from "motion/react";
import { forwardRef } from "react";

import useAnimatedIcon from "@/hooks/useAnimatedIcon";

export const IdCard = forwardRef<
  AnimatedIconHandle,
  AnimatedIconProps
>(
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
            custom={2}
            d="M16 10h2"
            initial="normal"
            variants={{
              animate: (custom: number) => ({
                opacity: [0, 1],
                pathLength: [0, 1],
                transition: {
                  delay: custom * 0.1,
                  duration: 0.3,
                },
              }),
              normal: {
                opacity: 1,
                pathLength: 1,
              },
            }}
          />
          <motion.path
            animate={controls}
            custom={2}
            d="M16 14h2"
            initial="normal"
            variants={{
              animate: (custom: number) => ({
                opacity: [0, 1],
                pathLength: [0, 1],
                transition: {
                  delay: custom * 0.1,
                  duration: 0.3,
                },
              }),
              normal: {
                opacity: 1,
                pathLength: 1,
              },
            }}
          />
          <motion.path
            animate={controls}
            custom={0}
            d="M6.17 15a3 3 0 0 1 5.66 0"
            initial="normal"
            variants={{
              animate: (custom: number) => ({
                opacity: [0, 1],
                pathLength: [0, 1],
                transition: {
                  delay: custom * 0.1,
                  duration: 0.3,
                },
              }),
              normal: {
                opacity: 1,
                pathLength: 1,
              },
            }}
          />
          <motion.circle
            animate={controls}
            custom={1}
            cx="9"
            cy="11"
            initial="normal"
            r="2"
            variants={{
              animate: (custom: number) => ({
                opacity: [0, 1],
                pathLength: [0, 1],
                transition: {
                  delay: custom * 0.1,
                  duration: 0.3,
                },
              }),
              normal: {
                opacity: 1,
                pathLength: 1,
              },
            }}
          />
          <rect height="14" rx="2" width="20" x="2" y="5" />
        </svg>
      </div>
    );
  }
);
