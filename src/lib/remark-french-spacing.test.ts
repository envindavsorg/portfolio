import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";
import { describe, expect, it } from "vitest";

import {
  frenchSpacing,
  remarkFrenchSpacing,
} from "@/lib/remark-french-spacing";

// Les valeurs attendues sont écrites avec les échappements, à la main : les
// construire avec les constantes du module reviendrait à le tester contre
// lui-même.

describe("frenchSpacing", () => {
  it("pose une espace fine insécable devant ? ! et ;", () => {
    expect(frenchSpacing("un bon chargement de styles ?")).toBe(
      "un bon chargement de styles\u202F?"
    );
    expect(frenchSpacing("jamais ! et encore")).toBe(
      "jamais\u202F! et encore"
    );
    expect(frenchSpacing("d'abord ; ensuite")).toBe(
      "d'abord\u202F; ensuite"
    );
  });

  it("pose une espace insécable devant :", () => {
    expect(frenchSpacing("la règle : une seule source")).toBe(
      "la règle\u00A0: une seule source"
    );
    expect(frenchSpacing("le rapport est de 4,51 : 1")).toBe(
      "le rapport est de 4,51\u00A0: 1"
    );
  });

  it("pose une espace insécable à l'intérieur des guillemets", () => {
    expect(frenchSpacing("le mot « subgrid » suffit")).toBe(
      "le mot «\u00A0subgrid\u00A0» suffit"
    );
  });

  it("combine guillemets et ponctuation haute", () => {
    expect(frenchSpacing("« et alors ? » : rien")).toBe(
      "«\u00A0et alors\u202F?\u00A0»\u00A0: rien"
    );
  });

  it("suit le premier signe d'une suite", () => {
    expect(frenchSpacing("vraiment ?!")).toBe("vraiment\u202F?!");
    expect(frenchSpacing("quoi ?)")).toBe("quoi\u202F?)");
  });

  it("traite une espace en tête de nœud, après un élément en ligne", () => {
    // « **gras** ? » : le texte qui suit l'élément commence par l'espace
    expect(frenchSpacing(" ? la suite")).toBe("\u202F? la suite");
    expect(frenchSpacing(" »")).toBe("\u00A0»");
  });

  it("laisse ce qui ressemble à du code écrit dans une phrase", () => {
    for (const text of [
      "la pseudo-classe :hover",
      "le pseudo-élément ::before",
      "un !important de trop",
      "ajouter ?param=1 à l'URL",
      "l'émoji :smile: passe",
    ]) {
      expect(frenchSpacing(text)).toBe(text);
    }
  });

  it("laisse la ponctuation déjà collée, et l'anglais", () => {
    for (const text of [
      "Why does this work? Because: it does!",
      "https://example.com/?a=b;c",
      "à 12:30",
    ]) {
      expect(frenchSpacing(text)).toBe(text);
    }
  });

  it("ne touche pas une insécable déjà écrite", () => {
    expect(frenchSpacing("déjà\u00A0? oui")).toBe("déjà\u00A0? oui");
  });
});

const render = (source: string): string =>
  remark()
    .use(remarkGfm)
    .use(remarkMdx)
    .use(remarkFrenchSpacing)
    .processSync(source)
    .toString();

describe("remarkFrenchSpacing", () => {
  it("corrige un paragraphe, y compris autour d'un élément en ligne", () => {
    expect(render("Est-ce **vraiment** utile ?\n")).toBe(
      "Est-ce **vraiment** utile\u202F?\n"
    );
    expect(render("Le mot **subgrid** ?\n")).toBe(
      "Le mot **subgrid**\u202F?\n"
    );
  });

  it("corrige le texte d'un lien, pas son URL", () => {
    expect(
      render("Voir [la suite ?](https://example.com/a ?b) ici.\n")
    ).toContain("la suite\u202F?");
    expect(
      render("Voir [la doc](<https://example.com/a ?b>) ici.\n")
    ).toBe("Voir [la doc](<https://example.com/a ?b>) ici.\n");
  });

  it("laisse le code en ligne et les blocs de code", () => {
    const source = [
      "Le test `a ? b : c` reste tel quel.",
      "",
      "```ts",
      "const x = a ? b : c;",
      'console.log("« oui » ?");',
      "```",
      "",
    ].join("\n");

    expect(render(source)).toBe(source);
  });

  it("laisse les attributs et les expressions MDX", () => {
    const source = [
      '<Callout title="Attention : fragile">',
      "  {ok ? oui : non}",
      "</Callout>",
      "",
    ].join("\n");

    expect(render(source)).toBe(source);
  });

  it("corrige le texte enfant d'un composant MDX", () => {
    expect(
      render("<Callout>\n  Attention : fragile\n</Callout>\n")
    ).toBe("<Callout>\n  Attention\u00A0: fragile\n</Callout>\n");
  });

  it("laisse les titres : leur ancre est calculée sur leur texte", () => {
    const source = "## Secondes ou millisecondes ?\n";

    expect(render(source)).toBe(source);
  });

  it("corrige les listes, les citations et les cellules de tableau", () => {
    expect(render("- un point : important\n")).toContain(
      "un point\u00A0: important"
    );
    expect(render("> vraiment ?\n")).toBe("> vraiment\u202F?\n");
    expect(
      render("| a ? | b |\n| --- | - |\n| c ; | d |\n")
    ).toContain("a\u202F?");
  });
});
