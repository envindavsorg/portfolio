import { describe, expect, it } from "vitest";

import { formatDate } from "./functions";

/**
 * `LL` n'est pas un jeton de dayjs : il vient du greffon `localizedFormat`.
 * Sans lui rien ne casse — dayjs recopie le jeton —, et sept endroits du site
 * ont affiché « écrit le LL » sans qu'aucun test ne le voie. Les valeurs
 * attendues sont écrites à la main, pas recalculées avec dayjs.
 */
describe("formatDate", () => {
  it("développe le format long au lieu de recopier le jeton", () => {
    expect(formatDate("2026-03-03", "LL")).toBe("3 mars 2026");
  });

  it("ne laisse aucun jeton localisé tel quel", () => {
    for (const template of ["L", "LL", "LLL", "LLLL", "LT"]) {
      expect(formatDate("2026-03-03T10:05:00", template)).not.toBe(
        template
      );
    }
  });

  it("garde les formats explicites inchangés", () => {
    expect(formatDate("2026-03-03", "DD MMM YYYY")).toBe(
      "03 mars 2026"
    );
  });
});
