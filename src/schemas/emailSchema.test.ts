import { readFileSync } from "node:fs";
import { join } from "node:path";

import { zodResolver } from "@hookform/resolvers/zod";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { config } from "zod/mini";

import { overwriteGetLocale } from "@/paraglide/runtime";

import { emailSchema, sendCvInputSchema } from "./emailSchema";

/**
 * Les libellés attendus sont lus dans `messages/*.json`, la source des
 * traductions, et non recopiés ici ni demandés au schéma : un texte corrigé
 * depuis l'éditeur de /admin ne doit pas casser ce test, et passer par le
 * fichier plutôt que par Paraglide fait aussi échouer une locale intervertie.
 * Ce qui est écrit à la main, c'est le couple (saisie → clé du message).
 */
type MessageKey =
  | "form_email_invalid"
  | "form_first_name_required"
  | "form_first_name_too_long"
  | "form_first_name_too_short";

type Locale = "en" | "fr";

const read = (locale: Locale): Record<MessageKey, string> =>
  JSON.parse(
    readFileSync(
      join(process.cwd(), `messages/${locale}.json`),
      "utf8"
    )
  );

const MESSAGES = { en: read("en"), fr: read("fr") };

const VALID = {
  firstName: "Florin",
  recipientEmail: "florin@example.com",
};

// 20 et 21 caractères, comptés : les deux côtés de la borne haute
const TWENTY = "abcdefghijklmnopqrst";
const TWENTY_ONE = "abcdefghijklmnopqrstu";

/** premier signalement d'un champ — celui que le formulaire affiche */
const firstMessage = (
  input: unknown,
  field: "firstName" | "recipientEmail"
): string | undefined => {
  const result = emailSchema.safeParse(input);
  if (result.success) {
    return;
  }
  return result.error.issues.find((issue) => issue.path[0] === field)
    ?.message;
};

beforeEach(() => {
  overwriteGetLocale(() => "fr");
});

describe("emailSchema", () => {
  it("accepte une saisie correcte et la rend telle quelle", () => {
    expect(emailSchema.parse(VALID)).toStrictEqual(VALID);
  });

  it("garde les bornes du prénom : 2 et 20 passent, 1 et 21 non", () => {
    expect(TWENTY).toHaveLength(20);
    expect(TWENTY_ONE).toHaveLength(21);

    const accepts = (firstName: string) =>
      emailSchema.safeParse({ ...VALID, firstName }).success;

    expect(accepts("Al")).toBe(true);
    expect(accepts(TWENTY)).toBe(true);
    expect(accepts("A")).toBe(false);
    expect(accepts(TWENTY_ONE)).toBe(false);
  });

  it("dit « requis » pour un prénom vide, pas « trop court »", () => {
    // les deux contrôles échouent sur "" : c'est l'ORDRE qui choisit le message
    expect(
      firstMessage({ ...VALID, firstName: "" }, "firstName")
    ).toBe(MESSAGES.fr.form_first_name_required);
  });

  it("dit « trop court » à un caractère et « trop long » à 21", () => {
    expect(
      firstMessage({ ...VALID, firstName: "A" }, "firstName")
    ).toBe(MESSAGES.fr.form_first_name_too_short);
    expect(
      firstMessage({ ...VALID, firstName: TWENTY_ONE }, "firstName")
    ).toBe(MESSAGES.fr.form_first_name_too_long);
  });

  it("refuse un prénom absent ou qui n'est pas une chaîne", () => {
    expect(
      emailSchema.safeParse({
        recipientEmail: VALID.recipientEmail,
      }).success
    ).toBe(false);
    expect(
      emailSchema.safeParse({ ...VALID, firstName: 42 }).success
    ).toBe(false);
  });

  it("accepte les adresses usuelles", () => {
    for (const recipientEmail of [
      "florin@example.com",
      "prenom.nom+cv@sous.domaine.fr",
      "a_b-c@exemple.io",
    ]) {
      expect(
        emailSchema.safeParse({ ...VALID, recipientEmail }).success,
        recipientEmail
      ).toBe(true);
    }
  });

  it("refuse ce qui n'est pas une adresse, avec son message", () => {
    for (const recipientEmail of [
      "",
      "florin",
      "florin@",
      "@example.com",
      "florin@example",
      "florin @example.com",
      "florin@exam ple.com",
    ]) {
      expect(
        firstMessage({ ...VALID, recipientEmail }, "recipientEmail"),
        recipientEmail
      ).toBe(MESSAGES.fr.form_email_invalid);
    }
  });

  /**
   * Le défaut que les fonctions `error` existent pour empêcher : un message figé
   * à la construction du schéma. Le MÊME objet doit répondre dans la langue du
   * moment de la validation, dans un sens puis dans l'autre.
   */
  it("évalue ses messages à la validation, dans la locale du moment", () => {
    const invalid = { firstName: "", recipientEmail: "florin" };

    // sans quoi les quatre comparaisons ci-dessous ne prouveraient rien
    expect(MESSAGES.en.form_first_name_required).not.toBe(
      MESSAGES.fr.form_first_name_required
    );
    expect(MESSAGES.en.form_email_invalid).not.toBe(
      MESSAGES.fr.form_email_invalid
    );

    overwriteGetLocale(() => "en");
    expect(firstMessage(invalid, "firstName")).toBe(
      MESSAGES.en.form_first_name_required
    );
    expect(firstMessage(invalid, "recipientEmail")).toBe(
      MESSAGES.en.form_email_invalid
    );

    overwriteGetLocale(() => "fr");
    expect(firstMessage(invalid, "firstName")).toBe(
      MESSAGES.fr.form_first_name_required
    );
    expect(firstMessage(invalid, "recipientEmail")).toBe(
      MESSAGES.fr.form_email_invalid
    );
  });

  /**
   * Le chemin réel du formulaire : `useEmailForm` ne lit pas `issues`, il passe
   * par ce résolveur. Celui-ci reconnaît un schéma Zod à sa forme, sans importer
   * Zod — ce test vérifie qu'un schéma `zod/mini` lui convient toujours.
   */
  it("donne au formulaire un message par champ, le premier", async () => {
    const resolve = zodResolver(emailSchema);
    const options = {
      fields: {},
      shouldUseNativeValidation: false,
    };

    const rejected = await resolve(
      { firstName: "", recipientEmail: "florin" },
      undefined,
      options
    );
    expect(rejected.values).toStrictEqual({});
    expect(rejected.errors.firstName?.message).toBe(
      MESSAGES.fr.form_first_name_required
    );
    expect(rejected.errors.recipientEmail?.message).toBe(
      MESSAGES.fr.form_email_invalid
    );

    const accepted = await resolve(VALID, undefined, options);
    expect(accepted.errors).toStrictEqual({});
    expect(accepted.values).toStrictEqual(VALID);
  });
});

