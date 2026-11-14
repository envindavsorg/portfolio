import { describe, expect, it } from "vitest";

import { latestUpdate } from "@/lib/content-dates";

const post = (updatedAt: Date | string) => ({
  metadata: { updatedAt },
});

describe("latestUpdate", () => {
  // la liste arrive triée par date de CRÉATION : le plus récemment mis à jour
  // n'est pas forcément le premier
  it("rend la mise à jour la plus récente, où qu'elle soit dans la liste", () => {
    expect(
      latestUpdate([
        post(new Date("2026-03-04T00:00:00.000Z")),
        post(new Date("2026-08-12T00:00:00.000Z")),
        post(new Date("2025-12-01T00:00:00.000Z")),
      ])
    ).toBe("2026-08-12T00:00:00.000Z");
  });

  it("accepte une date écrite en ISO", () => {
    expect(
      latestUpdate([post("2026-02-01"), post("2026-01-31")])
    ).toBe("2026-02-01T00:00:00.000Z");
  });

  // rien à dater : ni l'horloge ni l'époque Unix à la place
  it("ne rend rien pour une liste vide", () => {
    expect(latestUpdate([])).toBeUndefined();
  });
});
