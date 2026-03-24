"use client";

import { motion } from "motion/react";
import { forwardRef } from "react";

import useAnimatedIcon from "@/hooks/useAnimatedIcon";

export const AudioLines = forwardRef<
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
          <path d="M2 10v3" />
          <motion.path
            animate={controls}
            d="M6 6v11"
            variants={{
              animate: {
                d: ["M6 6v11", "M6 10v3", "M6 6v11"],
                transition: {
                  duration: 1.5,
                  repeat: Number.POSITIVE_INFINITY,
                },
              },
              normal: { d: "M6 6v11" },
            }}
          />
          <motion.path
            animate={controls}
            d="M10 3v18"
            variants={{
              animate: {
                d: ["M10 3v18", "M10 9v5", "M10 3v18"],
                transition: {
                  duration: 1,
                  repeat: Number.POSITIVE_INFINITY,
                },
              },
              normal: { d: "M10 3v18" },
            }}
          />
          <motion.path
            animate={controls}
            d="M14 8v7"
            variants={{
              animate: {
                d: ["M14 8v7", "M14 6v11", "M14 8v7"],
                transition: {
                  duration: 0.8,
                  repeat: Number.POSITIVE_INFINITY,
                },
              },
              normal: { d: "M14 8v7" },
            }}
          />
          <motion.path
            animate={controls}
            d="M18 5v13"
            variants={{
              animate: {
                d: ["M18 5v13", "M18 7v9", "M18 5v13"],
                transition: {
                  duration: 1.5,
                  repeat: Number.POSITIVE_INFINITY,
                },
              },
              normal: { d: "M18 5v13" },
            }}
          />
          <path d="M22 10v3" />
        </svg>
      </div>
    );
  }
);
