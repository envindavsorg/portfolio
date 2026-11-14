import Link from "next/link";

import { Divider } from "@/components/base/Divider";
import type { Content } from "@/lib/content";
import { slugifyTag, tagLabel } from "@/lib/tags";
import * as m from "@/paraglide/messages";
import { localizeHref } from "@/paraglide/runtime";

import { WritingsPanel } from "./WritingsPanel";

interface WritingsTagLinksProps {
  current: Content;
}

/**
 * Sujets d'un contenu, en liens vers les pages /tags.
 *
 * Les tags n'étaient affichés nulle part sur une page de détail : ils ne
 * servaient qu'au filtre des index, côté client. Ils deviennent ici le point
 * d'entrée vers la découverte transversale.
 */
export const WritingsTagLinks = ({
  current,
}: WritingsTagLinksProps) => {
  const tags = (current.metadata.tags ?? []).filter((tag) =>
    Boolean(slugifyTag(tag))
  );

  if (tags.length === 0) {
    return null;
  }

  return (
    <>
      <WritingsPanel title={m.writings_tag_links_title()}>
        <ul className="flex flex-wrap gap-2 p-3">
          {tags.map((tag) => (
            <li key={tag}>
              <Link
                className="flex items-center border border-input px-3 py-1.5 text-sm lowercase transition-colors hover:border-theme hover:text-theme focus-visible:border-theme focus-visible:text-theme"
                href={localizeHref(`/tags/${slugifyTag(tag)}`)}
                // une pastille par sujet, chacune préchargée dès qu'elle entre
                // à l'écran : des pages que presque personne n'ouvre, payées
                // par tous ceux qui finissent l'article
                prefetch={false}
              >
                {/* le lien porte la CLÉ dans son URL et le libellé de la locale
                    du contenu dans son texte */}
                #{tagLabel(tag, current.locale)}
              </Link>
            </li>
          ))}
        </ul>
      </WritingsPanel>

      <Divider border={false} type="half" />
    </>
  );
};
