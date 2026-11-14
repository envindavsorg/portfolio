import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * Aucun rappel d'`IntersectionObserver` ne lit seulement le PREMIER changement
 * du lot qu'il reçoit.
 *
 * Un rappel reçoit un tableau, pas un changement. Tant que le fil principal
 * est libre, ce tableau n'a qu'un élément par cible, et `([entry]) => …` passe
 * pour correct. Fil occupé — hydratation, défilement d'un téléphone — deux
 * images s'écoulent avant que le rappel ne parte : « à l'écran » puis « hors
 * écran » arrivent ensemble, et le premier dit le contraire de l'état réel.
 * Comme le rappel suivant n'arrive qu'au prochain franchissement, l'erreur
 * reste : un minuteur qui bat sans fin hors de l'écran (le titre pixel,
 * l'horloge du pied de page), un compteur à zéro sous les yeux, un titre de
 * section dans sa forme collée au milieu de la page, un sommaire effacé en
 * pleine lecture. Les cinq ont été reproduits sur le build servi avant d'être
 * corrigés.
 *
 * Une cible : le DERNIER changement (`entries.at(-1)`). Plusieurs cibles :
 * tous les changements, dans l'ordre (`for … of`) — le dernier du lot ne
 * parlerait que d'une seule.
 *
 * Les modules sont lus comme du TEXTE, à la manière de `i18n-server.test.ts` :
 * les importer monterait React, Motion et la moitié de l'interface. Le
 * découpage est volontairement étroit — il part de `new IntersectionObserver(`
 * et s'arrête à la fin du premier argument — parce qu'un fichier TSX entier ne
 * se lit pas sans analyseur : une apostrophe dans un texte JSX y ouvre une
 * chaîne qui n'en est pas une. `useInView` de Motion n'apparaît pas ici : son
 * observateur est dans la bibliothèque, et il parcourt tout le lot.
 */
const SRC = "src";

const SOURCES = readdirSync(SRC, {
  recursive: true,
  withFileTypes: true,
})
  .filter(
    (entry) =>
      entry.isFile() &&
      /\.tsx?$/u.test(entry.name) &&
      !/\.test\.tsx?$/u.test(entry.name)
  )
  .map((entry) => relative(SRC, join(entry.parentPath, entry.name)))
  // générés : Paraglide par `pnpm i18n:compile`, l'index par `registry:build`
  .filter(
    (path) =>
      !(
        path.startsWith("paraglide") ||
        path.startsWith("__registry__")
      )
  )
  .map((path) => ({
    path,
    text: readFileSync(join(SRC, path), "utf-8"),
  }));

const OPENERS = "([{";
const CLOSERS = ")]}";

/** Indice qui suit la chaîne ou le gabarit ouvert en `start`. */
const endOfString = (source: string, start: number): number => {
  const quote = source[start];
  let index = start + 1;

  while (index < source.length) {
    const char = source[index];

    if (char === "\\") {
      index += 2;
    } else if (char === quote) {
      return index + 1;
    } else if (
      quote === "`" &&
      char === "$" &&
      source[index + 1] === "{"
    ) {
      index = endOfGroup(source, index + 1);
    } else {
      index += 1;
    }
  }

  return source.length;
};

/**
 * Si `index` ouvre un commentaire ou une chaîne, l'indice qui le suit ;
 * sinon `index` lui-même.
 */
const skipInert = (source: string, index: number): number => {
  const pair = source.slice(index, index + 2);

  if (pair === "//") {
    const end = source.indexOf("\n", index);
    return end === -1 ? source.length : end;
  }

  if (pair === "/*") {
    const end = source.indexOf("*/", index + 2);
    return end === -1 ? source.length : end + 2;
  }

  return "\"'`".includes(source[index] ?? " ")
    ? endOfString(source, index)
    : index;
};

/** Indice qui suit le groupe — `()`, `[]` ou `{}` — ouvert en `start`. */
function endOfGroup(source: string, start: number): number {
  let depth = 0;
  let index = start;

  while (index < source.length) {
    const next = skipInert(source, index);

    if (next !== index) {
      index = next;
      continue;
    }

    const char = source[index] ?? "";

    if (OPENERS.includes(char)) {
      depth += 1;
    } else if (CLOSERS.includes(char)) {
      depth -= 1;

      if (depth === 0) {
        return index + 1;
      }
    }

    index += 1;
  }

  return source.length;
}

