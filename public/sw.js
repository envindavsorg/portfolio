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

const VERSION = "v1";
const ASSET_CACHE = `assets-${VERSION}`;
const PAGE_CACHE = `pages-${VERSION}`;
const OFFLINE_URL = "/offline.html";

/** au-delà, les pages les plus anciennes sont évincées */
const MAX_PAGES = 60;

const CURRENT_CACHES = new Set([ASSET_CACHE, PAGE_CACHE]);

const IMMUTABLE_PREFIX = "/_next/static/";
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

const isNeverCached = (url) =>
  NEVER_CACHED.some((prefix) => url.pathname.startsWith(prefix));

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
  if (url.origin !== self.location.origin || isNeverCached(url)) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }

  if (isImmutable(url) || isAsset(url)) {
    event.respondWith(cacheFirst(request));
  }
});
