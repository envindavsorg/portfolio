"use client";

import Link from "next/link";
import type { ChangeEvent } from "react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Label } from "@/components/base/Label";
import { Badge } from "@/components/primitives/Badge";
import { Button } from "@/components/primitives/Button";
import { Input } from "@/components/primitives/Input";
import { useSearchIndex } from "@/hooks/useSearchIndex";
import type { SearchDoc } from "@/lib/search";
import { SCORES, searchDocs } from "@/lib/search";
import { cn } from "@/lib/utils";
import { m } from "@/paraglide/messages";
import { localizeHref } from "@/paraglide/runtime";

const QUERY_KEY = "q";
const MAX_TOPICS = 8;

/**
 * Les sujets les plus fréquents de l'index, pour l'état de départ.
 *
 * Ce sont les libellés déjà traduits que porte l'index, pas les clés : un clic
 * lance une recherche sur le mot affiché, il ne mène pas à /tags/<slug>. À
 * égalité, l'ordre alphabétique — sinon l'ordre dépendrait de celui de l'index.
 */
const topTopics = (docs: SearchDoc[]): string[] => {
  const counts = new Map<string, number>();

  for (const doc of docs) {
    for (const tag of doc.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return [...counts]
    .sort(
      ([tagA, countA], [tagB, countB]) =>
        countB - countA || tagA.localeCompare(tagB)
    )
    .slice(0, MAX_TOPICS)
    .map(([tag]) => tag);
};

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
  const inputRef = useRef<HTMLInputElement>(null);

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
    // le bouton disparaît avec la requête : sans cela le focus retomberait sur
    // <body>, et il faudrait retraverser la page pour retaper quelque chose
    inputRef.current?.focus();
  }, []);

  const handleTopic = useCallback(
    (topic: string, fromKeyboard: boolean) => {
      setQuery(topic);
      writeQuery(topic);
      // au clavier seulement : sur un téléphone, rendre le focus au champ
      // ouvrirait le clavier virtuel par-dessus les résultats demandés
      if (fromKeyboard) {
        inputRef.current?.focus();
      }
    },
    []
  );

  const topics = useMemo(() => topTopics(docs), [docs]);

  const trimmed = query.trim();
  const isEmpty = Boolean(trimmed) && hits.length === 0;

  /**
   * UN message par état, et dans la région live. « 0 résultat » était suivi
   * d'un second paragraphe « aucun résultat pour… » : la même information deux
   * fois à l'écran, et seule la moins utile des deux était annoncée.
   *
   * Les trois cas sans résultat restent distincts : « rien trouvé » affiché
   * pendant le chargement, ou pire à la place d'une panne, ferait croire à une
   * requête sans résultat alors que rien n'a encore été cherché.
   */
  const status = (() => {
    if (!trimmed) {
      return m.search_prompt();
    }
    if (hits.length > 0) {
      return m.search_result_count({
        count: hits.length,
        plural: hits.length > 1 ? "s" : "",
      });
    }
    if (failed) {
      return m.search_unavailable();
    }
    return loading
      ? m.search_loading()
      : m.search_empty({ query: trimmed });
  })();

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
            ref={inputRef}
            spellCheck={false}
            type="search"
            value={query}
          />
          {/* rien à effacer dans un champ vide */}
          {query && (
            <Button onClick={handleClear} size="sm" variant="outline">
              {m.search_clear()}
            </Button>
          )}
        </div>

        <p className="text-muted-foreground text-xs">
          {m.search_shareable()}
        </p>
      </div>

      {/* la mise à jour du nombre de résultats est annoncée : sans région live,
          une personne qui utilise un lecteur d'écran tape sans aucun retour */}
      <p
        aria-live="polite"
        className={cn(
          "px-3 text-sm",
          !isEmpty && "text-muted-foreground"
        )}
        role="status"
      >
        {status}
      </p>

      {/* l'état de départ n'était qu'une phrase au-dessus d'une colonne vide.
          Des boutons et non une liste de liens : `[data-slot] li` désigne les
          résultats, dans la page comme dans ses tests */}
      {!trimmed && topics.length > 0 && (
        <fieldset className="flex flex-wrap items-center gap-2 px-3">
          <legend className="mb-2 text-muted-foreground text-xs">
            {m.writings_tag_links_title()}
          </legend>
          {topics.map((topic) => (
            <button
              className="cursor-pointer rounded-full border border-input px-3 py-1.5 text-sm lowercase transition-colors hover:border-theme hover:text-theme"
              key={topic}
              // `detail` vaut 0 quand le clic vient d'Entrée ou d'Espace
              onClick={(event) =>
                handleTopic(topic, event.detail === 0)
              }
              type="button"
            >
              {topic}
            </button>
          ))}
        </fieldset>
      )}

      {isEmpty && !(loading || failed) && (
        <p className="px-3 text-sm">
          <Link
            className="underline underline-offset-4 hover:text-theme"
            href={localizeHref("/tags")}
          >
            {m.writings_tag_all_topics()}
          </Link>
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
