import { describe, expect, it } from "vitest";

import { canStep, stepIndex } from "@/lib/cycle";

describe("stepIndex", () => {
  it("avance et recule d'un pas à l'intérieur de la liste", () => {
    expect(stepIndex(0, 1, 3, true)).toBe(1);
    expect(stepIndex(1, 1, 3, true)).toBe(2);
    expect(stepIndex(2, -1, 3, true)).toBe(1);
    expect(stepIndex(1, -1, 3, false)).toBe(0);
  });

  it("tourne en rond quand la liste boucle", () => {
    expect(stepIndex(2, 1, 3, true)).toBe(0);
    expect(stepIndex(0, -1, 3, true)).toBe(2);
  });

  it("bute aux extrémités quand elle ne boucle pas", () => {
    expect(stepIndex(2, 1, 3, false)).toBe(2);
    expect(stepIndex(0, -1, 3, false)).toBe(0);
  });
});

describe("canStep", () => {
  it("est toujours vrai sur une liste qui boucle", () => {
    expect(canStep(0, -1, 3, true)).toBe(true);
    expect(canStep(2, 1, 3, true)).toBe(true);
  });

  it("est faux au bord d'une liste qui ne boucle pas", () => {
    expect(canStep(0, -1, 3, false)).toBe(false);
    expect(canStep(2, 1, 3, false)).toBe(false);
    expect(canStep(0, 1, 3, false)).toBe(true);
    expect(canStep(2, -1, 3, false)).toBe(true);
    expect(canStep(1, 1, 3, false)).toBe(true);
  });
});
