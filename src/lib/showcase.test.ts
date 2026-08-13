import { describe, expect, it } from "vitest";

import type { Experience } from "@/app/(fr)/(content)/(root)/_components/experiences/content";
import type { Project } from "@/app/(fr)/(content)/(root)/_components/projects/content";
import {
  duplicateIds,
  experiencePages,
  findBySlug,
  neighbours,
  projectPages,
  toProjectEntry,
} from "@/lib/showcase";

const message = (value: string) => () => value;

const project = (overrides: Partial<Project> = {}): Project =>
  ({
    description: [message("fait une chose"), message("et une autre")],
    id: "un-projet",
    link: "https://example.com",
    name: "un projet",
    skills: ["TypeScript"],
    title: message("un projet qui fait des choses"),
    type: message("librairie"),
    ...overrides,
  }) as Project;

const experience = (
  overrides: Partial<Experience> = {}
): Experience =>
  ({
    company: "Une Société",
    description: [message("a fait des choses")],
    id: "une-societe",
    kind: "job",
    period: { start: "2020" },
    skills: ["React"],
    title: message("Développeur"),
    ...overrides,
  }) as Experience;

describe("projectPages", () => {
  it("garde l'ordre de déclaration", () => {
    const items = projectPages([
      project({ id: "b" }),
      project({ id: "a" }),
    ]);

    expect(items.map((item) => item.id)).toEqual(["b", "a"]);
  });

  it("écarte un id qui ne peut pas devenir un segment d'URL", () => {
    const items = projectPages([
      project({ id: "Projet Accentué É" }),
      project({ id: "avec espace" }),
      project({ id: "" }),
      project({ id: "valide-2" }),
    ]);

    expect(items.map((item) => item.id)).toEqual(["valide-2"]);
  });
});

describe("experiencePages", () => {
  /**
   * Les trois formations du dépôt n'ont ni puces ni compétences : leur fiche se
   * réduirait à un intitulé et deux dates, déjà lisibles sur /cv.
   */
  it("écarte une entrée sans puces ni compétences", () => {
    const items = experiencePages([
      experience({ id: "poste" }),
      experience({
        description: undefined,
        id: "formation",
        kind: "education",
        skills: undefined,
      }),
    ]);

    expect(items.map((item) => item.id)).toEqual(["poste"]);
  });

  it("garde une formation qui a des compétences", () => {
    const items = experiencePages([
      experience({
        description: undefined,
        id: "master",
        kind: "education",
        skills: ["Java"],
      }),
    ]);

    expect(items.map((item) => item.id)).toEqual(["master"]);
  });

  it("garde une entrée qui n'a que des puces", () => {
    const items = experiencePages([
      experience({ id: "stage", skills: [] }),
    ]);

    expect(items.map((item) => item.id)).toEqual(["stage"]);
  });
});

describe("findBySlug", () => {
  it("trouve par identifiant exact", () => {
    const items = [project({ id: "a" }), project({ id: "b" })];

    expect(findBySlug(items, "b")?.id).toBe("b");
  });

  it("rend null pour un slug inconnu", () => {
    expect(findBySlug([project({ id: "a" })], "z")).toBeNull();
    expect(findBySlug([], "a")).toBeNull();
  });
});

describe("neighbours", () => {
  const items = [
    project({ id: "a" }),
    project({ id: "b" }),
    project({ id: "c" }),
  ];

  it("donne la fiche précédente et la suivante", () => {
    const { next, previous } = neighbours(items, "b");

    expect(previous?.id).toBe("a");
    expect(next?.id).toBe("c");
  });

  /** pas d'anneau : la dernière fiche ne renvoie pas à la première */
  it("n'a pas de suivant sur la dernière, ni de précédent sur la première", () => {
    expect(neighbours(items, "c").next).toBeNull();
    expect(neighbours(items, "c").previous?.id).toBe("b");
    expect(neighbours(items, "a").previous).toBeNull();
    expect(neighbours(items, "a").next?.id).toBe("b");
  });

  it("rend deux fois null pour un slug absent", () => {
    expect(neighbours(items, "inconnu")).toEqual({
      next: null,
      previous: null,
    });
  });

  it("rend deux fois null sur une liste d'un seul élément", () => {
    expect(neighbours([project({ id: "seul" })], "seul")).toEqual({
      next: null,
      previous: null,
    });
  });
});

describe("duplicateIds", () => {
  it("ne signale rien quand les identifiants sont uniques", () => {
    expect(
      duplicateIds([{ id: "a" }, { id: "b" }, { id: "c" }])
    ).toEqual([]);
  });

  /**
   * Deux entrées partageant un id produiraient UNE seule page : la seconde
   * serait injoignable, et ni le build ni un test de rendu ne le dirait.
   */
  it("signale les identifiants partagés, triés", () => {
    expect(
      duplicateIds([
        { id: "b" },
        { id: "a" },
        { id: "b" },
        { id: "a" },
        { id: "c" },
      ])
    ).toEqual(["a", "b"]);
  });
});

describe("toProjectEntry", () => {
  it("appelle les messages au lieu de les interpoler", () => {
    const entry = toProjectEntry(project(), "fr");

    expect(entry.title).toBe("un projet qui fait des choses");
    expect(entry.type).toBe("librairie");
    expect(entry.highlights).toEqual([
      "fait une chose",
      "et une autre",
    ]);
    // le piège du dépôt : `${message}` compile et rend le code source
    expect(entry.title).not.toContain("=>");
    expect(entry.highlights.join(" ")).not.toContain("function");
  });

  it("recopie ce qui n'est pas traduisible", () => {
    const entry = toProjectEntry(
      project({ id: "x", link: "https://x.dev", name: "X" }),
      "en"
    );

    expect(entry.id).toBe("x");
    expect(entry.name).toBe("X");
    expect(entry.link).toBe("https://x.dev");
  });
});
