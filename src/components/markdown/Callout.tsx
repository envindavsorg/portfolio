import {
  FireIcon,
  InfoIcon,
  LightbulbIcon,
  SealCheckIcon,
  WarningIcon,
} from "@phosphor-icons/react/ssr";
import type { ComponentProps } from "react";

import type { AlertKind } from "@/lib/remark-alert";
import { cn } from "@/lib/utils";
import { m } from "@/paraglide/messages";

/**
 * Un encart d'avertissement, produit par `remark-alert`.
 *
 * La COULEUR ne porte jamais l'information seule : chaque encart annonce son
 * genre en TEXTE — « attention », « à noter » — et l'accent ne colore que la
 * bordure et l'icône. C'est ce qui permet de rester lisible en niveaux de gris,
 * pour un daltonien, et à l'impression ; et c'est aussi ce qui ramène l'exigence
 * de contraste de l'accent à 3:1 (composant d'interface) au lieu de 4,5:1, sans
 * avoir à inventer cinq paires de couleurs conformes pour du texte.
 */

const STYLES: Record<
  AlertKind,
  { accent: string; icon: typeof InfoIcon; label: () => string }
> = {
  caution: {
    accent: "border-l-destructive text-destructive",
    icon: FireIcon,
    label: m.callout_caution,
  },
  important: {
    accent: "border-l-theme text-theme",
    icon: SealCheckIcon,
    label: m.callout_important,
  },
  note: {
    accent: "border-l-info text-info",
    icon: InfoIcon,
    label: m.callout_note,
  },
  tip: {
    accent: "border-l-success text-success",
    icon: LightbulbIcon,
    label: m.callout_tip,
  },
  warning: {
    accent: "border-l-warning text-warning",
    icon: WarningIcon,
    label: m.callout_warning,
  },
};

interface CalloutProps extends ComponentProps<"div"> {
  kind?: AlertKind;
}

export const Callout = ({
  children,
  className,
  kind = "note",
  ...props
}: CalloutProps) => {
  const { accent, icon: Icon, label } = STYLES[kind] ?? STYLES.note;

  return (
    <div
      className={cn(
        "not-prose my-4 rounded-r-md border-l-3 bg-muted/40 px-4 py-3",
        // `break-inside-avoid` : un encart coupé entre deux pages imprimées perd
        // justement l'effet d'encadrement qui le distingue du texte courant
        "break-inside-avoid",
        accent.split(" ")[0],
        className
      )}
      data-callout={kind}
      data-slot="callout"
      {...props}
    >
      {/**
       * Le LIBELLÉ est en couleur de texte normale, et seule l'ICÔNE porte
       * l'accent.
       *
       * Ma première version colorait le libellé : `--warning` donnait alors
       * 2,9:1 sur le fond de l'encart, sous les 4,5 exigés pour du texte — et le
       * scan axe l'a attrapé sur la page d'article. C'est exactement l'écart
       * entre le principe que j'avais énoncé et ce que j'avais écrit.
       *
       * Une icône est un composant d'interface décoratif : le seuil qui la
       * concerne est 3:1, et l'information reste dans le mot « attention ».
       */}
      <p className="flex items-center gap-x-2 pb-1 font-semibold text-foreground text-sm lowercase">
        <span className={accent.split(" ")[1]}>
          <Icon aria-hidden="true" size={16} weight="fill" />
        </span>
        {label()}
      </p>

      <div className="[&>*:last-child]:mb-0 [&>p]:my-1 text-sm">
        {children}
      </div>
    </div>
  );
};
