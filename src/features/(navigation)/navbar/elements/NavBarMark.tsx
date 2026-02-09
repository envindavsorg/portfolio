"use client";

import { useMotionValueEvent, useScroll } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ComponentProps, forwardRef, useEffect, useRef } from "react";

const StaticMark = forwardRef<SVGSVGElement, ComponentProps<"svg">>(
  (props, ref) => (
    <svg
      fill="none"
      height="26"
      ref={ref}
      viewBox="0 0 39 26"
      width="39"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        className="stroke-foreground"
        d="M30 1H34C36.2091 1 38 2.79086 38 5C38 7.20914 36.2091 9 34 9H30V1Z"
        strokeWidth="1.25"
      />
      <path
        className="stroke-foreground"
        d="M22 13C22 10.7909 23.7909 9 26 9H30V17H26C23.7909 17 22 15.2091 22 13Z"
        strokeWidth="1.25"
      />
      <path
        className="stroke-foreground"
        d="M22 5C22 2.79086 23.7909 1 26 1H30V9H26C23.7909 9 22 7.20914 22 5Z"
        strokeWidth="1.25"
      />
      <path
        className="stroke-theme"
        d="M30 13C30 10.7909 31.7909 9 34 9C36.2091 9 38 10.7909 38 13C38 15.2091 36.2091 17 34 17C31.7909 17 30 15.2091 30 13Z"
        strokeWidth="1.25"
      />
      <path
        className="stroke-foreground"
        d="M22 21C22 18.7909 23.7909 17 26 17H30V21C30 23.2091 28.2091 25 26 25C23.7909 25 22 23.2091 22 21Z"
        strokeWidth="1.25"
      />
      <path
        className="stroke-foreground"
        d="M9 17H17V19C17 22.3137 14.3137 25 11 25H9V17Z"
        strokeWidth="1.25"
      />
      <path
        className="stroke-foreground"
        d="M1 7C1 3.68629 3.68629 1 7 1H9V9H1V7Z"
        strokeWidth="1.25"
      />
      <path
        className="stroke-foreground"
        d="M9 1H11C14.3137 1 17 3.68629 17 7V9H9V1Z"
        strokeWidth="1.25"
      />
      <path
        className="stroke-theme"
        d="M1 13C1 10.7909 2.79086 9 5 9C7.20914 9 9 10.7909 9 13C9 15.2091 7.20914 17 5 17C2.79086 17 1 15.2091 1 13Z"
        strokeWidth="1.25"
      />
      <path
        className="stroke-foreground"
        d="M1 17H9V25H7C3.68629 25 1 22.3137 1 19V17Z"
        strokeWidth="1.25"
      />
    </svg>
  ),
);

const MotionMark = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const triggerDistanceRef = useRef(160);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    svgRef.current?.toggleAttribute(
      "data-visible",
      latest >= triggerDistanceRef.current,
    );
  });

  useEffect(() => {
    const target = document.getElementById("js-cover-mark");
    if (!target) {
      return;
    }

    const updateDistance = () => {
      const rect = target.getBoundingClientRect();
      const scrollTop = document.documentElement.scrollTop;
      triggerDistanceRef.current = scrollTop + rect.top + rect.height - 56;
    };

    updateDistance();

    const observer = new ResizeObserver(updateDistance);
    observer.observe(target);

    return () => observer.disconnect();
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      aria-label="Retour en haut de la page"
      className="cursor-pointer transition-opacity hover:opacity-80"
      onClick={handleScrollToTop}
      type="button"
    >
      <StaticMark
        className="translate-y-2 opacity-0 transition-all duration-300 data-visible:translate-y-0 data-visible:opacity-100"
        ref={svgRef}
      />
    </button>
  );
};

export const NavBarMark = () => {
  const pathname = usePathname();

  return (
    <div className="flex shrink-0 items-center">
      {pathname === "/" ? (
        <MotionMark />
      ) : (
        <Link aria-label="Retour à l'accueil" href="/public">
          <StaticMark />
        </Link>
      )}
    </div>
  );
};
