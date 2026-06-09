import Link from "next/link";

import type { Content } from "@/lib/content";
import { dayjs } from "@/lib/functions";
import { getRelatedContent } from "@/lib/related";
import { m } from "@/paraglide/messages";
import { localizeHref } from "@/paraglide/runtime";

import { Divider } from "../base/Divider";
import { PanelContent } from "../base/Panel";

interface WritingsRelatedProps {
  current: Content;
  items: Content[];
}

export const WritingsRelated = ({
  current,
  items,
}: WritingsRelatedProps) => {
  const related = getRelatedContent(current, items);

  if (related.length === 0) {
    return null;
  }

  return (
    <>
      <Divider border={false} type="half" />

      <PanelContent reset className="px-3 py-3">
        <h2 className="font-medium text-muted-foreground text-sm">
          {m.writings_related_heading()}
        </h2>

        <ul className="mt-3 flex flex-col gap-y-3">
          {related.map(({ slug, metadata, reading }) => (
            <li key={slug}>
              <Link
                aria-label={m.writings_related_item_aria({
                  title: metadata.title,
                })}
                className="group flex flex-col gap-y-0.5"
                href={localizeHref(`/${metadata.category}/${slug}`)}
                prefetch
              >
                <span className="font-medium text-foreground transition-colors group-hover:text-theme">
                  {metadata.title}
                </span>
                <span className="text-muted-foreground text-xs">
                  {dayjs(metadata.createdAt).format("DD MMMM YYYY")} ·{" "}
                  {reading.time}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </PanelContent>
    </>
  );
};
