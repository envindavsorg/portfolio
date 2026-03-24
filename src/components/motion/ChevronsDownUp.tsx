"use client";

import { motion } from "motion/react";
import { forwardRef } from "react";

import useAnimatedIcon from "@/hooks/useAnimatedIcon";

export const ChevronsDownUp = forwardRef<
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
            d="m7 20 5-5 5 5"
            initial="normal"
            transition={{
              damping: 25,
              stiffness: 250,
              type: "spring",
            }}
            variants={{
              animate: { translateY: "-2px" },
              normal: { translateY: "0%" },
            }}
          />
          <motion.path
            animate={controls}
            d="m7 4 5 5 5-5"
            initial="normal"
            transition={{
              damping: 25,
              stiffness: 250,
              type: "spring",
            }}
            variants={{
              animate: { translateY: "2px" },
              normal: { translateY: "0%" },
            }}
          />
        </svg>
      </div>
    );
  }
);
