import { describe, expect, it } from "vitest";

import type { PlaygroundControl } from "@/lib/playground";
import {
  defaultValues,
  toJsx,
  toPlaygroundName,
  toProps,
} from "@/lib/playground";

const CONTROLS: PlaygroundControl[] = [
  {
    defaultValue: ["une phrase", "une autre"],
    kind: "lines",
    prop: "sentences",
  },
  { defaultValue: 3000, kind: "number", prop: "interval" },
  { defaultValue: false, kind: "boolean", prop: "disableAnimation" },
  { defaultValue: "", kind: "text", prop: "className" },
];

describe("defaultValues", () => {
  it("part des valeurs par défaut des contrôles", () => {
    expect(defaultValues(CONTROLS)).toEqual({
      className: "",
      disableAnimation: false,
      interval: 3000,
      sentences: ["une phrase", "une autre"],
    });
  });
});

describe("toProps", () => {
  it("retombe sur le défaut pour une valeur absente", () => {
    expect(toProps(CONTROLS, { interval: 500 })).toEqual({
      className: "",
      disableAnimation: false,
      interval: 500,
      sentences: ["une phrase", "une autre"],
    });
  });
});

describe("toJsx", () => {
  it("n'écrit rien quand tout est au défaut", () => {
    // recopier des valeurs par défaut donne un extrait que personne n'écrirait
    expect(
      toJsx("FlipSentences", CONTROLS, defaultValues(CONTROLS))
    ).toBe("<FlipSentences />");
  });

  it("écrit un booléen vrai en forme courte", () => {
    const jsx = toJsx("FlipSentences", CONTROLS, {
      ...defaultValues(CONTROLS),
      disableAnimation: true,
    });

    expect(jsx).toBe("<FlipSentences disableAnimation />");
  });

  it("entoure un nombre d'accolades", () => {
    const jsx = toJsx("FlipSentences", CONTROLS, {
      ...defaultValues(CONTROLS),
      interval: 800,
    });

    expect(jsx).toBe("<FlipSentences interval={800} />");
  });

  it("met une chaîne entre guillemets", () => {
    const jsx = toJsx("AppleHelloEffect", CONTROLS, {
      ...defaultValues(CONTROLS),
      className: "h-24",
    });

    expect(jsx).toBe('<AppleHelloEffect className="h-24" />');
  });

  it("échappe les guillemets d'une chaîne", () => {
    const jsx = toJsx("Demo", CONTROLS, {
      ...defaultValues(CONTROLS),
      className: 'a"b',
    });

    expect(jsx).toContain('className="a\\"b"');
  });

  it("rend un tableau en littéral JSX", () => {
    const jsx = toJsx("FlipSentences", CONTROLS, {
      ...defaultValues(CONTROLS),
      sentences: ["a", "b", "c"],
    });

    expect(jsx).toBe('<FlipSentences sentences={["a", "b", "c"]} />');
  });

  it("compare les tableaux par contenu, pas par référence", () => {
    // un tableau reconstruit à chaque frappe a une autre référence : sans
    // comparaison par contenu, la prop réapparaîtrait alors qu'elle est au défaut
    const jsx = toJsx("FlipSentences", CONTROLS, {
      ...defaultValues(CONTROLS),
      sentences: ["une phrase", "une autre"],
    });

    expect(jsx).toBe("<FlipSentences />");
  });

  it("passe sur plusieurs lignes au-delà d'une prop", () => {
    const jsx = toJsx("FlipSentences", CONTROLS, {
      ...defaultValues(CONTROLS),
      disableAnimation: true,
      interval: 500,
    });

    expect(jsx).toBe(
      [
        "<FlipSentences",
        "  interval={500}",
        "  disableAnimation",
        "/>",
      ].join("\n")
    );
  });

  it("passe sur plusieurs lignes quand une seule prop est trop longue", () => {
    const jsx = toJsx("FlipSentences", CONTROLS, {
      ...defaultValues(CONTROLS),
      sentences: [
        "une phrase vraiment longue",
        "une deuxième tout aussi longue",
      ],
    });

    expect(jsx.split("\n")).toHaveLength(3);
    expect(jsx.startsWith("<FlipSentences\n")).toBe(true);
  });

  it("ignore une prop absente des contrôles", () => {
    const jsx = toJsx("Demo", CONTROLS, {
      ...defaultValues(CONTROLS),
      inconnue: "valeur",
    });

    expect(jsx).toBe("<Demo />");
  });
});

describe("toPlaygroundName", () => {
  it("retire le suffixe de démo", () => {
    expect(toPlaygroundName("flip-sentences-demo")).toBe(
      "flip-sentences"
    );
    expect(toPlaygroundName("apple-hello-effect-demo")).toBe(
      "apple-hello-effect"
    );
  });

  it("laisse intact un nom sans suffixe", () => {
    expect(toPlaygroundName("flip-sentences")).toBe("flip-sentences");
  });

  it("ne retire le suffixe qu'à la fin", () => {
    expect(toPlaygroundName("demo-something")).toBe("demo-something");
  });
});
