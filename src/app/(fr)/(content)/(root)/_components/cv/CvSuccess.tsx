"use client";

import type React from "react";
import { memo } from "react";
import Confetti from "react-confetti";

import useMediaQuery from "@/hooks/useMediaQuery";
import { getIntlLocale } from "@/lib/i18n";
import { m } from "@/paraglide/messages";

interface CvSuccessProps {
  children?: React.ReactNode;
  dateCreated?: string;
}

export const CvSuccess = memo(
  ({ children, dateCreated }: CvSuccessProps) => {
    // `recycle` boucle indéfiniment : on ne l'impose pas à qui demande
    // explicitement moins d'animations.
    const prefersReducedMotion = useMediaQuery(
      "(prefers-reduced-motion: reduce)"
    );

    const sentAt = dateCreated ? new Date(dateCreated) : new Date();
    const time = sentAt.toLocaleTimeString(getIntlLocale(), {
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <>
        <div className="flex flex-col items-center justify-center gap-y-2 px-6 py-8 text-center">
          {!prefersReducedMotion && (
            <Confetti
              className="size-full"
              gravity={0.1}
              initialVelocityX={2}
              initialVelocityY={2}
              numberOfPieces={25}
              opacity={1}
              recycle
              run
              wind={0.01}
            />
          )}

          <h3 className="font-semibold text-lg text-theme leading-normal sm:text-xl">
            {m.home_cv_success_title()}
          </h3>

          <p className="text-sm leading-normal">
            {m.home_cv_success_message()}
          </p>

          {children}
        </div>

        <div className="flex h-10 items-center justify-between border-input border-t px-3">
          <p className="text-muted-foreground text-xs">[LOG]</p>
          <p className="text-xs">
            <span className="text-theme">
              {m.home_cv_success_log({ time })}
            </span>
          </p>
        </div>
      </>
    );
  }
);

CvSuccess.displayName = "CurriculumVitaeSuccess";
