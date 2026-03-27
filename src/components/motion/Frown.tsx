"use client";

import { motion } from "motion/react";
import { forwardRef, useEffect } from "react";

import useAnimatedIcon from "@/hooks/useAnimatedIcon";

export const Frown = forwardRef<
  AnimatedIconHandle,
  AnimatedIconProps
>(
  (
    { onMouseEnter, onMouseLeave, className, size = 28, ...props },
    ref
  ) => {
    const { controls, handleMouseEnter, handleMouseLeave } =
      useAnimatedIcon(ref, onMouseEnter, onMouseLeave);

    useEffect(() => {
      const interval = setInterval(async () => {
        await controls.start("animate");
        await controls.start("normal");
      }, 5000);
      return () => clearInterval(interval);
    }, [controls]);

    return (
      <div
        className={className}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        <motion.svg
          animate={controls}
          aria-hidden="true"
          fill="none"
          height={size}
          initial="normal"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          variants={{
            animate: {
              rotate: [0, -2, 2, 0],
              scale: [1, 1.15, 1.05, 1.08],
              transition: {
                duration: 0.8,
                ease: "easeInOut",
                times: [0, 0.3, 0.6, 1],
              },
            },
            normal: {
              rotate: 0,
              scale: 1,
              transition: { duration: 0.3, ease: "easeOut" },
            },
          }}
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="12" cy="12" r="10" />
          <motion.path
            animate={controls}
            d="M16 16s-1.5-2-4-2-4 2-4 2"
            initial="normal"
            variants={{
              animate: {
                d: "M16 17s-1.5-2.5-4-2.5-4 2.5-4 2.5",
                pathLength: [0.3, 1, 1],
                transition: {
                  d: { duration: 0.5, ease: "easeOut" },
                  delay: 0.1,
                  pathLength: {
                    duration: 0.5,
                    ease: "easeInOut",
                    times: [0, 0.5, 1],
                  },
                },
              },
              normal: {
                d: "M16 16s-1.5-2-4-2-4 2-4 2",
                pathLength: 1,
                transition: { duration: 0.3, ease: "easeOut" },
              },
            }}
          />
          <motion.line
            animate={controls}
            initial="normal"
            variants={{
              animate: {
                scale: [1, 1.3, 0.9, 1.1],
                transition: {
                  duration: 0.6,
                  ease: "easeInOut",
                  times: [0, 0.3, 0.6, 1],
                },
                y: [0, -0.5, 0.3, 0],
              },
              normal: {
                scale: 1,
                transition: { duration: 0.3, ease: "easeOut" },
                y: 0,
              },
            }}
            x1="9"
            x2="9.01"
            y1="9"
            y2="9"
          />
          <motion.line
            animate={controls}
            initial="normal"
            variants={{
              animate: {
                scale: [1, 0.9, 1.3, 1.1],
                transition: {
                  duration: 0.6,
                  ease: "easeInOut",
                  times: [0, 0.3, 0.6, 1],
                },
                y: [0, -0.5, 0.3, 0],
              },
              normal: {
                scale: 1,
                transition: { duration: 0.3, ease: "easeOut" },
                y: 0,
              },
            }}
            x1="15"
            x2="15.01"
            y1="9"
            y2="9"
          />
        </motion.svg>
      </div>
    );
  }
);
