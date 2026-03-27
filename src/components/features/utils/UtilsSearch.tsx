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
    sort === "a-z" ? "trier de z à a" : "trier de a à z";

  const sortLabel =
    sort === "a-z" ? "· trié de a à z" : "· trié de z à a";

  const countLabel =
    count === 1 ? "outil disponible" : "outils disponibles";

  return (
    <PanelContent>
      <Field>
        <FieldLabel htmlFor="input-search-utils">
          Rechercher un outil :
        </FieldLabel>
        <FieldContent>
          <Input
            ref={inputRef}
            icon={Search}
            id="input-search-utils"
            onChange={handleInputChange}
            placeholder="rechercher un outil ..."
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
                    effacer la recherche
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