/** Le code sans ses commentaires, chaque chaîne réduite à `""`. */
const stripInert = (source: string): string => {
  let out = "";
  let index = 0;

  while (index < source.length) {
    const next = skipInert(source, index);

    if (next === index) {
      out += source[index];
      index += 1;
    } else {
      out += "\"'`".includes(source[index] ?? " ") ? '""' : " ";
      index = next;
    }
  }

  return out;
};

/** Ce qui précède la première virgule de premier niveau. */
const firstItem = (list: string): string => {
  let depth = 0;

  for (const [index, char] of [...list].entries()) {
    if (OPENERS.includes(char)) {
      depth += 1;
    } else if (CLOSERS.includes(char)) {
      depth -= 1;
    } else if (char === "," && depth === 0) {
      return list.slice(0, index);
    }
  }

  return list;
};

interface ObserverCallback {
  /** premier argument du constructeur, commentaires et chaînes retirés */
  callback: string;
  line: number;
  /** chemin du module, relatif à `src` */
  path: string;
}

const CONSTRUCTOR = /new IntersectionObserver\s*\(/gu;

/** Tous les rappels passés à `new IntersectionObserver(` dans un texte. */
const observerCallbacks = (
  path: string,
  text: string
): ObserverCallback[] =>
  [...text.matchAll(CONSTRUCTOR)]
    // une mention dans un commentaire n'est pas un observateur
    .filter(({ index }) => {
      const lineStart = text.lastIndexOf("\n", index) + 1;
      return !/^\s*(?:\/\/|\/\*|\*)/u.test(
        text.slice(lineStart, index)
      );
    })
    .map((match) => {
      const open = match.index + match[0].length - 1;
      const end = endOfGroup(text, open);

      return {
        callback: firstItem(
          stripInert(text.slice(open + 1, end - 1))
        ).trim(),
        line: text.slice(0, match.index).split("\n").length,
        path,
      };
    });

const INLINE_ARROW = /^(?:async\s+)?([A-Za-z_$][\w$]*)\s*=>/u;
const PARENTHESISED = /^(?:async\s+)?(?:function\b[^(]*)?\(/u;
const IDENTIFIER = /^[A-Za-z_$][\w$]*/u;

/** Le premier paramètre d'un rappel écrit sur place, et le reste du rappel. */
const parseCallback = (
  callback: string
): { body: string; parameter: string } | null => {
  const arrow = INLINE_ARROW.exec(callback);

  if (arrow) {
    return {
      body: callback.slice(arrow[0].length),
      parameter: arrow[1] ?? "",
    };
  }

  const head = PARENTHESISED.exec(callback);

  if (!head) {
    return null;
  }

  const open = head[0].length - 1;
  const end = endOfGroup(callback, open);

  return {
    body: callback.slice(end),
    parameter: firstItem(callback.slice(open + 1, end - 1)).trim(),
  };
};

/**
 * Pourquoi ce rappel est refusé — ou `null` s'il ne lit pas que le premier
 * changement.
 */
const firstEntryOnly = (callback: string): string | null => {
  const parsed = parseCallback(callback);

  if (!parsed) {
    // une fonction définie ailleurs : ce garde-fou ne la suit pas, et ne
    // doit pas la laisser passer sans l'avoir lue
    return "rappel défini ailleurs : l'écrire sur place, ou étendre ce test";
  }

  const { body, parameter } = parsed;

  if (parameter === "") {
    return null;
  }

  if (parameter.startsWith("[")) {
    return "déstructure le lot dans ses paramètres";
  }

  const name = IDENTIFIER.exec(parameter)?.[0];

  if (!name) {
    return "premier paramètre illisible";
  }

  const entries = name.replaceAll("$", "\\$");
  const refusals: [RegExp, string][] = [
    [
      new RegExp(`\\b${entries}\\s*\\[\\s*0\\s*\\]`, "u"),
      `${name}[0]`,
    ],
    [
      new RegExp(`\\b${entries}\\s*\\.\\s*at\\(\\s*0\\s*\\)`, "u"),
      `${name}.at(0)`,
    ],
    [
      new RegExp(`\\b${entries}\\s*\\.\\s*shift\\(`, "u"),
      `${name}.shift()`,
    ],
    [
      new RegExp(`\\[[^\\]=]*\\]\\s*=\\s*${entries}\\b`, "u"),
      `[…] = ${name}`,
    ],
  ];

  const hit = refusals.find(([pattern]) => pattern.test(body));

  return hit ? `ne lit que le premier changement : ${hit[1]}` : null;
};

const OBSERVERS = SOURCES.flatMap(({ path, text }) =>
  observerCallbacks(path, text)
);

/** Un module factice, pour éprouver la lecture elle-même. */
const verdict = (source: string): string | null => {
  const [observer] = observerCallbacks("témoin.tsx", source);
  return observer
    ? firstEntryOnly(observer.callback)
    : "aucun observateur";
};

describe("rappels d'IntersectionObserver", () => {
  it("aucun ne lit seulement le premier changement du lot", () => {
    const refused = OBSERVERS.flatMap(({ callback, line, path }) => {
      const reason = firstEntryOnly(callback);
      return reason ? [`${path}:${line} — ${reason}`] : [];
    });

    expect(refused).toEqual([]);
  });

  // TÉMOINS : une lecture qui ne refuserait jamais rien rendrait le test
  // ci-dessus vert pour de mauvaises raisons.
  it.each([
    [
      "la déstructuration en paramètre",
      "new IntersectionObserver(([entry]) => { run(entry.isIntersecting); });",
    ],
    [
      "la déstructuration typée, avec options",
      `new IntersectionObserver(
  ([entry]: IntersectionObserverEntry[]) => {
    run(entry);
  },
  { threshold: 0.5 }
);`,
    ],
    [
      "l'indice zéro",
      "new IntersectionObserver((entries) => { run(entries[0]); });",
    ],
    [
      "at(0)",
      "new IntersectionObserver((entries) => { run(entries.at(0)); });",
    ],
    [
      "la déstructuration dans le corps",
      `new IntersectionObserver((batch) => {
  // it's a trap (
  const [entry] = batch;
  run(entry);
});`,
    ],
    [
      "shift()",
      "new IntersectionObserver(entries => run(entries.shift()));",
    ],
    [
      "une fonction classique",
      "new IntersectionObserver(function (entries) { run(entries[0]); });",
    ],
    [
      "un rappel défini ailleurs",
      "new IntersectionObserver(handleEntries, { threshold: 1 });",
    ],
  ])("refuse %s", (_label, source) => {
    expect(verdict(source)).not.toBeNull();
  });

  it.each([
    [
      "le dernier changement",
      "new IntersectionObserver((entries) => { run(entries.at(-1)?.isIntersecting ?? false); });",
    ],
    [
      "tous les changements",
      `new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      run(entry, \`\${entry.target.id} (\`);
    }
  },
  { rootMargin: \`-\${offset}px 0px 0px 0px\` }
);`,
    ],
    [
      "un rappel qui ne lit pas le lot",
      "new IntersectionObserver(() => { run(); });",
    ],
    [
      "un indice zéro ailleurs que sur le lot",
      "new IntersectionObserver((entries) => { run(entries.at(-1), list[0]); });",
    ],
  ])("accepte %s", (_label, source) => {
    expect(verdict(source)).toBeNull();
  });

  it("une mention en commentaire n'est pas un observateur", () => {
    expect(
      observerCallbacks(
        "témoin.tsx",
        `// new IntersectionObserver(([entry]) => {})
/**
 * new IntersectionObserver(([entry]) => {})
 */`
      )
    ).toEqual([]);
  });

  it("la recherche trouve bien les observateurs du dépôt", () => {
    const found = OBSERVERS.map(({ path }) => path);

    // les deux de l'en-tête de section : son accroche et son entrée
    expect(
      found.filter((path) => path === "components/base/Panel.tsx")
    ).toHaveLength(2);
    expect(found).toEqual(
      expect.arrayContaining([
        "components/base/Counter.tsx",
        "components/blocks/FlickeringGrid.tsx",
        "components/blocks/PixelHeading.tsx",
        "components/features/WritingsToC.tsx",
        "components/layout/footer/FooterClock.tsx",
        "hooks/useActiveItem.ts",
        "hooks/useGreetingsCarousel.ts",
      ])
    );
  });
});
