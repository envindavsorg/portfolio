"use client";

import { useCallback, useEffect, useState } from "react";

import type { SearchDoc } from "@/lib/search";
import { getLocale } from "@/paraglide/runtime";

const EMPTY: SearchDoc[] = [];

/**
 * Cache au niveau du MODULE, et pas dans un état de composant.
 *
 * La palette ⌘K et la page /search consomment le même index. Un cache par
 * composant le téléchargerait deux fois sur /search — exactement le défaut qu'on
 * corrige, déplacé du serveur vers le client.
 */
const cache = new Map<string, SearchDoc[]>();
const inflight = new Map<string, Promise<SearchDoc[]>>();

const request = async (locale: string): Promise<SearchDoc[]> => {
  const response = await fetch(`/api/search/${locale}`);

  if (!response.ok) {
    throw new Error(`index de recherche : ${response.status}`);
  }

  const docs = (await response.json()) as SearchDoc[];
  cache.set(locale, docs);

  return docs;
};

const fetchIndex = async (locale: string): Promise<SearchDoc[]> => {
  const cached = cache.get(locale);
  if (cached) {
    return cached;
  }

  // dédoublonnage des appels concurrents : la palette peut se précharger au
  // survol pendant que la page /search demande déjà le même index
  const pending = inflight.get(locale);
  if (pending) {
    return await pending;
  }

  const started = request(locale);
  inflight.set(locale, started);

  try {
    return await started;
  } finally {
    inflight.delete(locale);
  }
};

/**
 * Précharge l'index sans attendre l'ouverture.
 *
 * Appelé au survol et au focus du déclencheur : le temps qu'un visiteur amène sa
 * souris jusqu'au bouton puis clique, l'index est déjà là, donc la palette ne
 * s'ouvre jamais vide en pratique.
 */
export const prefetchSearchIndex = (): void => {
  void (async () => {
    try {
      await fetchIndex(getLocale());
    } catch {
      // sans conséquence ici : useSearchIndex refait la demande à l'ouverture
      // et expose l'état d'erreur à ce moment-là, quand il y a quelqu'un pour
      // le lire
    }
  })();
};

interface SearchIndexState {
  docs: SearchDoc[];
  /** vrai tant que le premier chargement n'a pas abouti ou échoué */
  loading: boolean;
  /** l'index est inaccessible — hors ligne, ou 404 après un déploiement */
  failed: boolean;
}

/**
 * L'index de recherche, chargé à la demande.
 *
 * `enabled` sépare les deux usages : la page /search en a besoin tout de suite,
 * la palette seulement à la première ouverture. Un échec n'est pas avalé
 * silencieusement — il est exposé pour que l'appelant puisse le dire, plutôt que
 * d'afficher « aucun résultat » à quelqu'un qui a tapé une requête valide.
 */
export const useSearchIndex = (enabled = true): SearchIndexState => {
  const locale = getLocale();
  const [docs, setDocs] = useState<SearchDoc[]>(
    () => cache.get(locale) ?? EMPTY
  );
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    const cached = cache.get(locale);
    if (cached) {
      setDocs(cached);
      return;
    }

    setLoading(true);

    try {
      setDocs(await fetchIndex(locale));
      setFailed(false);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    if (enabled) {
      void load();
    }
  }, [enabled, load]);

  return { docs, failed, loading };
};
