"use client";

import Link from "next/link";
import { useRef } from "react";

import { GitHub } from "@/components/motion/GitHub";
import { Button } from "@/components/primitives/Button";
import GLOBAL_DATA from "@/data/global";
import { m } from "@/paraglide/messages";

export const NavBarGitHub = () => {
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
        aria-label={m.nav_github_aria()}
        href={GLOBAL_DATA.SOCIAL.github}
        rel="noopener noreferrer"
        target="_blank"
      >
        <GitHub ref={iconRef} />
        <span className="sr-only">{m.nav_github_aria()}</span>
      </Link>
    </Button>
  );
};
