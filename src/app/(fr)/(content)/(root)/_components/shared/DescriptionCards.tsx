import { Prose } from "@/components/primitives/Typography";
import type { Message } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface DescriptionCardsProps {
  items: Message[];
}

/** les cartes qui prennent deux colonnes sur trois, à partir de `md` */
const WIDE_INDEXES = new Set([0, 3, 4, 7]);

/**
 * Les puces numérotées d'un poste ou d'un projet déplié.
 *
 * Les rangées faisaient 120 px, fixes, sur des cartes en `overflow-hidden` :
 * à 390 px le texte touchait la pastille (0 px d'écart, mesuré), et à 320 px
 * une carte de quatre lignes dépassait de 17 px — la dernière ligne était
 * coupée. 120 px devient un plancher, et `gap-y-3` garantit l'écart quelle que
 * soit la longueur du texte. Sur ordinateur rien ne bouge : toutes les cartes
 * tiennent en deux lignes.
 */
export const DescriptionCards = ({
  items,
}: DescriptionCardsProps) => (
  <div
    className={cn(
      "grid auto-rows-[minmax(120px,auto)] grid-cols-1 gap-3 border-edge border-t p-3 duration-300 md:grid-cols-3",
      "group-data-[state=closed]:animate-fade-out group-data-[state=open]:animate-fade-in"
    )}
  >
    {items.map((text, idx) => {
      // le texte rendu sert de clé : la liste est statique et ses entrées
      // sont toutes différentes
      const label = text();

      return (
        <div
          className={cn(
            "group/card relative flex flex-col justify-between gap-y-3 overflow-hidden rounded-xl border border-input bg-background p-4",
            WIDE_INDEXES.has(idx) ? "md:col-span-2" : "md:col-span-1"
          )}
          key={label}
        >
          {/* dans la carte, plus à cheval sur son coin : l'arrondi rognait le
            chiffre à droite */}
          <span className="absolute top-0 right-2 select-none font-bold text-[3rem] text-theme leading-none tracking-tighter opacity-[0.3] transition-opacity duration-300">
            {idx + 1}
          </span>
          <div className="z-10 flex items-center gap-2">
            <span className="flex h-6 items-center justify-center rounded-full bg-theme/10 px-2.5 font-bold text-[10px] text-theme">
              {(idx + 1).toString().padStart(2, "0")}
            </span>
            <div className="h-px w-8 bg-theme" />
          </div>
          <Prose className="z-10">{label}</Prose>
          <div className="pointer-events-none absolute inset-0 bg-linear-to-tr from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover/card:opacity-100" />
        </div>
      );
    })}
  </div>
);
