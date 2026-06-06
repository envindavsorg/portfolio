"use client";

import Link from "next/link";
import { useRef } from "react";

import { Llm } from "@/components/motion/Llm";
import { Button } from "@/components/primitives/Button";
import { m } from "@/paraglide/messages";

export const NavBarLlm = () => {
  const iconRef = useRef<AnimatedIconHandle>(null);

  return (
    <Button
      asChild
      onMouseEnter={() => iconRef.current?.startAnimation()}
      onMouseLeave={() => iconRef.current?.stopAnimation()}
      size="icon"
      variant="outline"
    >
      <Link
        aria-label={m.nav_llm_aria()}
        href="/llms.txt"
        rel="noopener noreferrer"
        target="_blank"
      >
        <Llm ref={iconRef} />
        <span className="sr-only">{m.nav_llm_aria()}</span>
      </Link>
    </Button>
  );
};
