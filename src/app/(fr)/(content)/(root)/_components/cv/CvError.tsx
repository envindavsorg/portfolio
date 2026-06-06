import type React from "react";
import { memo } from "react";

import { Prose } from "@/components/primitives/Typography";
import { m } from "@/paraglide/messages";
import { getLocale } from "@/paraglide/runtime";

interface CvErrorProps {
  children?: React.ReactNode;
  dateCreated?: string;
}

const CvError = memo(({ children }: CvErrorProps) => (
  <>
    <div className="flex flex-col items-center justify-center gap-y-2 py-8 text-center">
      <h3 className="font-semibold text-destructive text-xl leading-normal">
        {m.home_cv_error_title()}
      </h3>

      <Prose>{m.home_cv_error_message()}</Prose>

      {children}
    </div>

    <div className="flex h-10 items-center justify-between border-input border-t px-3">
      <p className="text-muted-foreground text-xs">[LOG]</p>
      <p className="text-xs">
        {getLocale() === "en"
          ? "error occurred at"
          : "erreur survenue à"}{" "}
        <span className="text-destructive">
          {new Date().toLocaleTimeString(
            getLocale() === "en" ? "en-US" : "fr-FR",
            {
              hour: "2-digit",
              minute: "2-digit",
            }
          )}
        </span>
      </p>
    </div>
  </>
));

CvError.displayName = "CurriculumVitaeError";

export { CvError };
