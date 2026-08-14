"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/primitives/Button";
import { getIntlLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface FooterClockProps {
  isActionnable?: boolean;
}

export const FooterClock = ({
  isActionnable = true,
}: FooterClockProps) => {
  const [time, setTime] = useState<Date | null>(null);
  const [is24Hour, setIs24Hour] = useState<boolean>(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );

  useEffect(() => {
    const savedPreference = localStorage.getItem("clock-format");
    if (savedPreference !== null) {
      setIs24Hour(savedPreference === "24h");
    }

    const tick = () => setTime(new Date());
    tick();

    const msUntilNextSecond = 1000 - (Date.now() % 1000);
    timeoutRef.current = setTimeout(() => {
      tick();
      intervalRef.current = setInterval(tick, 1000);
    }, msUntilNextSecond);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleFormatChange = useCallback((use24h: boolean) => {
    setIs24Hour(use24h);
    localStorage.setItem("clock-format", use24h ? "24h" : "12h");
  }, []);

  /**
   * Calculé à chaque rendu, sans `useMemo`.
   *
   * Le mémo précédent était mémorisé sur `[time?.getDate(), time?.getMonth(),
   * time?.getFullYear()]` — l'intention étant de ne pas reformater à chaque tic
   * de seconde. Mais il LIT aussi `isActionnable`, qui n'était pas dans les
   * dépendances : un changement de cette prop ne changeait pas la date affichée,
   * qui restait au format précédent jusqu'au lendemain. Latent en pratique
   * (c'est une prop fixée par l'appelant), faux quand même.
   *
   * Le mémo n'économisait de toute façon qu'un `toLocaleDateString` par seconde,
   * sur un composant qui se rerend à chaque seconde par construction — l'horloge
   * change. Le retirer supprime le piège sans rien coûter.
   */
  const formattedDate = time
    ? time.toLocaleDateString(getIntlLocale(), {
        day: "numeric",
        month: isActionnable ? "short" : "long",
        weekday: isActionnable ? "short" : "long",
        year: "numeric",
      })
    : "";

  if (!time) {
    return (
      <div
        className={cn(
          "text-balance",
          isActionnable && "text-sm tracking-tight",
          !isActionnable && "text-base"
        )}
      >
        00:00:00, dim. 00 janv. 0000
      </div>
    );
  }

  const hours = is24Hour
    ? time.getHours().toString().padStart(2, "0")
    : (time.getHours() % 12 || 12).toString().padStart(2, "0");
  const minutes = time.getMinutes().toString().padStart(2, "0");
  const seconds = time.getSeconds().toString().padStart(2, "0");
  let amPm = "";
  if (!is24Hour) {
    amPm = time.getHours() >= 12 ? " PM" : " AM";
  }

  return (
    <div
      className={cn(
        "screen-line-before screen-line-after",
        "mx-auto flex items-center max-sm:flex-col max-sm:gap-y-3",
        !isActionnable && "justify-center",
        isActionnable && "justify-between",
        "w-full border-edge border-x p-2 md:max-w-3xl"
      )}
    >
      <time
        className={cn(
          "text-balance",
          isActionnable && "text-sm tracking-tight",
          !isActionnable && "text-base"
        )}
        dateTime={time.toISOString()}
      >
        {hours}:{minutes}:{seconds}
        {amPm}, {formattedDate}
      </time>

      {isActionnable && (
        <div className="flex items-center">
          <Button
            aria-pressed={is24Hour}
            className={is24Hour ? "text-theme underline" : ""}
            onClick={() => handleFormatChange(true)}
            variant="link"
          >
            24h
          </Button>

          <Button
            aria-pressed={!is24Hour}
            className={is24Hour ? "" : "text-theme underline"}
            onClick={() => handleFormatChange(false)}
            variant="link"
          >
            12h
          </Button>
        </div>
      )}
    </div>
  );
};
