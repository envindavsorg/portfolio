"use client";

import { useTheme } from "next-themes";
import { useRef } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import { Moon } from "@/components/motion/Moon";
import { Sun } from "@/components/motion/Sun";
import { Button } from "@/components/primitives/Button";
import { META_THEME_COLORS } from "@/data/theme";
import useMetaColor from "@/hooks/useMetaColor";
import { soundManager } from "@/lib/sound-manager";
import { m } from "@/paraglide/messages";

export const NavBarTheme = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const { setMetaColor } = useMetaColor();

  const sunIconRef = useRef<AnimatedIconHandle>(null);
  const moonIconRef = useRef<AnimatedIconHandle>(null);

  const switchTheme = () => {
    const isDark = resolvedTheme === "dark";
    soundManager.playThemeSound();
    setTheme(isDark ? "light" : "dark");
    setMetaColor(
      isDark ? META_THEME_COLORS.light : META_THEME_COLORS.dark
    );
  };

  const handleClick = () => {
    if (document.startViewTransition) {
      document.startViewTransition(switchTheme);
    } else {
      switchTheme();
    }
  };

  const handleMouseEnter = () => {
    sunIconRef.current?.startAnimation();
    moonIconRef.current?.startAnimation();
  };

  const handleMouseLeave = () => {
    sunIconRef.current?.stopAnimation();
    moonIconRef.current?.stopAnimation();
  };

  useHotkeys("alt+d", handleClick);

  return (
    <Button
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      size="icon"
      variant="outline"
    >
      <Moon
        className="hidden [html.dark_&]:block"
        ref={moonIconRef}
      />
      <Sun className="hidden [html.light_&]:block" ref={sunIconRef} />
      <span className="sr-only">{m.nav_theme_toggle()}</span>
    </Button>
  );
};
