import type { Icon } from "@phosphor-icons/react";
import {
  BriefcaseIcon,
  EnvelopeIcon,
  FlaskIcon,
  PhoneIcon,
} from "@phosphor-icons/react/dist/ssr";

import GLOBAL_DATA from "@/data/global";
import { cn } from "@/lib/utils";
import { m } from "@/paraglide/messages";

interface OverviewItemProps {
  icon: Icon;
  children: React.ReactNode;
}

const { USER } = GLOBAL_DATA;

const OverviewItem = ({
  icon: Icon,
  children,
}: OverviewItemProps) => (
  <div className="flex items-center">
    <div className="m-2 flex aspect-square size-8 shrink-0 cursor-default items-center justify-center">
      <Icon className="size-6 text-theme" weight="duotone" />
    </div>
    <p className="w-full flex-1 border-edge border-l p-3 max-sm:text-sm">
      {m.home_overview_item_wrapper({ children: children as string })}
    </p>
  </div>
);

export const OverviewContent = () => {
  const overviewRows: OverviewItemProps[][] = [
    [
      { children: m.user_job_title(), icon: BriefcaseIcon },
      { children: m.user_work_experience(), icon: FlaskIcon },
    ],
    [
      { children: USER.phoneNumber, icon: PhoneIcon },
      { children: USER.emailAddress, icon: EnvelopeIcon },
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
          {row.map(({ icon, children }, itemIndex) => (
            <div
              className={cn(
                !(
                  rowIndex === lastRowIndex &&
                  itemIndex === row.length - 1
                ) && "max-sm:screen-line-after"
              )}
              key={itemIndex}
            >
              <OverviewItem icon={icon}>{children}</OverviewItem>
            </div>
          ))}
        </div>
      ))}
    </>
  );
};
