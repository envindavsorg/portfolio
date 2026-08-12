import { describe, expect, it } from "vitest";

import { CERTS } from "@/app/(fr)/(content)/(root)/_components/certs/content";
import { EXPERIENCES } from "@/app/(fr)/(content)/(root)/_components/experiences/content";
import { buildCv } from "@/lib/cv";

const build = (locale: "fr" | "en") =>
  buildCv({
    certs: CERTS,
    experiences: EXPERIENCES,
    locale,
    presentLabel: locale === "en" ? "present" : "aujourd'hui",
  });

/**
 * La signature exacte d'un message Paraglide interpolé au lieu d'être appelé.
 * `/projects.md` a publié précisément cela en production pendant des mois.
 */
const COMPILED_FUNCTION =
  /[=]>|experimentalStaticLocale|function\s*\(/u;

describe("buildCv", () => {
  it("sépare les postes des formations", () => {
    const cv = build("fr");

    expect(cv.jobs).toHaveLength(3);
    expect(cv.education).toHaveLength(3);
    expect(cv.credentials).toHaveLength(4);
  });

  it("n'interpole JAMAIS une fonction de message", () => {
    // le garde-fou qui compte : il porte sur toutes les chaînes produites, dans
    // les deux locales, parce que c'est le défaut qui a réellement été publié
    for (const locale of ["fr", "en"] as const) {
      const cv = build(locale);
      const strings = [...cv.jobs, ...cv.education].flatMap(
        (entry) => [
          entry.title,
          entry.type ?? "",
          ...entry.highlights,
        ]
      );

      expect(strings.length).toBeGreaterThan(10);

      for (const value of strings) {
        expect(value).not.toMatch(COMPILED_FUNCTION);
      }
    }
  });

  it("traduit réellement les intitulés", () => {
    const fr = build("fr");
    const en = build("en");

    expect(fr.jobs[0].title).not.toBe(en.jobs[0].title);
    expect(en.jobs[0].title).not.toMatch(/développeur/iu);
  });

  it("emploie le libellé de fin fourni pour un poste en cours", () => {
    // le poste actuel n'a pas de date de fin : sans ce libellé, la période se
    // terminerait par « undefined »
    expect(build("fr").jobs[0].period).toContain("aujourd'hui");
    expect(build("en").jobs[0].period).toContain("present");
    expect(build("fr").jobs[0].period).not.toContain("undefined");
  });

  it("dédoublonne les compétences en gardant l'ordre", () => {
    const { skills } = build("fr");

    expect(new Set(skills).size).toBe(skills.length);
    // « React » est cité par le poste le plus récent, donc en tête
    expect(skills[0]).toBe("React");
  });

  it("expose une URL de vérification pour chaque certification", () => {
    for (const credential of build("fr").credentials) {
      expect(credential.url).toMatch(/^https:\/\//u);
      expect(credential.credentialId).toBeTruthy();
    }
  });
});
