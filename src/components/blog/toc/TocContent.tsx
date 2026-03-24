import { useCollapsible } from "@/components/primitives/Collapsible";

import type { TocGroup } from "./groupTocItems";
import { TocConnector } from "./TocConnector";
import { TocItem } from "./TocItem";

interface TocContentProps {
  groups: TocGroup[];
  activeUrl: string | null;
}

export const TocContent = ({
  groups,
  activeUrl,
}: TocContentProps) => {
  const { setOpen } = useCollapsible();

  const handleNavigate = () => {
    setOpen(false);
  };

  return (
    <div className="flex flex-col px-3 pt-1 pb-3">
      {groups.map((group, groupIndex) => {
        const isParentActive = group.parent.url === activeUrl;
        const hasChildren = group.children.length > 0;
        const isLastGroup = groupIndex === groups.length - 1;
        return (
          <div key={group.parent.url}>
            <TocItem
              isActive={isParentActive}
              item={group.parent}
              onNavigate={handleNavigate}
            />
            {hasChildren && (
              <>
                <TocConnector direction="down" />
                <div className="ml-[15.5px]">
                  {group.children.map((child) => (
                    <TocItem
                      isActive={child.url === activeUrl}
                      item={child}
                      key={child.url}
                      onNavigate={handleNavigate}
                    />
                  ))}
                </div>
                {!isLastGroup && <TocConnector direction="up" />}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};
