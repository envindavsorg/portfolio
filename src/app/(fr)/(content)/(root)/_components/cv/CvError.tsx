import type React from "react";
import { memo } from "react";

import { Prose } from "@/components/primitives/Typography";
import type { SendCvFailureReason } from "@/hooks/useEmailForm";
import { getIntlLocale } from "@/lib/i18n";
import { m } from "@/paraglide/messages";

interface CvErrorProps {
  children?: React.ReactNode;
  dateCreated?: string;
  reason?: SendCvFailureReason;
}

const CvError = memo(
  ({ children, dateCreated, reason }: CvErrorProps) => {
    const occurredAt = dateCreated
      ? new Date(dateCreated)
      : new Date();
    const time = occurredAt.toLocaleTimeString(getIntlLocale(), {
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <>
        <div className="flex flex-col items-center justify-center gap-y-2 py-8 text-center">
          <h3 className="font-semibold text-destructive text-xl leading-normal">
            {m.home_cv_error_title()}
          </h3>

          <Prose>
            {reason === "rate_limited"
              ? m.home_cv_error_rate_limited()
              : m.home_cv_error_message()}
          </Prose>

          {children}
        </div>

        <div className="flex h-10 items-center justify-between border-input border-t px-3">
          <p className="text-muted-foreground text-xs">[LOG]</p>
          <p className="text-xs">
            <span className="text-destructive">
              {m.home_cv_error_log({ time })}
            </span>
          </p>
        </div>
      </>
    );
  }
);

CvError.displayName = "CurriculumVitaeError";

export { CvError };
