import { InfoIcon } from "@phosphor-icons/react/ssr";

import { PanelContent } from "@/components/base/Panel";
import { m } from "@/paraglide/messages";

// bandeau affiché sur les pages EN dont le contenu MDX reste en français
export const WritingsLocaleNotice = () => (
  <PanelContent className="screen-line-after flex items-center gap-x-2 py-2 text-muted-foreground text-xs sm:text-sm">
    <InfoIcon className="size-4 shrink-0 text-theme" />
    <p>{m.article_french_only()}</p>
  </PanelContent>
);
