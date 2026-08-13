import type { Metadata } from "next";

import { Divider } from "@/components/base/Divider";
import { PanelContent } from "@/components/base/Panel";
import { PixelHeading } from "@/components/blocks/PixelHeading";
import { WritingsBreadcrumb } from "@/components/features/WritingsBreadcrumb";
import { Prose } from "@/components/primitives/Typography";
import { usesGroups } from "@/data/uses";
import type { AppLocale } from "@/lib/i18n";
import { createMetadata } from "@/lib/metadata";
import { m } from "@/paraglide/messages";
import { localizeHref } from "@/paraglide/runtime";

const pageDescription =
  "Les outils avec lesquels florin cuzeac travaille : la stack de ce site, les langages, l'outillage, les services dont il dépend et l'environnement de développement.";

export const metadata: Metadata = createMetadata({
  description: pageDescription,
  ogImageParams: {
    description: pageDescription,
    title: "Ce que j'utilise",
    type: "blog",
  },
  path: "/uses",
  title: "Ce que j'utilise",
});

export const UsesPage = ({
  locale = "fr",
}: Readonly<{ locale?: AppLocale }>) => {
  const options = { locale } as const;

  return (
    <div className="screen-line-after min-h-svh">
      <WritingsBreadcrumb
        items={[
          {
            href: localizeHref("/"),
            label: m.writings_breadcrumb_home(undefined, options),
          },
          { label: m.uses_breadcrumb(undefined, options) },
        ]}
      />

      <Divider before={false} border={false} type="half" />

      <div className="flex w-full items-center justify-between gap-x-3 px-3">
        <PixelHeading
          autoPlay
          className="text-balance font-extrabold text-[28px] leading-snug sm:text-4xl"
          mode="multi"
        >
          {m.uses_heading(undefined, options)}
        </PixelHeading>
      </div>

      <PanelContent className="screen-line-after screen-line-before">
        <Prose>{m.uses_intro(undefined, options)}</Prose>
      </PanelContent>

      {usesGroups().map((group) => (
        <section
          className="screen-line-after px-3 py-4"
          data-slot="uses-group"
          key={group.id}
        >
          <h2 className="font-semibold text-sm lowercase">
            {group.title(undefined, options)}
          </h2>

          <p className="pt-1 pb-3 text-muted-foreground text-sm">
            {group.note(undefined, options)}
          </p>

          <ul className="flex flex-col gap-y-1.5">
            {group.items.map((item) => (
              <li
                className="flex items-baseline gap-x-2 text-sm"
                key={item.name}
              >
                <span aria-hidden="true" className="text-theme">
                  --
                </span>

                {item.link ? (
                  <a
                    className="underline decoration-dotted underline-offset-4 transition-colors hover:text-theme"
                    href={item.link}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {item.name}
                  </a>
                ) : (
                  item.name
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
};

const Page = () => <UsesPage />;

export default Page;
