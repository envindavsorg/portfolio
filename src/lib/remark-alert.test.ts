import { describe, expect, it } from "vitest";

import type { AlertKind } from "@/lib/remark-alert";
import { readAlertKind, remarkAlert } from "@/lib/remark-alert";

const quote = (...lines: string[]) => ({
  children: [
    {
      children: lines.map((value) => ({ type: "text", value })),
      type: "paragraph",
    },
  ],
  type: "blockquote",
});

const run = (tree: unknown) => {
  remarkAlert()(tree);
  return tree as {
    children: {
      data?: { hName?: string; hProperties?: { kind?: AlertKind } };
      children?: unknown[];
    }[];
  };
};

describe("readAlertKind", () => {
  it("reconnaît les cinq genres de GitHub", () => {
    for (const kind of [
      "NOTE",
      "TIP",
      "IMPORTANT",
      "WARNING",
      "CAUTION",
    ]) {
      expect(readAlertKind(quote(`[!${kind}]`))).toBe(
        kind.toLowerCase()
      );
    }
  });

  it("accepte la casse basse, comme GitHub", () => {
    expect(readAlertKind(quote("[!note]"))).toBe("note");
  });

  it("ignore un blockquote ordinaire", () => {
    expect(readAlertKind(quote("Une citation."))).toBeNull();
    // un marqueur au MILIEU du texte n'en fait pas une alerte
    expect(readAlertKind(quote("voir [!NOTE] plus bas"))).toBeNull();
    expect(readAlertKind(quote("[!INCONNU]"))).toBeNull();
  });
});

describe("remarkAlert", () => {
  it("repose le blockquote en Callout", () => {
    const tree = {
      children: [quote("[!WARNING]", " attention")],
      type: "root",
    };

    const [node] = run(tree).children;

    expect(node.data?.hName).toBe("Callout");
    expect(node.data?.hProperties?.kind).toBe("warning");
  });

  it("retire le paragraphe qui ne contenait que le marqueur", () => {
    // sinon l'encart s'ouvre sur une ligne vide
    const tree = {
      children: [
        {
          children: [
            {
              children: [{ type: "text", value: "[!NOTE]" }],
              type: "paragraph",
            },
            {
              children: [{ type: "text", value: "le corps" }],
              type: "paragraph",
            },
          ],
          type: "blockquote",
        },
      ],
      type: "root",
    };

    const [node] = run(tree).children;

    expect(node.children).toHaveLength(1);
  });

  it("laisse un blockquote ordinaire intact", () => {
    const tree = {
      children: [quote("Une citation.")],
      type: "root",
    };

    const [node] = run(tree).children;

    expect(node.data?.hName).toBeUndefined();
  });
});
