"use client";

import { AnimatePresence, motion } from "motion/react";
import { Fragment } from "react";

import { Divider } from "@/components/primitives/Divider";

import { PanelContent } from "../../primitives/Panel";
import type { UtilsItem } from "./types";
import { UtilsCard } from "./UtilsCard";

interface UtilsContentProps {
  items: UtilsItem[];
  query: string;
}

export const UtilsContent = ({ items, query }: UtilsContentProps) => (
  <AnimatePresence mode="wait">
    {items.length === 0 ? (
      <motion.div
        key="empty"
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        initial={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.2 }}
      >
        <PanelContent className="-mx-[0.5px] border border-destructive/40">
          <p className="text-center text-sm font-pixel-square lowercase text-destructive">
            -- aucun outil trouvé pour "{query}" --
          </p>
        </PanelContent>
      </motion.div>
    ) : (
      <Fragment key="list">
        {items.map((item) => (
          <Fragment key={item.slug}>
            <UtilsCard item={item} />
            <Divider border={false} type="half" />
          </Fragment>
        ))}
      </Fragment>
    )}
  </AnimatePresence>
);
