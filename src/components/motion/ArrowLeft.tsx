"use client";

import { motion } from "motion/react";
import { forwardRef } from "react";

import useAnimatedIcon from "@/hooks/useAnimatedIcon";

export const ArrowLeft = forwardRef<
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
            initial="normal"
            variants={{
              animate: {
                d: "m12 19-7-7 7-7",
                transition: {
                  duration: 0.4,
                },
                translateX: [0, 3, 0],
              },
              normal: { d: "m12 19-7-7 7-7", translateX: 0 },
            }}
          />
          <motion.path
            animate={controls}
            initial="normal"
            variants={{
              animate: {
                d: ["M19 12H5", "M19 12H10", "M19 12H5"],
                transition: {
                  duration: 0.4,
                },
              },
              normal: { d: "M19 12H5" },
            }}
          />
        </svg>
      </div>
    );
  }
);
