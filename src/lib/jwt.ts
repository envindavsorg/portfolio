/**
 * Décodage de JWT, côté client et sans dépendance.
 *
 * IMPORTANT : décoder n'est PAS vérifier. La signature n'est pas contrôlée —
 * cela demanderait la clé secrète, qui n'a rien à faire dans un navigateur. Le
 * contenu d'un jeton non vérifié ne doit jamais être considéré comme fiable.
 */

export type JwtErrorCode =
  | "empty"
  | "malformed"
  | "invalid_base64"
  | "invalid_json";

export interface JwtClaims {
  /** date d'expiration, si le claim `exp` est présent et valide */
  expiresAt: Date | null;
  /** date d'émission, si le claim `iat` est présent et valide */
  issuedAt: Date | null;
  /** date de début de validité, si le claim `nbf` est présent et valide */
  notBefore: Date | null;
  /** vrai uniquement si `exp` existe ET est dépassé */
  isExpired: boolean;
}

export interface DecodedJwt {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  /** signature brute, telle qu'écrite dans le jeton (non vérifiée) */
  signature: string;
  claims: JwtClaims;
}

export type JwtResult =
  | { ok: true; value: DecodedJwt }
  | { ok: false; error: JwtErrorCode };

const BASE64URL = /^[A-Za-z0-9_-]*$/u;

/**
 * Décode un segment base64url : alphabet `-_` au lieu de `+/`, et padding
 * omis — `atob` exige les deux conversions.
 */
const decodeSegment = (segment: string): string | null => {
  if (!BASE64URL.test(segment)) {
    return null;
  }

  const base64 = segment.replaceAll("-", "+").replaceAll("_", "/");
  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    "="
  );

  try {
    const binary = atob(padded);
    const bytes = Uint8Array.from(
      binary,
      (char) => char.codePointAt(0) ?? 0
    );
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return null;
  }
};

const isPlainObject = (
  value: unknown
): value is Record<string, unknown> =>
  typeof value === "object" &&
  value !== null &&
  !Array.isArray(value);

const parseJson = (raw: string): Record<string, unknown> | null => {
  try {
    const parsed: unknown = JSON.parse(raw);
    return isPlainObject(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

/** les dates JWT sont des secondes depuis epoch, pas des millisecondes */
const toDate = (value: unknown): Date | null => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }
  const date = new Date(value * 1000);
  return Number.isNaN(date.getTime()) ? null : date;
};

const readClaims = (
  payload: Record<string, unknown>,
  now: Date
): JwtClaims => {
  const expiresAt = toDate(payload.exp);

  return {
    expiresAt,
    isExpired:
      expiresAt !== null && expiresAt.getTime() <= now.getTime(),
    issuedAt: toDate(payload.iat),
    notBefore: toDate(payload.nbf),
  };
};

export const decodeJwt = (
  token: string,
  now: Date = new Date()
): JwtResult => {
  const trimmed = token.trim();
  if (!trimmed) {
    return { error: "empty", ok: false };
  }

  const parts = trimmed.split(".");
  if (parts.length !== 3) {
    return { error: "malformed", ok: false };
  }

  const [rawHeader, rawPayload, signature] = parts;
  if (!(rawHeader && rawPayload)) {
    return { error: "malformed", ok: false };
  }

  const headerJson = decodeSegment(rawHeader);
  const payloadJson = decodeSegment(rawPayload);
  if (!(headerJson && payloadJson)) {
    return { error: "invalid_base64", ok: false };
  }

  const header = parseJson(headerJson);
  const payload = parseJson(payloadJson);
  if (!(header && payload)) {
    return { error: "invalid_json", ok: false };
  }

  return {
    ok: true,
    value: {
      claims: readClaims(payload, now),
      header,
      payload,
      signature,
    },
  };
};
