import { describe, expect, it } from "vitest";

import {
  detectTimestamp,
  formatInZone,
  toIsoString,
  toRelativeParts,
  toUnixMillis,
  toUnixSeconds,
  zoneOffset,
} from "@/lib/datetime";

// références calculées hors du code testé (Python, zoneinfo) :
// 1700000000 correspond au 14 novembre 2023 à 22:13:20 UTC
const REFERENCE_SECONDS = 1_700_000_000;
const REFERENCE_ISO = "2023-11-14T22:13:20.000Z";

describe("detectTimestamp", () => {
  it("reconnaît un horodatage en secondes", () => {
    const { kind, date } = detectTimestamp(String(REFERENCE_SECONDS));

    expect(kind).toBe("unix-seconds");
    expect(date?.toISOString()).toBe(REFERENCE_ISO);
  });

  it("reconnaît un horodatage en millisecondes", () => {
    const { kind, date } = detectTimestamp("1700000000123");

    expect(kind).toBe("unix-millis");
    expect(date?.toISOString()).toBe("2023-11-14T22:13:20.123Z");
  });

  it("traite l'époque comme des secondes", () => {
    const { kind, date } = detectTimestamp("0");

    expect(kind).toBe("unix-seconds");
    expect(date?.toISOString()).toBe("1970-01-01T00:00:00.000Z");
  });

  it("accepte un horodatage négatif", () => {
    const { kind, date } = detectTimestamp("-86400");

    expect(kind).toBe("unix-seconds");
    expect(date?.toISOString()).toBe("1969-12-31T00:00:00.000Z");
  });

  it("lit une date ISO 8601", () => {
    const { kind, date } = detectTimestamp(REFERENCE_ISO);

    expect(kind).toBe("iso");
    expect(date?.getTime()).toBe(REFERENCE_SECONDS * 1000);
  });

  it("lit une date ISO avec décalage", () => {
    const { date } = detectTimestamp("2023-11-14T23:13:20+01:00");
    expect(date?.toISOString()).toBe(REFERENCE_ISO);
  });

  it("rejette ce qui n'est pas une date", () => {
    expect(detectTimestamp("").kind).toBe("invalid");
    expect(detectTimestamp("hier").kind).toBe("invalid");
    expect(detectTimestamp("2023-13-45").kind).toBe("invalid");
    expect(detectTimestamp("   ").kind).toBe("invalid");
  });
});

describe("conversions", () => {
  const date = new Date(REFERENCE_ISO);

  it("revient à l'horodatage de départ", () => {
    expect(toUnixSeconds(date)).toBe(REFERENCE_SECONDS);
    expect(toUnixMillis(date)).toBe(REFERENCE_SECONDS * 1000);
    expect(toIsoString(date)).toBe(REFERENCE_ISO);
  });

  it("tronque vers le bas pour les millisecondes partielles", () => {
    // 999 ms ne doivent pas devenir la seconde suivante
    expect(toUnixSeconds(new Date("2023-11-14T22:13:20.999Z"))).toBe(
      REFERENCE_SECONDS
    );
  });
});

describe("formatInZone", () => {
  const date = new Date(REFERENCE_ISO);

  it("donne l'heure locale de chaque fuseau", () => {
    // valeurs vérifiées avec zoneinfo : Paris 23:13, New York 17:13, Tokyo 07:13 le 15
    expect(formatInZone(date, "UTC")).toContain("22:13:20");
    expect(formatInZone(date, "Europe/Paris")).toContain("23:13:20");
    expect(formatInZone(date, "America/New_York")).toContain(
      "17:13:20"
    );

    const tokyo = formatInZone(date, "Asia/Tokyo");
    expect(tokyo).toContain("07:13:20");
    expect(tokyo).toContain("15");
  });
});

describe("zoneOffset", () => {
  it("suit l'heure d'été", () => {
    // Paris est à +01:00 en novembre et à +02:00 en juillet : un décalage figé
    // donnerait une heure fausse la moitié de l'année
    expect(zoneOffset(new Date(REFERENCE_ISO), "Europe/Paris")).toBe(
      "+01:00"
    );
    expect(
      zoneOffset(new Date("2023-07-14T12:00:00Z"), "Europe/Paris")
    ).toBe("+02:00");
  });

  it("renvoie +00:00 pour UTC", () => {
    expect(zoneOffset(new Date(REFERENCE_ISO), "UTC")).toBe("+00:00");
  });
});

describe("toRelativeParts", () => {
  const now = new Date(REFERENCE_ISO);

  const at = (offsetSeconds: number) =>
    new Date(now.getTime() + offsetSeconds * 1000);

  it("choisit l'unité la plus parlante", () => {
    expect(toRelativeParts(at(30), now)).toEqual({
      unit: "second",
      value: 30,
    });
    expect(toRelativeParts(at(600), now)).toEqual({
      unit: "minute",
      value: 10,
    });
    expect(toRelativeParts(at(7200), now)).toEqual({
      unit: "hour",
      value: 2,
    });
    expect(toRelativeParts(at(3 * 86_400), now)).toEqual({
      unit: "day",
      value: 3,
    });
    expect(toRelativeParts(at(90 * 86_400), now)).toEqual({
      unit: "month",
      value: 3,
    });
    expect(toRelativeParts(at(2 * 31_536_000), now)).toEqual({
      unit: "year",
      value: 2,
    });
  });

  it("garde le signe du passé", () => {
    expect(toRelativeParts(at(-7200), now)).toEqual({
      unit: "hour",
      value: -2,
    });
  });

  it("renvoie zéro pour le même instant", () => {
    expect(toRelativeParts(now, now)).toEqual({
      unit: "second",
      value: 0,
    });
  });
});
