"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/primitives/Button";
import { getIntlLocale } from "@/lib/i18n";
import { readStorage, writeStorage } from "@/lib/safe-storage";
import { cn } from "@/lib/utils";

interface FooterClockProps {
  isActionnable?: boolean;
}

export const FooterClock = ({
  isActionnable = true,
}: FooterClockProps) => {
  const [time, setTime] = useState<Date | null>(null);
  const [is24Hour, setIs24Hour] = useState<boolean>(true);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // `readStorage`, pas `localStorage.getItem` : stockage du site bloqué, la
    // lecture lève, et cet effet remplaçait chaque page par l'écran d'erreur
    const savedPreference = readStorage("clock-format");
    if (savedPreference !== null) {
      setIs24Hour(savedPreference === "24h");
    }

    let timeout: ReturnType<typeof setTimeout> | null = null;
    let interval: ReturnType<typeof setInterval> | null = null;
    let isIntersecting = false;

    const tick = () => setTime(new Date());

    const stop = () => {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };

    const start = () => {
      stop();
      // l'heure a continué sans nous : la remettre juste avant de repartir
      tick();
      timeout = setTimeout(
        () => {
          tick();
          interval = setInterval(tick, 1000);
        },
        1000 - (Date.now() % 1000)
      );
    };

    /**
     * L'horloge ne bat que si on peut la LIRE.
     *
     * Elle est tout en bas de chaque page et se rerendait chaque seconde quoi
     * qu'il arrive — pied de page hors de l'écran, onglet en arrière-plan.
     * C'était la seule activité qui restait sur un article au repos.
     */
    const sync = () => {
      if (isIntersecting && !document.hidden) {
        start();
      } else {
        stop();
      }
    };

    // remplace tout de suite le gabarit, même si le pied de page est loin
    tick();

    // Le DERNIER changement du lot : fil principal occupé, « à l'écran »
    // puis « hors écran » arrivent dans un même rappel. Lire le premier
    // relançait l'horloge sur un pied de page qui venait de sortir, et elle
    // battait alors chaque seconde, sans fin, là où personne ne la lit.
    const observer = new IntersectionObserver((entries) => {
      isIntersecting = entries.at(-1)?.isIntersecting ?? false;
      sync();
    });
    if (rootRef.current) {
      observer.observe(rootRef.current);
    }
    document.addEventListener("visibilitychange", sync);

    return () => {
      stop();
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  const handleFormatChange = useCallback((use24h: boolean) => {
    setIs24Hour(use24h);
    writeStorage("clock-format", use24h ? "24h" : "12h");
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
        ref={rootRef}
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
        // `px-3` : la gouttière de la colonne, celle des titres et des lignes.
        // `p-2` faisait démarrer l'heure 4 px trop à gauche.
        "w-full border-edge border-x px-3 py-2 md:max-w-3xl"
      )}
      ref={rootRef}
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
