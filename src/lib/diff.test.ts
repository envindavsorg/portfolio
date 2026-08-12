import { describe, expect, it } from "vitest";

import { diffLines, MAX_LINES } from "@/lib/diff";

const render = (left: string, right: string) =>
  diffLines(left, right).lines.map(
    (line) =>
      `${{ added: "+", equal: " ", removed: "-" }[line.type]}${line.text}`
  );

describe("diffLines", () => {
  it("marks identical text as unchanged", () => {
    const result = diffLines("a\nb", "a\nb");

    expect(result.stats).toEqual({
      added: 0,
      removed: 0,
      unchanged: 2,
    });
    expect(result.lines.every((l) => l.type === "equal")).toBe(true);
  });

  it("detects an inserted line and keeps the rest stable", () => {
    expect(render("a\nc", "a\nb\nc")).toEqual([" a", "+b", " c"]);
  });

  it("detects a removed line", () => {
    expect(render("a\nb\nc", "a\nc")).toEqual([" a", "-b", " c"]);
  });

  it("represents a modified line as a removal then an addition", () => {
    expect(render("a\nold\nc", "a\nnew\nc")).toEqual([
      " a",
      "-old",
      "+new",
      " c",
    ]);
  });

  it("handles an empty left side as all additions", () => {
    const result = diffLines("", "a\nb");

    expect(result.stats).toEqual({
      added: 2,
      removed: 0,
      unchanged: 0,
    });
  });

  it("handles an empty right side as all removals", () => {
    const result = diffLines("a\nb", "");

    expect(result.stats).toEqual({
      added: 0,
      removed: 2,
      unchanged: 0,
    });
  });

  it("returns nothing for two empty inputs", () => {
    const result = diffLines("", "");

    expect(result.lines).toEqual([]);
    expect(result.truncated).toBe(false);
  });

  it("numbers lines per side", () => {
    const { lines } = diffLines("a\nb\nc", "a\nc");

    expect(
      lines.map((l) => [l.type, l.leftLine, l.rightLine])
    ).toEqual([
      ["equal", 1, 1],
      ["removed", 2, null],
      ["equal", 3, 2],
    ]);
  });

  it("normalises CRLF so line endings alone are not a diff", () => {
    const result = diffLines("a\r\nb", "a\nb");

    expect(result.stats.unchanged).toBe(2);
    expect(result.stats.added).toBe(0);
  });

  it("finds the longest common subsequence, not just a prefix", () => {
    // « a c e » est commun : seules b et d bougent
    const result = diffLines("a\nb\nc\nd\ne", "a\nc\ne");

    expect(result.stats).toEqual({
      added: 0,
      removed: 2,
      unchanged: 3,
    });
  });

  it("preserves blank lines as content", () => {
    const result = diffLines("a\n\nb", "a\nb");

    expect(result.stats.removed).toBe(1);
    expect(result.lines.find((l) => l.type === "removed")?.text).toBe(
      ""
    );
  });

  it("refuses inputs beyond the size limit instead of hanging", () => {
    const huge = Array.from(
      { length: MAX_LINES + 1 },
      (_, i) => `line ${i}`
    ).join("\n");

    const result = diffLines(huge, "a");

    expect(result.truncated).toBe(true);
    expect(result.lines).toEqual([]);
  });

  it("still processes input exactly at the limit", () => {
    const atLimit = Array.from(
      { length: MAX_LINES },
      (_, i) => `line ${i}`
    ).join("\n");

    const result = diffLines(atLimit, atLimit);

    expect(result.truncated).toBe(false);
    expect(result.stats.unchanged).toBe(MAX_LINES);
  });
});
