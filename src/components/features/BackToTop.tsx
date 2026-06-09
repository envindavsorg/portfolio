"use client";

import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "motion/react";
import { useState } from "react";

import { Button } from "@/components/primitives/Button";
import useAnimatedRef from "@/hooks/useAnimatedRef";
import { m } from "@/paraglide/messages";

import { ChevronUp } from "../motion/ChevronUp";

const SCROLL_THRESHOLD = 600;

export const BackToTop = () => {
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState(false);
  const chevron = useAnimatedRef();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setVisible(latest > SCROLL_THRESHOLD);
  });

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="fixed right-4 bottom-4 z-40 sm:right-6 sm:bottom-6"
          exit={{ opacity: 0, y: 16 }}
          initial={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.2 }}
        >
          <Button
            aria-label={m.back_to_top_aria()}
            className="bg-background/80 backdrop-blur-sm"
            onClick={() =>
              window.scrollTo({ behavior: "smooth", top: 0 })
            }
            onMouseEnter={chevron.handleMouseEnter}
            onMouseLeave={chevron.handleMouseLeave}
            size="icon"
            variant="outline"
          >
            <ChevronUp ref={chevron.ref} />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
