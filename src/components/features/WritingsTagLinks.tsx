import Link from "next/link";

import {
  Panel,
  PanelContent,
  PanelHeader,
} from "@/components/base/Panel";
import type { Content } from "@/lib/content";
import { slugifyTag } from "@/lib/tags";
import { m } from "@/paraglide/messages";
import { localizeHref } from "@/paraglide/runtime";

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
    <Panel>
      <PanelHeader title={m.writings_tag_links_title()} />

      <PanelContent reset>
        <ul className="flex flex-wrap gap-2 p-3">
          {tags.map((tag) => (
            <li key={tag}>
              <Link
                className="flex items-center rounded-full border border-input px-3 py-1.5 text-sm lowercase transition-colors hover:border-theme hover:text-theme focus-visible:border-theme focus-visible:text-theme"
                href={localizeHref(`/tags/${slugifyTag(tag)}`)}
              >
                #{tag}
              </Link>
            </li>
          ))}
        </ul>
      </PanelContent>
    </Panel>
  );
};
