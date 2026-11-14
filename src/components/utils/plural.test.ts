import { describe, expect, it } from "vitest";

import { isPlural } from "@/components/utils/plural";

describe("isPlural", () => {
  it("garde zéro au singulier en français", () => {
    expect(isPlural(0, "fr")).toBe(false);
    expect(isPlural(1, "fr")).toBe(false);
    expect(isPlural(2, "fr")).toBe(true);
  });

  it("met zéro au pluriel en anglais", () => {
    expect(isPlural(0, "en")).toBe(true);
    expect(isPlural(1, "en")).toBe(false);
    expect(isPlural(2, "en")).toBe(true);
  });
});
