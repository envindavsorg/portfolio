"use client";

import { Button } from "@/components/buttons/Button";
import { GitHubIcon } from "@/components/icons/GitHubIcon";
import GLOBAL_DATA from "@/content/data/global";
import Link from "next/link";
import { useRef } from "react";

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
        aria-label="Mon profil GitHub"
        href={GLOBAL_DATA.SOCIAL.github}
        rel="noopener noreferrer"
        target="_blank"
      >
        <GitHubIcon ref={iconRef} />
        <span className="sr-only">Mon profil GitHub</span>
      </Link>
    </Button>
  );
};
