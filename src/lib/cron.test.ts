import { describe, expect, it } from "vitest";

import type { ParsedCron } from "@/lib/cron";
import { describeField, nextRuns, parseCron } from "@/lib/cron";

const parse = (expression: string): ParsedCron => {
  const result = parseCron(expression);
  if (!result.ok) {
    throw new Error(
      `${expression} devrait être valide (${result.reason})`
    );
  }
  return result.cron;
};

const runsFrom = (
  expression: string,
  from: string,
  count: number
): string[] =>
  nextRuns(parse(expression), new Date(from), count).map((date) =>
    date.toISOString().replace(".000Z", "Z")
  );

describe("parseCron", () => {
  it("accepte les cinq champs joker", () => {
    const cron = parse("* * * * *");

    expect(cron.minute.values).toHaveLength(60);
    expect(cron.hour.values).toHaveLength(24);
    expect(cron.dayOfMonth.values).toHaveLength(31);
    expect(cron.month.values).toHaveLength(12);
    expect(cron.dayOfWeek.values).toHaveLength(7);
    expect(cron.minute.isWildcard).toBe(true);
  });

  it("développe les pas", () => {
    expect(parse("*/15 * * * *").minute.values).toEqual([
      0, 15, 30, 45,
    ]);
    expect(parse("5/10 * * * *").minute.values).toEqual([
      5, 15, 25, 35, 45, 55,
    ]);
  });

  it("développe les plages et les listes", () => {
    expect(parse("0 9-12 * * *").hour.values).toEqual([
      9, 10, 11, 12,
    ]);
    expect(parse("0 1,3,5 * * *").hour.values).toEqual([1, 3, 5]);
    expect(parse("0 0-6/2 * * *").hour.values).toEqual([0, 2, 4, 6]);
  });

  it("déduplique et trie une liste redondante", () => {
    expect(parse("0 5,1,5,3 * * *").hour.values).toEqual([1, 3, 5]);
  });

  it("comprend les noms de mois et de jours", () => {
    expect(parse("0 0 1 JAN *").month.values).toEqual([1]);
    expect(parse("0 0 * * MON-FRI").dayOfWeek.values).toEqual([
      1, 2, 3, 4, 5,
    ]);
    expect(parse("0 0 * * sun").dayOfWeek.values).toEqual([0]);
  });

  it("accepte 7 comme alias de dimanche", () => {
    // documenté par crontab(5) : dimanche vaut 0 ou 7
    expect(parse("0 0 * * 7").dayOfWeek.values).toEqual([0]);
  });

  it("refuse un nombre de champs incorrect", () => {
    expect(parseCron("* * * *")).toMatchObject({
      ok: false,
      reason: "field-count",
    });
    expect(parseCron("* * * * * *")).toMatchObject({
      ok: false,
      reason: "field-count",
    });
    expect(parseCron("")).toMatchObject({
      ok: false,
      reason: "empty",
    });
  });

  it("signale le champ fautif", () => {
    expect(parseCron("0 99 * * *")).toMatchObject({
      field: "hour",
      ok: false,
      reason: "out-of-range",
    });
    expect(parseCron("0 0 0 * *")).toMatchObject({
      field: "dayOfMonth",
      ok: false,
      reason: "out-of-range",
    });
    expect(parseCron("0 12-9 * * *")).toMatchObject({
      field: "hour",
      ok: false,
      reason: "reversed-range",
    });
    expect(parseCron("*/0 * * * *")).toMatchObject({
      field: "minute",
      ok: false,
      reason: "bad-step",
    });
    expect(parseCron("0 0 * * lundi")).toMatchObject({
      field: "dayOfWeek",
      ok: false,
      reason: "unknown-value",
    });
  });

  it("refuse une liste avec un élément vide", () => {
    expect(parseCron("0 1,,3 * * *")).toMatchObject({
      field: "hour",
      ok: false,
      reason: "empty",
    });
  });
});

describe("nextRuns", () => {
  // références calculées hors du code testé, avec une implémentation Python
  // indépendante, à partir du 14 novembre 2023 22:13:20 UTC
  const FROM = "2023-11-14T22:13:20Z";

  it("suit un pas de quinze minutes", () => {
    expect(runsFrom("*/15 * * * *", FROM, 4)).toEqual([
      "2023-11-14T22:15:00Z",
      "2023-11-14T22:30:00Z",
      "2023-11-14T22:45:00Z",
      "2023-11-14T23:00:00Z",
    ]);
  });

  it("saute le week-end sur une plage de jours ouvrés", () => {
    expect(runsFrom("0 9 * * 1-5", FROM, 4)).toEqual([
      "2023-11-15T09:00:00Z",
      "2023-11-16T09:00:00Z",
      "2023-11-17T09:00:00Z",
      // vendredi 17 puis lundi 20 : samedi et dimanche sont exclus
      "2023-11-20T09:00:00Z",
    ]);
  });

  it("traverse les mois", () => {
    expect(runsFrom("30 3 1 * *", FROM, 4)).toEqual([
      "2023-12-01T03:30:00Z",
      "2024-01-01T03:30:00Z",
      "2024-02-01T03:30:00Z",
      "2024-03-01T03:30:00Z",
    ]);
  });

  it("applique la règle OU entre jour du mois et jour de semaine", () => {
    // les DEUX champs sont restreints : cron déclenche dès que l'UN correspond,
    // donc tous les lundis ET le 1er du mois, pas seulement les 1ers lundis
    expect(runsFrom("0 0 1 * 1", FROM, 4)).toEqual([
      "2023-11-20T00:00:00Z",
      "2023-11-27T00:00:00Z",
      "2023-12-01T00:00:00Z",
      "2023-12-04T00:00:00Z",
    ]);
  });

  it("traverse les années", () => {
    expect(runsFrom("0 12 25 12 *", FROM, 3)).toEqual([
      "2023-12-25T12:00:00Z",
      "2024-12-25T12:00:00Z",
      "2025-12-25T12:00:00Z",
    ]);
  });

  it("trouve les 29 février", () => {
    expect(runsFrom("0 0 29 2 *", FROM, 3)).toEqual([
      "2024-02-29T00:00:00Z",
      "2028-02-29T00:00:00Z",
      "2032-02-29T00:00:00Z",
    ]);
  });

  it("ne renvoie jamais l'instant de départ", () => {
    const [first] = runsFrom("* * * * *", "2023-11-14T22:13:00Z", 1);
    expect(first).toBe("2023-11-14T22:14:00Z");
  });

  it("renvoie une liste vide pour une date impossible", () => {
    // le 30 février n'existe pas : l'expression est valide mais ne se déclenche jamais
    expect(runsFrom("0 0 30 2 *", FROM, 1)).toEqual([]);
  });
});

describe("describeField", () => {
  it("reconnaît un champ joker", () => {
    expect(
      describeField(parse("* * * * *").minute, "minute")
    ).toEqual({ kind: "every" });
  });

  it("reconnaît une valeur unique", () => {
    expect(
      describeField(parse("30 * * * *").minute, "minute")
    ).toEqual({ kind: "single", value: 30 });
  });

  it("reconnaît un pas régulier", () => {
    expect(
      describeField(parse("*/15 * * * *").minute, "minute")
    ).toEqual({ kind: "step", step: 15 });
  });

  it("retombe sur une liste quand rien de régulier ne se dégage", () => {
    expect(
      describeField(parse("0 1,7,9 * * *").hour, "hour")
    ).toEqual({
      kind: "list",
      values: [1, 7, 9],
    });
  });
});
