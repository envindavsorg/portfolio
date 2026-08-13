import { describe, expect, it } from "vitest";

import { contributionWindow } from "@/lib/commits";

const DAY = 86_400_000;

describe("contributionWindow", () => {
  it("couvre au moins 52 semaines", () => {
    const now = new Date("2026-08-13T10:00:00Z");
    const { from, to } = contributionWindow(now);

    const days = (to.getTime() - from.getTime()) / DAY;

    expect(days).toBeGreaterThanOrEqual(52 * 7 - 1);
    expect(days).toBeLessThan(53 * 7);
  });

  it("commence un dimanche", () => {
    // GitHub renvoie des semaines commençant un dimanche : sans cet alignement,
    // la première colonne de la grille est tronquée
    for (const iso of [
      "2026-08-13T10:00:00Z",
      "2026-01-01T00:30:00Z",
      "2026-12-31T23:00:00Z",
      "2027-03-02T12:00:00Z",
    ]) {
      expect(contributionWindow(new Date(iso)).from.getUTCDay()).toBe(
        0
      );
    }
  });

  it("ne se vide PAS au passage à la nouvelle année", () => {
    /**
     * Le défaut d'origine : la fenêtre était l'année civile, donc au 1er janvier
     * elle ne couvrait plus qu'une journée. Il n'était visible qu'un jour par an.
     */
    const newYear = new Date("2027-01-01T09:00:00Z");
    const { from, to } = contributionWindow(newYear);

    // la fenêtre remonte bien à l'année précédente. On n'assert PAS un millésime
    // précis : 363 jours avant le 1er janvier 2027 tombe un samedi, et
    // l'alignement au dimanche recule alors jusqu'au 28 décembre 2025.
    expect(from.getTime()).toBeLessThan(newYear.getTime());
    expect((to.getTime() - from.getTime()) / DAY).toBeGreaterThan(
      360
    );
  });

  it("avance avec le temps", () => {
    const a = contributionWindow(new Date("2026-08-13T10:00:00Z"));
    const b = contributionWindow(new Date("2026-09-13T10:00:00Z"));

    expect(b.from.getTime()).toBeGreaterThan(a.from.getTime());
  });
});
