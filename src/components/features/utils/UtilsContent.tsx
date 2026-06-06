"use client";

import { AnimatePresence, motion } from "motion/react";
import { Fragment } from "react";

import { Divider } from "@/components/base/Divider";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/base/Empty";
import { Frown } from "@/components/motion/Frown";
import { Button } from "@/components/primitives/Button";
import { m } from "@/paraglide/messages";

import type { UtilsItem } from "./types";
import { UtilsCard } from "./UtilsCard";

const MotionEmpty = motion.create(Empty);

interface UtilsContentProps {
  items: UtilsItem[];
  onRetry: () => void;
  query: string;
}

export const UtilsContent = ({
  items,
  onRetry,
  query,
}: UtilsContentProps) => (
  <AnimatePresence mode="wait">
    {items.length === 0 ? (
      <>
        <MotionEmpty
          key="empty"
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          initial={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.2 }}
          className="-mx-[0.5px] border border-destructive/40 rounded-none"
        >
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Frown />
            </EmptyMedia>
            <EmptyTitle>{m.utils_empty_title()}</EmptyTitle>
            <EmptyDescription>
              {m.utils_empty_description({ query })}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent className="flex-row justify-center">
            <Button onClick={onRetry} variant="destructive">
              {m.utils_empty_retry_button()}
            </Button>
          </EmptyContent>
        </MotionEmpty>
        <Divider border={false} type="half" />
      </>
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