describe("sendCvInputSchema", () => {
  it("retombe sur le français quand la locale est absente", () => {
    expect(sendCvInputSchema.parse(VALID)).toStrictEqual({
      ...VALID,
      locale: "fr",
    });
  });

  it("garde l'anglais quand il est demandé", () => {
    expect(
      sendCvInputSchema.parse({ ...VALID, locale: "en" })
    ).toStrictEqual({ ...VALID, locale: "en" });
  });

  it("refuse une locale que le site ne sert pas", () => {
    const result = sendCvInputSchema.safeParse({
      ...VALID,
      locale: "de",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.path)).toEqual([
      ["locale"],
    ]);
  });

  // l'action est un point d'entrée HTTP public : ce qu'on n'a pas déclaré ne
  // doit pas atteindre son corps
  it("écarte les clés inconnues", () => {
    expect(
      sendCvInputSchema.parse({ ...VALID, admin: true })
    ).toStrictEqual({ ...VALID, locale: "fr" });
  });

  it("valide les deux champs comme le formulaire", () => {
    const result = sendCvInputSchema.safeParse({
      firstName: "A",
      recipientEmail: "florin@",
    });

    expect(result.success).toBe(false);
    expect(
      result.error?.issues.map((issue) => issue.message)
    ).toEqual([
      MESSAGES.fr.form_first_name_too_short,
      MESSAGES.fr.form_email_invalid,
    ]);
  });
});

/**
 * La CSP du site n'autorise pas `'unsafe-eval'`, et un `new Function` tenté dans
 * un try/catch est signalé par le navigateur même quand le catch l'avale.
 * `e2e/csp.spec.ts` le constate dans un vrai navigateur ; ici on le constate en
 * une seconde, en remplaçant le constructeur global par un piège qui compte.
 */
describe("schéma client et CSP", () => {
  const trapFunctionConstructor = () => {
    const original = globalThis.Function;
    let attempts = 0;
    const refuse = (): never => {
      attempts += 1;
      throw new EvalError("refusé, comme sous la CSP du site");
    };

    globalThis.Function = new Proxy(original, {
      apply: refuse,
      construct: refuse,
    });

    return {
      attempts: () => attempts,
      restore: () => {
        globalThis.Function = original;
      },
    };
  };

  // le témoin : sans lui, un piège qui ne voit rien rendrait le test suivant
  // vert pour de mauvaises raisons
  it("le piège voit la sonde telle que Zod l'écrit", () => {
    const trap = trapFunctionConstructor();
    try {
      const F = Function;
      expect(() => new F("")).toThrow(EvalError);
    } finally {
      trap.restore();
    }

    expect(trap.attempts()).toBe(1);
  });

  it("pose `jitless` dès que le module du schéma est chargé", () => {
    expect(config().jitless).toBe(true);
  });

  it("ne tente aucun `new Function`, de la construction à la validation", async () => {
    // un module neuf : c'est la CONSTRUCTION du schéma qui doit passer sous le
    // piège, et l'import en tête de fichier l'a déjà faite
    vi.resetModules();

    const trap = trapFunctionConstructor();
    try {
      const fresh = await import("./emailSchema");

      expect(fresh.emailSchema).not.toBe(emailSchema);
      expect(fresh.sendCvInputSchema.safeParse(VALID).success).toBe(
        true
      );
      expect(
        fresh.sendCvInputSchema.safeParse({ firstName: "" }).success
      ).toBe(false);
      await expect(
        fresh.emailSchema.parseAsync(VALID)
      ).resolves.toStrictEqual(VALID);
    } finally {
      trap.restore();
    }

    expect(trap.attempts()).toBe(0);
  });
});
