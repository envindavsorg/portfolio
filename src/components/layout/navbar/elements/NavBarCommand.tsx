"use client";

import type { MouseEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Search } from "@/components/motion/Search";
import { Button } from "@/components/primitives/Button";
import useMediaQuery from "@/hooks/useMediaQuery";
import { prefetchSearchIndex } from "@/hooks/useSearchIndex";
import * as m from "@/paraglide/messages";

import { NavBarTooltip } from "./NavBarTooltip";

type PanelModule = typeof import("./NavBarCommandPanel");

const HINT_TOAST = "command-hint";

let pending: Promise<PanelModule> | undefined;

/**
 * Le panneau de la palette, chargé à la demande.
 *
 * cmdk, le classement de `lib/search.ts`, le tiroir et la feuille des
 * raccourcis voyageaient dans le JavaScript de CHAQUE page, pour une palette
 * que la plupart des visites n'ouvrent pas. L'`import()` est écrit ici, dans
 * du code client : c'est le seul endroit où il découpe un chunk (la leçon de
 * `UtilWidget.tsx`).
 *
 * Un échec — hors ligne, ou un chunk disparu après un déploiement — ne lève
 * rien et n'est pas gardé : la promesse rejetée est oubliée, et la tentative
 * suivante refait la demande. Une seule demande vole à la fois, quel que soit
 * le nombre de signaux d'intention reçus.
 */
const loadPanel = async (): Promise<PanelModule | undefined> => {
  pending ??= import("./NavBarCommandPanel");
  const attempt = pending;

  try {
    return await attempt;
  } catch {
    if (pending === attempt) {
      pending = undefined;
    }
    return undefined;
  }
};

