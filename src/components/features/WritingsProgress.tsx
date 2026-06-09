"use client";

import { motion, useScroll, useSpring } from "motion/react";

export const WritingsProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    damping: 30,
    restDelta: 0.001,
    stiffness: 200,
  });

  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-theme"
      style={{ scaleX }}
    />
  );
};
