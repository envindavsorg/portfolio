/**
 * Empreintes et identifiants, via la Web Crypto API du navigateur.
 *
 * Aucune donnée ne quitte la page : tout est calculé localement.
 */

export const HASH_ALGORITHMS = [
  "SHA-1",
  "SHA-256",
  "SHA-384",
  "SHA-512",
] as const;

export type HashAlgorithm = (typeof HASH_ALGORITHMS)[number];

export const isHashAlgorithm = (
  value: string
): value is HashAlgorithm =>
  (HASH_ALGORITHMS as readonly string[]).includes(value);

/** convertit un buffer en hexadécimal minuscule, deux caractères par octet */
export const toHex = (buffer: ArrayBuffer): string =>
  Array.from(new Uint8Array(buffer), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");

export const digest = async (
  text: string,
  algorithm: HashAlgorithm
): Promise<string> => {
  const bytes = new TextEncoder().encode(text);
  const hashed = await crypto.subtle.digest(algorithm, bytes);
  return toHex(hashed);
};

const UUID_V4_FALLBACK_VARIANT = 0x80;
const UUID_V4_VERSION = 0x40;

/**
 * UUID v4. `crypto.randomUUID` n'existe pas dans les contextes non sécurisés
 * (HTTP en réseau local, certains WebView) : on retombe alors sur
 * `getRandomValues`, qui reste cryptographiquement sûr — jamais sur Math.random.
 */
export const randomUuid = (): string => {
  if (typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);

  // version 4 sur les 4 bits hauts de l'octet 6, variante RFC 4122 sur l'octet 8 :
  // la RFC impose ces masques, il n'y a pas d'équivalent non binaire
  // oxlint-disable-next-line eslint/no-bitwise -- masques de bits imposés par la RFC 4122
  bytes[6] = (bytes[6] & 0x0f) | UUID_V4_VERSION;
  // oxlint-disable-next-line eslint/no-bitwise -- masques de bits imposés par la RFC 4122
  bytes[8] = (bytes[8] & 0x3f) | UUID_V4_FALLBACK_VARIANT;

  const hex = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, "0")
  );

  return [
    hex.slice(0, 4).join(""),
    hex.slice(4, 6).join(""),
    hex.slice(6, 8).join(""),
    hex.slice(8, 10).join(""),
    hex.slice(10, 16).join(""),
  ].join("-");
};
