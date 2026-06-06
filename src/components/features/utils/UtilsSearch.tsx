"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ChangeEvent, RefObject } from "react";
import { useCallback, useRef } from "react";

import { Counter } from "@/components/base/Counter";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@/components/primitives/Field";
import { Input } from "@/components/primitives/Input";
import { m } from "@/paraglide/messages";
import { getLocale } from "@/paraglide/runtime";

import { PanelContent } from "../../base/Panel";
import { ArrowDownAtoZ } from "../../motion/ArrowDownAtoZ";
import { ArrowDownZtoA } from "../../motion/ArrowDownZtoA";
import { Delete } from "../../motion/Delete";
import { Search } from "../../motion/Search";
import { Button } from "../../primitives/Button";
import type { UtilsSortMode } from "./types";

interface UtilsSearchProps {
  count: number;
  inputRef: RefObject<HTMLInputElement | null>;
  onClear: () => void;
  onQueryChange: (value: string) => void;
  onToggleSort: () => void;
  query: string;
  sort: UtilsSortMode;
}

export const UtilsSearch = ({
  count,
  inputRef,
  onClear,
  onQueryChange,
  onToggleSort,
  query,
  sort,
}: UtilsSearchProps) => {
  const sortIconRef = useRef<AnimatedIconHandle>(null);
  const clearIconRef = useRef<AnimatedIconHandle>(null);

  const handleInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onQueryChange(event.target.value);
    },
    [onQueryChange]
  );

  const handleClearMouseEnter = useCallback(() => {
    clearIconRef.current?.startAnimation();
  }, []);

  const handleClearMouseLeave = useCallback(() => {
    clearIconRef.current?.stopAnimation();
  }, []);

  const handleSortMouseEnter = useCallback(() => {
    sortIconRef.current?.startAnimation();
  }, []);

  const handleSortMouseLeave = useCallback(() => {
    sortIconRef.current?.stopAnimation();
  }, []);

  const SortIcon = sort === "a-z" ? ArrowDownAtoZ : ArrowDownZtoA;

  const sortAriaLabel =
    sort === "a-z"
      ? m.utils_search_sort_to_za()
      : m.utils_search_sort_to_az();

  const sortLabel =
    sort === "a-z"
      ? m.utils_search_sorted_az()
      : m.utils_search_sorted_za();

  const countLabel =
    count === 1
      ? m.utils_search_count_singular()
      : m.utils_search_count_plural();

  return (
    <PanelContent>
      <Field>
        <FieldLabel htmlFor="input-search-utils">
          {m.utils_search_label()}
        </FieldLabel>
        <FieldContent>
          <Input
            ref={inputRef}
            icon={Search}
            id="input-search-utils"
            onChange={handleInputChange}
            placeholder={m.utils_search_placeholder()}
            value={query}
          />
          <AnimatePresence>
            {query && (
              <motion.div
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                initial={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
              >
                <Button
                  onClick={onClear}
                  onMouseEnter={handleClearMouseEnter}
                  onMouseLeave={handleClearMouseLeave}
                  size="icon"
                  variant="destructive"
                >
                  <Delete ref={clearIconRef} size={16} />
                  <span className="sr-only">
                    {getLocale() === "en"
                      ? "clear search"
                      : "effacer la recherche"}
                  </span>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
          <Button
            onClick={onToggleSort}
            onMouseEnter={handleSortMouseEnter}
            onMouseLeave={handleSortMouseLeave}
            size="icon"
            variant="outline"
          >
            <SortIcon key={sort} ref={sortIconRef} size={16} />
            <span className="sr-only">{sortAriaLabel}</span>
          </Button>
        </FieldContent>
        {count > 0 && (
          <FieldDescription className="text-theme">
            -- <Counter value={count} /> {countLabel} {sortLabel} --
          </FieldDescription>
        )}
      </Field>
    </PanelContent>
  );
};
