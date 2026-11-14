import type { Icon } from "@phosphor-icons/react";
import {
  BriefcaseIcon,
  EnvelopeIcon,
  FlaskIcon,
  PhoneIcon,
} from "@phosphor-icons/react/dist/ssr";

import GLOBAL_DATA from "@/data/global";
import { cn } from "@/lib/utils";
import * as m from "@/paraglide/messages";

interface OverviewItemProps {
  icon: Icon;
  children: string;
  /** `tel:` ou `mailto:` : la valeur devient alors un lien */
  href?: string;
}

const { USER } = GLOBAL_DATA;

/**
 * Sert à couper le message « -- {children} -- » autour de sa valeur.
 *
 * L'ornement reste dans le message, mais il doit rester HORS du lien : dedans,
 * le nom accessible du lien serait « tiret tiret plus trente-trois… ».
 */
const VALUE_SLOT = "%value%";

const OverviewItem = ({
  icon: Icon,
  children,
  href,
}: OverviewItemProps) => {
  const [before, after] = m
    .home_overview_item_wrapper({ children: VALUE_SLOT })
    .split(VALUE_SLOT);

  return (
    <div className="flex items-center">
      <div className="m-2 flex aspect-square size-8 shrink-0 items-center justify-center">
        <Icon className="size-6 text-theme" weight="duotone" />
      </div>
      <p className="w-full flex-1 border-edge border-l p-3 max-sm:text-sm">
        {before}
        {href ? (
          // souligné AU REPOS : même couleur que les tirets qui l'entourent,
          // le lien ne se distinguerait sinon de son texte par rien du tout
          // (WCAG 1.4.1, règle axe `link-in-text-block`)
          <a
            className="underline decoration-1 decoration-theme/60 underline-offset-4 transition-colors hover:decoration-theme"
            href={href}
          >
            {children}
          </a>
        ) : (
          children
        )}
        {after}
      </p>
    </div>
  );
};

export const OverviewContent = () => {
  const overviewRows: OverviewItemProps[][] = [
    [
      { children: m.user_job_title(), icon: BriefcaseIcon },
      { children: m.user_work_experience(), icon: FlaskIcon },
    ],
    [
      {
        children: USER.phoneNumber,
        href: `tel:${USER.phoneNumber.replaceAll(" ", "")}`,
        icon: PhoneIcon,
      },
      {
        children: USER.emailAddress,
        href: `mailto:${USER.emailAddress}`,
        icon: EnvelopeIcon,
      },
    ],
  ];

  const lastRowIndex = overviewRows.length - 1;

  return (
    <>
      {overviewRows.map((row, rowIndex) => (
        <div
          className={cn(
            "screen-line-after grid grid-cols-1 sm:grid-cols-2 sm:gap-4",
            rowIndex === 0 && "screen-line-before"
          )}
          key={rowIndex}
        >
          {row.map(({ icon, children, href }, itemIndex) => (
            <div
              className={cn(
                !(
                  rowIndex === lastRowIndex &&
                  itemIndex === row.length - 1
                ) && "max-sm:screen-line-after"
              )}
              key={itemIndex}
            >
              <OverviewItem href={href} icon={icon}>
                {children}
              </OverviewItem>
            </div>
          ))}
        </div>
      ))}
    </>
  );
};
