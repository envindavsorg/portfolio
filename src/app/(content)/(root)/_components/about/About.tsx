"use client";

import { useCallback, useRef, useState } from "react";

import {
  Panel,
  PanelFooter,
  PanelHeader,
} from "@/components/base/Panel";
import { ChevronDown } from "@/components/motion/ChevronDown";
import { ChevronUp } from "@/components/motion/ChevronUp";
import { Button } from "@/components/primitives/Button";

import { AboutContent } from "./AboutContent";

export const About = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const toggleExpanded = useCallback(
    () => setIsExpanded((prev) => !prev),
    []
  );

  const iconRef = useRef<AnimatedIconHandle>(null);
  const handleMouseEnter = () => iconRef.current?.startAnimation();
  const handleMouseLeave = () => iconRef.current?.stopAnimation();

  return (
    <Panel>
      <PanelHeader sticky title="quelques mots sur moi" />

      <AboutContent expanded={isExpanded} />

      <PanelFooter>
        <Button
          aria-controls="about-content-expanded"
          aria-expanded={isExpanded}
          onClick={toggleExpanded}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          variant="outline"
        >
          {isExpanded ? "réduire le texte" : "en savoir plus"}
          {isExpanded ? (
            <ChevronUp ref={iconRef} />
          ) : (
            <ChevronDown ref={iconRef} />
          )}
        </Button>
      </PanelFooter>
    </Panel>
  );
};
