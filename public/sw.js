/*
 * Service worker du site.
 *
 * Le manifeste déclarait `display: standalone` sans aucun service worker : le
 * site était installable, mais l'ouvrir sans réseau donnait une page blanche.
 *
 * Trois stratégies, choisies par ce que la ressource garantit :
 *
 *   - les documents HTML passent par le RÉSEAU D'ABORD. C'est le point le plus
 *     important : un HTML servi depuis le cache après un déploiement référence
 *     des chunks qui n'existent plus, et la page se charge sans JavaScript, en
 *     silence. Le cache ne sert donc que de repli hors ligne.
 *   - /_next/static/** passe par le CACHE D'ABORD : ces fichiers portent une
 *     empreinte dans leur nom, leur contenu ne change jamais. Les anciens
 *     deviennent inutiles, ils ne deviennent pas faux.
 *   - polices et images : cache d'abord également, mêmes garanties.
 *
 * Tout le reste — API, payloads RSC, /_vercel — va au réseau sans mise en cache.
 *
 * `VERSION` est à incrémenter quand la STRATÉGIE change, pas à chaque
 * déploiement : la correction ne repose pas dessus, puisque le HTML n'est jamais
 * servi depuis le cache tant que le réseau répond.
 */

// v2 : ajout du périmé-puis-revalidé pour l'index de recherche et de la mise en
// cache de /_next/image. La stratégie a changé, donc les anciens caches doivent
// partir — c'est précisément le rôle de ce numéro.
const VERSION = "v2";
const ASSET_CACHE = `assets-${VERSION}`;
const PAGE_CACHE = `pages-${VERSION}`;
const OFFLINE_URL = "/offline.html";

/** au-delà, les pages les plus anciennes sont évincées */
const MAX_PAGES = 60;

const CURRENT_CACHES = new Set([ASSET_CACHE, PAGE_CACHE]);

const IMMUTABLE_PREFIX = "/_next/static/";

/**
 * Les images passées par l'optimiseur.
 *
 * `/_next/image?url=…&w=…&q=…` n'a NI extension NI le préfixe /_next/static, donc
 * il échappait à `isAsset` comme à `isImmutable` : aucune image optimisée n'était
 * mise en cache, et une page relue hors ligne s'affichait sans ses visuels. Le
 * cache d'abord est sûr ici parce que l'URL encode entièrement la transformation
 * — changer de source, de largeur ou de qualité change l'URL.
 */
const OPTIMIZED_IMAGE_PATH = "/_next/image";

/**
 * L'index de recherche : à mettre en cache, mais JAMAIS en cache d'abord.
 *
 * Il est sous /api/, donc `NEVER_CACHED` l'excluait et ⌘K ne fonctionnait pas
 * hors ligne. Mais un index figé est pire qu'un index absent : il renverrait
 * éternellement des résultats pour des contenus disparus et ignorerait les
 * nouveaux, sans que rien ne l'indique. D'où le périmé-puis-revalidé : la copie
 * en cache répond tout de suite, et la version fraîche la remplace en fond.
 */
const SEARCH_INDEX_PREFIX = "/api/search/";

const NEVER_CACHED = ["/api/", "/_vercel/", "/sw.js"];
const ASSET_EXTENSIONS = [
  ".woff",
  ".woff2",
  ".ttf",
  ".otf",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".avif",
  ".svg",
  ".ico",
  ".css",
  ".js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(PAGE_CACHE);
      await cache.add(new Request(OFFLINE_URL, { cache: "reload" }));
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((name) => !CURRENT_CACHES.has(name))
          .map((name) => caches.delete(name))
      );
      await self.clients.claim();
    })()
  );
});

const trim = async (cacheName, maxEntries) => {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();

  // les clés sont dans l'ordre d'insertion : les plus anciennes d'abord
  for (const key of keys.slice(0, keys.length - maxEntries)) {
    await cache.delete(key);
  }
};

const isImmutable = (url) =>
  url.pathname.startsWith(IMMUTABLE_PREFIX);

const isAsset = (url) =>
  ASSET_EXTENSIONS.some((extension) =>
    url.pathname.endsWith(extension)
  );

const isOptimizedImage = (url) =>
  url.pathname === OPTIMIZED_IMAGE_PATH;

const isSearchIndex = (url) =>
  url.pathname.startsWith(SEARCH_INDEX_PREFIX);

const isNeverCached = (url) =>
  NEVER_CACHED.some((prefix) => url.pathname.startsWith(prefix));

/**
 * Périmé-puis-revalidé : répond depuis le cache, rafraîchit en fond.
 *
 * Réservé à l'index de recherche. La requête de fond n'est pas attendue — le but
 * est justement de ne pas faire patienter — et son échec est sans conséquence,
 * puisque la réponse a déjà été servie.
 */
const staleWhileRevalidate = async (request) => {
  const cache = await caches.open(ASSET_CACHE);
  const cached = await cache.match(request);

  const refresh = (async () => {
    try {
      const response = await fetch(request);

      if (response.ok && response.status === 200) {
        await cache.put(request, response.clone());
      }

      return response;
    } catch {
      return null;
    }
  })();

  if (cached) {
    return cached;
  }

  const fresh = await refresh;

  return fresh ?? Response.error();
};

/** cache d'abord : le contenu est garanti stable par son URL */
const cacheFirst = async (request) => {
  const cache = await caches.open(ASSET_CACHE);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  const response = await fetch(request);

  // une réponse partielle ou une erreur ne doit pas être mémorisée
  if (response.ok && response.status === 200) {
    await cache.put(request, response.clone());
  }

  return response;
};

/**
 * Réseau d'abord, cache en repli, page hors ligne en dernier recours.
 *
 * L'ordre compte : servir un HTML depuis le cache alors que le réseau répond
 * afficherait une version périmée du site, avec ses références de scripts
 * périmées elles aussi.
 */
const networkFirst = async (request) => {
  const cache = await caches.open(PAGE_CACHE);

  try {
    const response = await fetch(request);

    if (response.ok) {
      await cache.put(request, response.clone());
      await trim(PAGE_CACHE, MAX_PAGES);
    }

    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }

    const offline = await cache.match(OFFLINE_URL);
    if (offline) {
      return offline;
    }

    return Response.error();
  }
};

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  // même origine seulement : un CDN tiers a ses propres règles de cache, et on
  // n'a aucune garantie sur ce qu'il renvoie
  if (url.origin !== self.location.origin) {
    return;
  }

  // testé AVANT isNeverCached, qui exclut tout /api/ : c'est la seule exception,
  // et elle est volontairement limitée à cette route
  if (isSearchIndex(url)) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  if (isNeverCached(url)) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }

  if (isImmutable(url) || isAsset(url) || isOptimizedImage(url)) {
    event.respondWith(cacheFirst(request));
  }
});
