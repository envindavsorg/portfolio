import { describe, expect, it } from "vitest";

import { getBreadcrumbJsonLd } from "@/lib/breadcrumb-json-ld";
import { getSiteJsonLd, PERSON_ID, WEBSITE_ID } from "@/lib/json-ld";

/** Le graphe est un tableau de nœuds : retrouver celui d'un type donné. */
const node = (locale: "fr" | "en", type: string) => {
  const graph = getSiteJsonLd(locale)["@graph"] as Record<
    string,
    unknown
  >[];
  const found = graph.find((entry) => entry["@type"] === type);

  if (!found) {
    throw new Error(`nœud ${type} absent du graphe`);
  }

  return found;
};

describe("getSiteJsonLd", () => {
  it("donne un @id stable à chaque nœud", () => {
    expect(node("fr", "WebSite")["@id"]).toBe(WEBSITE_ID);
    expect(node("fr", "Person")["@id"]).toBe(PERSON_ID);
  });

  it("relie le site à la personne au lieu de la répéter", () => {
    // les deux nœuds étaient anonymes : rien ne les reliait, et un moteur y
    // voyait deux entités sans rapport
    expect(node("fr", "WebSite").publisher).toEqual({
      "@id": PERSON_ID,
    });
  });

  it("garde le même @id dans les deux locales", () => {
    // l'entité ne change pas de langue, seule sa description le fait
    expect(node("en", "Person")["@id"]).toBe(
      node("fr", "Person")["@id"]
    );
  });

  it("traduit réellement la description et le titre de poste", () => {
    const fr = node("fr", "Person");
    const en = node("en", "Person");

    // le défaut : `développeur Full-Stack Senior` et la bio française étaient
    // publiés sur toutes les pages /en, qui se déclarent inLanguage en-US
    expect(fr.jobTitle).not.toBe(en.jobTitle);
    expect(String(en.jobTitle)).not.toMatch(/développeur/u);
    expect(String(en.description)).not.toMatch(/développeur/u);
  });

  it("déclare la langue du site sur le nœud WebSite", () => {
    expect(node("fr", "WebSite").inLanguage).toBe("fr-FR");
    expect(node("en", "WebSite").inLanguage).toBe("en-US");
  });

  it("remplit la personne depuis les données du dépôt", () => {
    const person = node("fr", "Person");

    // `knowsAbout` était figé à trois entrées écrites à la main
    expect((person.knowsAbout as string[]).length).toBeGreaterThan(3);
    // les employeurs et les certifications n'étaient pas publiés du tout
    expect((person.worksFor as unknown[]).length).toBe(3);
    expect((person.hasCredential as unknown[]).length).toBe(4);
  });

  it("expose une URL de vérification pour chaque certification", () => {
    const credentials = node("fr", "Person").hasCredential as {
      url?: string;
    }[];

    // une certification sans URL vérifiable est une simple déclaration
    for (const credential of credentials) {
      expect(credential.url).toMatch(/^https:\/\//u);
    }
  });

  it("publie le nom complet, pas le prénom seul", () => {
    // l'auteur des articles s'appelait « florin » et la personne du graphe
    // « florin cuzeac » : deux personnes différentes pour un moteur
    expect(String(node("fr", "Person").name).split(" ")).toHaveLength(
      2
    );
  });
});

const BREADCRUMB_ITEMS = [
  { href: "/", label: "accueil" },
  { href: "/tags", label: "sujets" },
  { label: "react" },
];

// schema-dts type `itemListElement` en union readonly de ~940 variantes : passer
// par `unknown` est le seul chemin honnête pour l'inspecter dans un test
const listElements = (): Record<string, unknown>[] =>
  getBreadcrumbJsonLd(BREADCRUMB_ITEMS)
    .itemListElement as unknown as Record<string, unknown>[];

describe("getBreadcrumbJsonLd", () => {
  it("numérote les positions à partir de 1", () => {
    expect(listElements().map((entry) => entry.position)).toEqual([
      1, 2, 3,
    ]);
  });

  it("n'attribue pas d'item à la page courante", () => {
    const list = listElements();

    expect(list[0].item).toBe("https://cuzeacflorin.fr/");
    // sans quoi la page se déclare comme un lien vers elle-même
    expect(list[2].item).toBeUndefined();
    expect(list[2].name).toBe("react");
  });
});