export const NavBarCommand = () => {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [panel, setPanel] = useState<PanelModule | null>(null);
  const [open, setOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [openedByKeyboard, setOpenedByKeyboard] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  /**
   * `open` et `shortcutsOpen` disent ce qui est DEMANDÉ ; le panneau n'est
   * rendu qu'une fois arrivé. Une ouverture demandée avant lui est donc tenue,
   * pas perdue : elle s'affiche au montage.
   *
   * `wanted` est le signal d'intention qui fait partir l'import. Un échec le
   * remet à faux — c'est ce qui laisse le signal suivant refaire la demande —
   * et abandonne ce qui était tenu : sinon le prochain survol du bouton, en
   * chargeant le panneau, ouvrirait tout seul une palette demandée plus tôt.
   */
  const [wanted, setWanted] = useState(false);

  /**
   * Ce qui est tapé entre la demande d'ouverture et l'arrivée du panneau.
   *
   * La palette s'ouvrait autrefois dans la même tâche que ⌘K : on tapait sa
   * recherche aussitôt. Chargé à la demande, le panneau arrive quelques
   * centaines de millisecondes plus tard sur une connexion lente, et cette
   * frappe n'avait aucun champ où aller — « tailwind » ouvrait la palette sur
   * « wind ». Elle est gardée ici et rendue au champ à son montage.
   */
  const [heldQuery, setHeldQuery] = useState("");

  useEffect(() => {
    if (!wanted || panel) {
      return;
    }

    let cancelled = false;

    void (async () => {
      const loaded = await loadPanel();
      if (cancelled) {
        return;
      }

      if (loaded) {
        setPanel(loaded);
        return;
      }

      setWanted(false);
      setOpen(false);
      setHeldQuery("");
      setShortcutsOpen(false);
      toast.dismiss(HINT_TOAST);
    })();

    return () => {
      cancelled = true;
    };
  }, [wanted, panel]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      // Échap abandonne une ouverture encore TENUE. Avant l'arrivée du panneau
      // il n'y a ni dialogue ni tiroir pour entendre la touche : sur une
      // connexion lente, la palette s'ouvrait une seconde après avoir été
      // annulée — et menu mobile ouvert, Échap fermait le menu puis la palette
      // arrivait par-dessus. Le panneau continue d'arriver : seule la demande
      // d'ouverture tombe, et la touche n'est pas consommée.
      if (
        event.key === "Escape" &&
        !panel &&
        (open || shortcutsOpen)
      ) {
        toast.dismiss(HINT_TOAST);
        setOpen(false);
        setHeldQuery("");
        setShortcutsOpen(false);
        return;
      }

      const target = event.target as HTMLElement;
      if (
        target.isContentEditable ||
        target.matches("input, textarea, select")
      ) {
        return;
      }

      // palette demandée, panneau pas encore là : la frappe est gardée pour
      // le champ. Avant « ? » et « / », qui sont alors des caractères de la
      // recherche et non des raccourcis, comme ils le sont dans le champ.
      if (
        open &&
        !panel &&
        !(
          event.metaKey ||
          event.ctrlKey ||
          event.altKey ||
          event.isComposing
        )
      ) {
        if (event.key === "Backspace") {
          event.preventDefault();
          setHeldQuery((query) => query.slice(0, -1));
          return;
        }
        if (event.key.length === 1) {
          event.preventDefault();
          setHeldQuery((query) => query + event.key);
          return;
        }
      }

      // ⌘ ou Ctrl enfoncée seule précède le K d'un instant : le panneau part
      // à ce moment-là, sans rien ouvrir. Hors d'un champ uniquement — un
      // copier-coller dans un outil n'annonce pas la palette.
      if (event.key === "Meta" || event.key === "Control") {
        // sans `repeat` : hors ligne, une touche tenue relancerait la demande
        // après chaque échec
        if (!event.repeat) {
          setWanted(true);
        }
        return;
      }

      // « ? » ouvre l'aide : c'est la convention, et c'était le seul moyen de
      // rendre découvrables cinq raccourcis dont aucun n'était documenté
      if (event.key === "?") {
        event.preventDefault();
        // la touche ne referme que ce qui est à l'écran. Tant que le panneau
        // n'est pas là, la répéter confirme la demande : en bascule, deux
        // appuis impatients s'annulaient et rien ne s'ouvrait.
        if (shortcutsOpen && panel) {
          setShortcutsOpen(false);
          return;
        }
        setShortcutsOpen(true);
        setWanted(true);
        return;
      }

      if (
        (event.key === "k" && (event.metaKey || event.ctrlKey)) ||
        event.key === "/"
      ) {
        event.preventDefault();

        if (open && panel) {
          // fermer au clavier ne déclenche pas onOpenChange : sans ça le toast
          // à durée infinie posé par handleOpen restait affiché pour toujours
          toast.dismiss(HINT_TOAST);
          triggerRef.current?.focus();
          setOpen(false);
          setHeldQuery("");
          return;
        }

        setOpenedByKeyboard(true);
        setOpen(true);
        // l'index part en même temps que le panneau, pas après lui
        prefetchSearchIndex();
        setWanted(true);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, panel, shortcutsOpen]);

  const handleOpen = (event: MouseEvent) => {
    // `detail` vaut 0 quand le clic vient d'Entrée ou d'Espace
    setOpenedByKeyboard(event.detail === 0);
    // pas de blur ici : retirer le focus du déclencheur avant l'ouverture ne
    // laisse aucun point de retour à la fermeture, et le focus repart au début
    // du document.
    setOpen(true);
    toast.info("", {
      description: m.nav_command_drawer_hint(),
      duration: Number.POSITIVE_INFINITY,
      id: HINT_TOAST,
    });
    setWanted(true);
  };

  // le temps d'amener la souris ou le doigt jusqu'au bouton puis d'appuyer,
  // l'index et le panneau sont déjà là : le focus couvre le même besoin au
  // clavier. Pas de chargement au repos sur chaque page — il ne ferait que
  // déplacer les octets.
  const prefetch = () => {
    prefetchSearchIndex();
    setWanted(true);
  };

  return (
    <>
      {/* la feuille reste AVANT le déclencheur, la palette après, absentes
          ou non : l'`id` que Base UI donne au bouton vient de `useId`, qui
          dépend de la place du bouton parmi ses voisins. Deux emplacements
          au lieu de trois, et le HTML servi du déclencheur changeait. */}
      {panel && (
        <panel.NavBarShortcuts
          fallbackFocusRef={triggerRef}
          isDesktop={isDesktop}
          onOpenChange={setShortcutsOpen}
          open={shortcutsOpen}
        />
      )}

      <NavBarTooltip label={m.nav_command_search()} shortcut="⌘K">
        <Button
          onClick={handleOpen}
          onFocus={prefetch}
          onPointerEnter={prefetch}
          onTouchStart={prefetch}
          ref={triggerRef}
          size="icon"
          variant="ghost"
        >
          <Search />
          <span className="sr-only">{m.nav_command_search()}</span>
        </Button>
      </NavBarTooltip>

      {panel && (
        <panel.NavBarCommandPanel
          initialQuery={heldQuery}
          isDesktop={isDesktop}
          onOpenChange={(value) => {
            setOpen(value);
            if (!value) {
              setHeldQuery("");
            }
          }}
          onShowShortcuts={() => setShortcutsOpen(true)}
          open={open}
          openedByKeyboard={openedByKeyboard}
          triggerRef={triggerRef}
        />
      )}
    </>
  );
};
