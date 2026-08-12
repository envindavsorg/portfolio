import { describe, expect, it } from "vitest";

import {
  aggregateLanguages,
  getContributionStats,
} from "@/lib/github-stats";

const day = (date: string, count: number): CommitActivity => ({
  count,
  date,
  level: count === 0 ? 0 : 2,
});

/** 2025-06-10, pour ancrer les séries sans dépendre du jour courant */
const TODAY = new Date("2025-06-10T12:00:00Z");

describe("getContributionStats", () => {
  it("returns zeroed stats for no data", () => {
    const stats = getContributionStats([], TODAY);

    expect(stats.total).toBe(0);
    expect(stats.currentStreak).toBe(0);
    expect(stats.longestStreak).toBe(0);
    expect(stats.bestDay).toBeNull();
  });

  it("sums the total and counts active days", () => {
    const stats = getContributionStats(
      [
        day("2025-06-01", 3),
        day("2025-06-02", 0),
        day("2025-06-03", 5),
      ],
      TODAY
    );

    expect(stats.total).toBe(8);
    expect(stats.activeDays).toBe(2);
  });

  it("finds the busiest day", () => {
    const stats = getContributionStats(
      [
        day("2025-06-01", 3),
        day("2025-06-02", 11),
        day("2025-06-03", 5),
      ],
      TODAY
    );

    expect(stats.bestDay).toEqual({ count: 11, date: "2025-06-02" });
  });

  it("returns no best day when nothing was ever contributed", () => {
    const stats = getContributionStats(
      [day("2025-06-01", 0), day("2025-06-02", 0)],
      TODAY
    );

    expect(stats.bestDay).toBeNull();
  });

  it("measures the longest streak of consecutive days", () => {
    const stats = getContributionStats(
      [
        day("2025-06-01", 1),
        day("2025-06-02", 1),
        day("2025-06-03", 1),
        day("2025-06-04", 0),
        day("2025-06-05", 1),
      ],
      TODAY
    );

    expect(stats.longestStreak).toBe(3);
  });

  it("does not join days separated by a gap in the data", () => {
    // 06-01 puis 06-05 : pas de série de 2, les jours ne sont pas adjacents
    const stats = getContributionStats(
      [day("2025-06-01", 1), day("2025-06-05", 1)],
      TODAY
    );

    expect(stats.longestStreak).toBe(1);
  });

  it("counts a streak running up to today", () => {
    const stats = getContributionStats(
      [
        day("2025-06-08", 2),
        day("2025-06-09", 1),
        day("2025-06-10", 4),
      ],
      TODAY
    );

    expect(stats.currentStreak).toBe(3);
  });

  it("keeps the streak alive when today has no commit yet", () => {
    // la journée n'est pas finie : une série qui s'arrête hier reste en cours
    const stats = getContributionStats(
      [
        day("2025-06-08", 2),
        day("2025-06-09", 1),
        day("2025-06-10", 0),
      ],
      TODAY
    );

    expect(stats.currentStreak).toBe(2);
  });

  it("reports no current streak once two days are missed", () => {
    const stats = getContributionStats(
      [
        day("2025-06-07", 5),
        day("2025-06-08", 0),
        day("2025-06-09", 0),
      ],
      TODAY
    );

    expect(stats.currentStreak).toBe(0);
  });

  it("ignores future days from the calendar year", () => {
    // le calendrier GitHub court jusqu'au 31 décembre, à zéro contribution
    const stats = getContributionStats(
      [
        day("2025-06-09", 1),
        day("2025-06-10", 2),
        day("2025-06-11", 0),
        day("2025-12-31", 0),
      ],
      TODAY
    );

    expect(stats.currentStreak).toBe(2);
  });

  it("is order-independent", () => {
    const unordered = [
      day("2025-06-10", 1),
      day("2025-06-08", 1),
      day("2025-06-09", 1),
    ];

    expect(getContributionStats(unordered, TODAY).currentStreak).toBe(
      3
    );
  });
});

const repo = (
  langs: [string, number, string | null][]
): GitHubLanguageNode => ({
  languages: {
    edges: langs.map(([name, size, color]) => ({
      node: { color, name },
      size,
    })),
  },
});

describe("aggregateLanguages", () => {
  it("sums the same language across repositories", () => {
    const shares = aggregateLanguages([
      repo([["TypeScript", 700, "#3178c6"]]),
      repo([["TypeScript", 300, "#3178c6"]]),
    ]);

    expect(shares).toHaveLength(1);
    expect(shares[0].size).toBe(1000);
    expect(shares[0].percent).toBe(100);
  });

  it("computes percentages and sorts by size", () => {
    const shares = aggregateLanguages([
      repo([
        ["CSS", 250, "#563d7c"],
        ["TypeScript", 750, "#3178c6"],
      ]),
    ]);

    expect(shares.map((s) => s.name)).toEqual(["TypeScript", "CSS"]);
    expect(shares[0].percent).toBe(75);
    expect(shares[1].percent).toBe(25);
  });

  it("falls back to a neutral colour when GitHub returns none", () => {
    const shares = aggregateLanguages([
      repo([["Brainfuck", 10, null]]),
    ]);

    expect(shares[0].color).toBe("#8b8b8b");
  });

  it("excludes forks so the split reflects own code", () => {
    const shares = aggregateLanguages([
      { ...repo([["Java", 10_000, "#b07219"]]), isFork: true },
      repo([["Go", 100, "#00ADD8"]]),
    ]);

    expect(shares.map((s) => s.name)).toEqual(["Go"]);
    expect(shares[0].percent).toBe(100);
  });

  it("skips repositories with no language data", () => {
    const shares = aggregateLanguages([
      { languages: null },
      {},
      repo([["Go", 100, "#00ADD8"]]),
    ]);

    expect(shares.map((s) => s.name)).toEqual(["Go"]);
  });

  it("returns an empty list when nothing has any size", () => {
    expect(
      aggregateLanguages([repo([["Go", 0, "#00ADD8"]])])
    ).toEqual([]);
    expect(aggregateLanguages([])).toEqual([]);
  });

  it("tolerates null edges", () => {
    const shares = aggregateLanguages([
      {
        languages: {
          edges: [
            null,
            { node: { color: "#f00", name: "Rust" }, size: 5 },
          ],
        },
      },
    ]);

    expect(shares.map((s) => s.name)).toEqual(["Rust"]);
  });

  it("keeps only the top N languages", () => {
    const shares = aggregateLanguages(
      [
        repo([
          ["A", 100, "#1"],
          ["B", 90, "#2"],
          ["C", 80, "#3"],
          ["D", 70, "#4"],
        ]),
      ],
      2
    );

    expect(shares.map((s) => s.name)).toEqual(["A", "B"]);
  });
});
