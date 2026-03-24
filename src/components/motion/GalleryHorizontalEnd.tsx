"use client";

import { motion } from "motion/react";
import { forwardRef } from "react";

import useAnimatedIcon from "@/hooks/useAnimatedIcon";

export const GalleryHorizontalEnd = forwardRef<
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
            d="M6 5v14"
            variants={{
              animate: (i: number) => ({
                opacity: [0, 1],
                transition: {
                  damping: 13,
                  delay: 0.25 * (2 - i),
                  stiffness: 200,
                  type: "tween",
                },
                translateX: [2 * i, 0],
              }),
              normal: {
                opacity: 1,
                transition: {
                  damping: 13,
                  stiffness: 200,
                  type: "tween",
                },
                translateX: 0,
              },
            }}
          />
          <motion.path
            animate={controls}
            custom={1}
            d="M2 7v10"
            variants={{
              animate: (i: number) => ({
                opacity: [0, 1],
                transition: {
                  damping: 13,
                  delay: 0.25 * (2 - i),
                  stiffness: 200,
                  type: "tween",
                },
                translateX: [2 * i, 0],
              }),
              normal: {
                opacity: 1,
                transition: {
                  damping: 13,
                  stiffness: 200,
                  type: "tween",
                },
                translateX: 0,
              },
            }}
          />
          <rect height="18" rx="2" width="12" x="10" y="3" />
        </svg>
      </div>
    );
  }
);
