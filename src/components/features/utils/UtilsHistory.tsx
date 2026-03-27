"use client";

import { Fragment, useCallback, useRef } from "react";

import { Divider } from "@/components/base/Divider";

import { PanelContent } from "../../base/Panel";
import { Delete } from "../../motion/Delete";
import { Button } from "../../primitives/Button";
import type { UtilsItem } from "./types";
import { UtilsCard } from "./UtilsCard";

interface UtilsHistoryProps {
  items: UtilsItem[];
  onClear: () => void;
}

export const UtilsHistory = ({
  items,
  onClear,
}: UtilsHistoryProps) => {
  const deleteIconRef = useRef<AnimatedIconHandle>(null);

  const handleMouseEnter = useCallback(() => {
    deleteIconRef.current?.startAnimation();
  }, []);

  const handleMouseLeave = useCallback(() => {
    deleteIconRef.current?.stopAnimation();
  }, []);

  if (items.length === 0) {
    return null;
  }

  return (
    <>
      <PanelContent
        reset
        className="-mx-[0.5px] border border-theme/40"
      >
        <div className="flex items-center justify-between border-b border-theme/40 px-3 py-2">
          <span className="text-sm font-pixel-square lowercase text-theme sm:text-base">
            -- récemment utilisés --
          </span>
          <Button
            onClick={onClear}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            size="icon"
            variant="destructive"
          >
            <Delete ref={deleteIconRef} size={14} />
            <span className="sr-only">
              effacer l'historique récent
            </span>
          </Button>
        </div>

        {items.map((item, idx) => (
          <Fragment key={`recent-${item.slug}`}>
            {idx > 0 && <div className="border-t border-theme/40" />}
            <UtilsCard item={item} noDescription />
          </Fragment>
        ))}
      </PanelContent>

      <Divider border={false} type="half" />
    </>
  );
};
