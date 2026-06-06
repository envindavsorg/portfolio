import { describe, expect, it } from "vitest";

import { createMetadata, openGraphImage } from "@/lib/metadata";

describe("createMetadata", () => {
  it("construit le canonical FR sans préfixe", () => {
    const meta = createMetadata({
      description: "desc",
      path: "/articles",
      title: "titre",
    });

    expect(meta.alternates?.canonical).toBe(
      "https://cuzeacflorin.fr/articles"
    );
  });

  it("construit le canonical EN avec préfixe /en", () => {
    const meta = createMetadata({
      description: "desc",
      locale: "en",
      path: "/articles",
      title: "title",
    });

    expect(meta.alternates?.canonical).toBe(
      "https://cuzeacflorin.fr/en/articles"
    );
  });

  it("gère la racine pour les deux locales", () => {
    const fr = createMetadata({
      description: "d",
      path: "/",
      title: "t",
    });
    const en = createMetadata({
      description: "d",
      locale: "en",
      path: "/",
      title: "t",
    });

    expect(fr.alternates?.canonical).toBe("https://cuzeacflorin.fr");
    expect(en.alternates?.canonical).toBe(
      "https://cuzeacflorin.fr/en"
    );
  });

  it("expose les alternates hreflang fr/en/x-default", () => {
    const meta = createMetadata({
      description: "d",
      path: "/utils",
      title: "t",
    });

    expect(meta.alternates?.languages).toEqual({
      en: "https://cuzeacflorin.fr/en/utils",
      fr: "https://cuzeacflorin.fr/utils",
      "x-default": "https://cuzeacflorin.fr/utils",
    });
  });

  it("n'émet pas de canonical sans path", () => {
    const meta = createMetadata({ description: "d", title: "t" });
    expect(meta.alternates).toBeUndefined();
  });
});

describe("openGraphImage", () => {
  it("construit l'URL /api/og avec les paramètres", () => {
    const url = openGraphImage({
      description: "ma description",
      title: "mon titre",
      type: "blog",
    });

    expect(url).toContain("https://cuzeacflorin.fr/api/og?");
    expect(url).toContain("title=mon+titre");
    expect(url).toContain("type=blog");
  });
});
