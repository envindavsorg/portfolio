"use client";

import Link from "next/link";
import { useRef } from "react";
import { Button } from "@/components/buttons/Button";
import { RssIcon } from "@/components/icons/RssIcon";

export const NavBarRss = () => {
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
        aria-label="Flux RSS"
        href="/api/rss"
        rel="noopener noreferrer"
        target="_blank"
      >
        <RssIcon ref={iconRef} />
        <span className="sr-only">Flux RSS</span>
      </Link>
    </Button>
  );
};
