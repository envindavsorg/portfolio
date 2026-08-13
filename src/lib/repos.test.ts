import { describe, expect, it } from "vitest";

import { DEFAULT_LANGUAGE_COLOR } from "./github-stats";
import { selectRepos } from "./repos";

/**
 * Aucun jeton GitHub valide n'existe en test ni en intégration continue : la
 * réponse de l'API y est toujours vide. C'est donc ICI, et nulle part ailleurs,
 * que la sélection des dépôts est vraiment vérifiée.
 */

const repo = (
  overrides: Partial<GitHubRepoNode> = {}
): GitHubRepoNode => ({
  description: "un dépôt",
  forkCount: 0,
  name: "depot",
  primaryLanguage: { color: "#3178c6", name: "TypeScript" },
  pushedAt: "2026-01-01T00:00:00Z",
  stargazerCount: 0,
  url: "https://github.com/envindavsorg/depot",
  ...overrides,
});

describe("selectRepos", () => {
  it("écarte les forks", () => {
    const selected = selectRepos([
      repo({ isFork: true, name: "fork" }),
      repo({ name: "sien" }),
    ]);

    expect(selected.map((item) => item.name)).toEqual(["sien"]);
  });

  it("écarte un dépôt sans nom ou sans URL", () => {
    const selected = selectRepos([
      repo({ name: null }),
      repo({ url: "" }),
      repo({ name: "  " }),
      repo({ name: "valide" }),
    ]);

    expect(selected.map((item) => item.name)).toEqual(["valide"]);
  });

  it("écarte un dépôt sans description ET sans langage", () => {
    const selected = selectRepos([
      repo({
        description: null,
        name: "coquille",
        primaryLanguage: null,
      }),
      repo({
        description: "   ",
        name: "coquille-blanche",
        primaryLanguage: null,
      }),
      repo({
        description: null,
        name: "langage-seul",
      }),
      repo({
        description: "des notes",
        name: "description-seule",
        primaryLanguage: null,
      }),
    ]);

    expect(selected.map((item) => item.name).toSorted()).toEqual([
      "description-seule",
      "langage-seul",
    ]);
  });

  it("classe par étoiles décroissantes", () => {
    const selected = selectRepos([
      repo({ name: "peu", stargazerCount: 2 }),
      repo({ name: "beaucoup", stargazerCount: 40 }),
      repo({ name: "moyen", stargazerCount: 7 }),
    ]);

    expect(selected.map((item) => item.name)).toEqual([
      "beaucoup",
      "moyen",
      "peu",
    ]);
  });

  /**
   * Le cas ordinaire d'un portfolio, pas un cas limite : tous les dépôts ont
   * zéro étoile, et c'est la date qui doit décider.
   */
  it("à étoiles égales, classe du plus récemment poussé au plus ancien", () => {
    const selected = selectRepos([
      repo({ name: "ancien", pushedAt: "2024-03-02T10:00:00Z" }),
      repo({ name: "recent", pushedAt: "2026-08-01T10:00:00Z" }),
      repo({ name: "median", pushedAt: "2025-11-20T10:00:00Z" }),
    ]);

    expect(selected.map((item) => item.name)).toEqual([
      "recent",
      "median",
      "ancien",
    ]);
  });

  it("à étoiles et date égales, classe par nom", () => {
    const selected = selectRepos([
      repo({ name: "zulu" }),
      repo({ name: "alpha" }),
      repo({ name: "mike" }),
    ]);

    expect(selected.map((item) => item.name)).toEqual([
      "alpha",
      "mike",
      "zulu",
    ]);
  });

  it("place un dépôt sans date après ceux qui en ont une", () => {
    const selected = selectRepos([
      repo({ name: "sans-date", pushedAt: null }),
      repo({ name: "avec-date", pushedAt: "2020-01-01T00:00:00Z" }),
    ]);

    expect(selected.map((item) => item.name)).toEqual([
      "avec-date",
      "sans-date",
    ]);
  });

  it("les étoiles priment sur la date", () => {
    const selected = selectRepos([
      repo({
        name: "recent-sans-etoile",
        pushedAt: "2026-08-12T00:00:00Z",
        stargazerCount: 0,
      }),
      repo({
        name: "ancien-etoile",
        pushedAt: "2019-01-01T00:00:00Z",
        stargazerCount: 3,
      }),
    ]);

    expect(selected.map((item) => item.name)).toEqual([
      "ancien-etoile",
      "recent-sans-etoile",
    ]);
  });

  it("limite le nombre de cartes", () => {
    const many = Array.from({ length: 12 }, (_, index) =>
      repo({ name: `depot-${index}`, stargazerCount: index })
    );

    expect(selectRepos(many)).toHaveLength(6);
    expect(selectRepos(many, { limit: 2 })).toHaveLength(2);
    expect(selectRepos(many, { limit: 0 })).toHaveLength(0);
    expect(selectRepos(many, { limit: -3 })).toHaveLength(0);
  });

  it("ne modifie pas le tableau reçu", () => {
    const input = [
      repo({ name: "b", stargazerCount: 1 }),
      repo({ name: "a", stargazerCount: 9 }),
    ];

    selectRepos(input);

    expect(input.map((item) => item.name)).toEqual(["b", "a"]);
  });

  it("normalise les compteurs absents ou négatifs", () => {
    const [card] = selectRepos([
      repo({ forkCount: null, stargazerCount: -5 }),
    ]);

    expect(card.stars).toBe(0);
    expect(card.forks).toBe(0);
  });

  it("retombe sur le gris partagé quand le langage n'a pas de couleur", () => {
    const [card] = selectRepos([
      repo({ primaryLanguage: { color: null, name: "Brainfuck" } }),
    ]);

    expect(card.language).toEqual({
      color: DEFAULT_LANGUAGE_COLOR,
      name: "Brainfuck",
    });
  });

  it("plafonne les sujets et ignore les vides", () => {
    const [card] = selectRepos([
      repo({
        repositoryTopics: {
          nodes: [
            { topic: { name: "nextjs" } },
            null,
            { topic: { name: "  " } },
            { topic: { name: "react" } },
            { topic: { name: "tailwind" } },
            { topic: { name: "typescript" } },
          ],
        },
      }),
    ]);

    expect(card.topics).toEqual(["nextjs", "react", "tailwind"]);
  });

  it("normalise la description et l'état d'archive", () => {
    const [archived] = selectRepos([
      repo({ description: "  espacé  ", isArchived: true }),
    ]);

    expect(archived.description).toBe("espacé");
    expect(archived.isArchived).toBe(true);

    const [plain] = selectRepos([repo()]);
    expect(plain.isArchived).toBe(false);
    expect(plain.topics).toEqual([]);
  });

  it("rend un tableau vide quand l'API n'a rien renvoyé", () => {
    expect(selectRepos([])).toEqual([]);
  });
});
