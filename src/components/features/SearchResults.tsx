"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";

import { Label } from "@/components/base/Label";
import { Badge } from "@/components/primitives/Badge";
import { Button } from "@/components/primitives/Button";
import { Input } from "@/components/primitives/Input";
import { useSearchIndex } from "@/hooks/useSearchIndex";
import { SCORES, searchDocs } from "@/lib/search";
import { m } from "@/paraglide/messages";
import { localizeHref } from "@/paraglide/runtime";

const QUERY_KEY = "q";

/**
 * Lit la requête depuis le fragment d'URL.
 *
 * Le fragment et non `searchParams` : une recherche en paramètre de requête
 * rendrait la page dynamique et ferait perdre le prérendu, alors que le fragment
 * n'est jamais envoyé au serveur. L'adresse reste partageable, et les moteurs
 * l'ignorent — ce qui évite au passage d'exposer une infinité de pages de
 * résultats à l'indexation.
 */
const readQuery = (): string => {
  const hash = window.location.hash.replace(/^#/u, "");
  return new URLSearchParams(hash).get(QUERY_KEY) ?? "";
};

const writeQuery = (query: string) => {
  const hash = query
    ? `#${new URLSearchParams({ [QUERY_KEY]: query }).toString()}`
    : window.location.pathname;

  // replaceState et non pushState : taper dix caractères ne doit pas remplir
  // l'historique de dix entrées à défaire une par une
  window.history.replaceState(null, "", hash);
};

export const SearchResults = () => {
  const [query, setQuery] = useState("");

  // l'index arrive par fetch et non plus en prop : la page l'embarquait DEUX
  // fois dans son payload, une pour la navbar et une pour les résultats
  const { docs, failed, loading } = useSearchIndex();

  /**
   * La requête initiale est lue après l'hydratation : le fragment n'existe pas
   * côté serveur, le lire pendant le rendu provoquerait une désynchronisation.
   */
  useEffect(() => {
    setQuery(readQuery());

    const onHashChange = () => setQuery(readQuery());
    window.addEventListener("hashchange", onHashChange);
    return () =>
      window.removeEventListener("hashchange", onHashChange);
  }, []);

  const hits = useMemo(
    () => (query.trim() ? searchDocs(docs, query) : []),
    [docs, query]
  );

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const next = event.target.value;
      setQuery(next);
      writeQuery(next);
    },
    []
  );

  const handleClear = useCallback(() => {
    setQuery("");
    writeQuery("");
  }, []);

  const trimmed = query.trim();

  return (
    <div
      className="flex w-full flex-col gap-y-4"
      data-slot="search-results"
    >
      <div className="flex flex-col gap-y-2 px-3">
        <Label htmlFor="search-input">{m.search_input_label()}</Label>

        <div className="flex items-center gap-x-2">
          <Input
            autoComplete="off"
            id="search-input"
            onChange={handleChange}
            placeholder={m.search_input_placeholder()}
            spellCheck={false}
            type="search"
            value={query}
          />
          <Button onClick={handleClear} size="sm" variant="outline">
            {m.search_clear()}
          </Button>
        </div>

        <p className="text-muted-foreground text-xs">
          {m.search_shareable()}
        </p>
      </div>

      {/* la mise à jour du nombre de résultats est annoncée : sans région live,
          une personne qui utilise un lecteur d'écran tape sans aucun retour */}
      <p
        aria-live="polite"
        className="px-3 text-muted-foreground text-sm"
        role="status"
      >
        {trimmed
          ? m.search_result_count({ count: hits.length })
          : m.search_prompt()}
      </p>

      {/* distinguer les trois cas : « rien trouvé » affiché pendant le
          chargement, ou pire à la place d'une panne, ferait croire à une requête
          sans résultat alors que rien n'a encore été cherché */}
      {trimmed && hits.length === 0 && (loading || failed) && (
        <p className="px-3 text-sm">
          {failed ? m.search_unavailable() : m.search_loading()}
        </p>
      )}

      {trimmed && hits.length === 0 && !(loading || failed) && (
        <p className="px-3 text-sm">
          {m.search_empty({ query: trimmed })}
        </p>
      )}

      {hits.length > 0 && (
        <ul className="flex flex-col divide-y divide-edge border-edge border-t">
          {hits.map(({ doc, score }) => (
            <li key={`${doc.category}/${doc.slug}`}>
              <Link
                className="flex flex-col gap-y-1.5 px-3 py-4 transition-colors hover:bg-accent focus-visible:bg-accent"
                href={localizeHref(`/${doc.category}/${doc.slug}`)}
              >
                <span className="flex items-baseline justify-between gap-x-3">
                  <span className="font-medium text-base lowercase">
                    {doc.title}
                  </span>
                  <span className="flex shrink-0 items-center gap-x-2">
                    {/* dire OÙ le mot a été trouvé évite le résultat qui semble
                        hors sujet parce que la correspondance est dans le corps */}
                    <Badge className="lowercase">
                      {score >= SCORES.title
                        ? m.search_match_title()
                        : m.search_match_content()}
                    </Badge>
                    <Badge className="lowercase" variant="primary">
                      {doc.category}
                    </Badge>
                  </span>
                </span>

                <span className="text-muted-foreground text-sm">
                  {doc.description}
                </span>

                {doc.tags.length > 0 && (
                  <span className="text-muted-foreground text-xs">
                    {doc.tags.map((tag) => `#${tag}`).join(" ")}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
