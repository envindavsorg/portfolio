"use client";

import { motion } from "motion/react";
import { forwardRef } from "react";

import useAnimatedIcon from "@/hooks/useAnimatedIcon";

export const Layers = forwardRef<
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
          <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
          <motion.path
            animate={controls}
            d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"
            transition={{
              damping: 14,
              mass: 1,
              stiffness: 100,
              type: "spring",
            }}
            variants={{
              firstState: { y: -9 },
              normal: { y: 0 },
              secondState: { y: 0 },
            }}
          />
          <motion.path
            animate={controls}
            d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"
            transition={{
              damping: 14,
              mass: 1,
              stiffness: 100,
              type: "spring",
            }}
            variants={{
              firstState: { y: -5 },
              normal: { y: 0 },
              secondState: { y: 0 },
            }}
          />
        </svg>
      </div>
    );
  }
);
