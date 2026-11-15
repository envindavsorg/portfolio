import { describe, expect, it } from "vitest";

import {
  breadcrumbHref,
  getBreadcrumbJsonLd,
} from "@/lib/breadcrumb-json-ld";
import type { Content, ContentCategory } from "@/lib/content";
import {
  getPageJsonLd,
  getSiteJsonLd,
  PERSON_ID,
  WEBSITE_ID,
} from "@/lib/json-ld";
import { createContentMetadata } from "@/lib/metadata";

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
    // les certifications n'étaient pas publiées du tout
    expect((person.hasCredential as unknown[]).length).toBe(4);
  });

  // `worksFor` déclarait trois employeurs ACTUELS, dont deux quittés en 2020 et
  // en 2019 d'après les fiches du site lui-même
  it("ne déclare comme employeur que le poste en cours", () => {
    const person = node("fr", "Person");
    const names = (key: string): string[] =>
      (person[key] as { name: string }[]).map((entry) => entry.name);

    expect(names("worksFor")).toEqual(["Cospal"]);
    expect(names("alumniOf")).toEqual([
      "WeFix by Fnac",
      "SpinalCom",
      "Économat des Armées",
    ]);
    expect(person.worksFor).toEqual([
      // pas d'`url` : le poste n'a pas encore de lien, et la clé est omise
      // plutôt que publiée vide
      {
        "@type": "Organization",
        name: "Cospal",
      },
    ]);
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

describe("getPageJsonLd", () => {
  const article = (locale: Content["locale"]): Content => ({
    content: "",
    locale,
    metadata: {
      category: "articles",
      createdAt: new Date("2026-03-03T00:00:00.000Z"),
      description: "d",
      tags: ["css", "retour d'expérience"],
      title: "t",
      updatedAt: new Date("2026-03-04T00:00:00.000Z"),
    } as Content["metadata"],
    reading: { time: "8 min", words: 1077 },
    slug: "how-i-write-css",
  });

  // un tag est une CLÉ, écrite en français : `keywords` d'un article anglais
  // annonçait « retour d'expérience » quand `article:tag` disait déjà
  // « lessons learned »
  it("publie le libellé des tags dans la langue du contenu", () => {
    expect(getPageJsonLd(article("en"), "en").keywords).toBe(
      "css, lessons learned"
    );
    expect(getPageJsonLd(article("fr"), "fr").keywords).toBe(
      "css, retour d'expérience"
    );
  });

  // un repli français servi sous /en reste étiqueté en français, comme le texte
  it("garde les clés pour un repli français servi sous /en", () => {
    expect(getPageJsonLd(article("fr"), "en").keywords).toBe(
      "css, retour d'expérience"
    );
  });

  const inCategory = (category: ContentCategory): Content => {
    const base = article("fr");

    return { ...base, metadata: { ...base.metadata, category } };
  };

  // le nœud n'avait ni identifiant ni lien vers sa page, et ne publiait rien de
  // ce que `content.ts` calcule déjà
  it("s'identifie, se rattache à sa page et dit sa longueur", () => {
    // l'union de schema-dts ne se laisse lire qu'en passant par `unknown`
    const node = getPageJsonLd(
      article("en"),
      "en"
    ) as unknown as Record<string, unknown>;

    expect(node["@id"]).toBe(
      "https://cuzeacflorin.fr/en/articles/how-i-write-css#article"
    );
    expect(node.mainEntityOfPage).toBe(
      "https://cuzeacflorin.fr/en/articles/how-i-write-css"
    );
    expect(node.publisher).toEqual({ "@id": PERSON_ID });
    expect(node.wordCount).toBe(1077);
    // « 8 min », en durée ISO 8601
    expect(node.timeRequired).toBe("PT8M");
  });

  // la documentation d'un composant était typée comme un billet de blog
  it("type un composant en TechArticle, un article en BlogPosting", () => {
    expect(getPageJsonLd(inCategory("components"))["@type"]).toBe(
      "TechArticle"
    );
    expect(getPageJsonLd(inCategory("articles"))["@type"]).toBe(
      "BlogPosting"
    );
    expect(getPageJsonLd(inCategory("utils"))["@type"]).toBe(
      "BlogPosting"
    );
  });

  // Sans image de couverture, le nœud retombe sur la carte sociale. Il la
  // construisait sans la ligne de méta : deux URL de carte sur la même page.
  it("publie la même carte que og:image", () => {
    const component = inCategory("components");
    const openGraph = createContentMetadata(component, "en")
      .openGraph as { images: { url: string }[] };

    expect(getPageJsonLd(component, "en").image).toBe(
      "https://cuzeacflorin.fr/api/og?title=t&type=componentsArticle&description=d&meta=8+min+%C2%B7+2026-03-03&locale=en"
    );
    expect(getPageJsonLd(component, "en").image).toBe(
      openGraph.images[0].url
    );
  });

  it("garde l'image de couverture quand le contenu en a une", () => {
    const base = article("fr");
    const illustrated = {
      ...base,
      metadata: {
        ...base.metadata,
        image: "/images/articles/5.webp",
      },
    };

    expect(getPageJsonLd(illustrated).image).toBe(
      "https://cuzeacflorin.fr/images/articles/5.webp"
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

describe("breadcrumbHref", () => {
  // `localizeHref("/")` rend « /en/ », que le serveur redirige vers « /en »
  it("retire la barre finale, sauf à la racine", () => {
    expect(breadcrumbHref("/en/")).toBe("/en");
    expect(breadcrumbHref("/")).toBe("/");
    expect(breadcrumbHref("/en/tags")).toBe("/en/tags");
  });

  it("publie l'accueil anglais sous son URL canonique", () => {
    const [home, tags] = getBreadcrumbJsonLd([
      { href: "/en/", label: "home" },
      { href: "/en/tags", label: "topics" },
      { label: "react" },
    ]).itemListElement as unknown as Record<string, unknown>[];

    expect(home.item).toBe("https://cuzeacflorin.fr/en");
    expect(tags.item).toBe("https://cuzeacflorin.fr/en/tags");
  });
});
