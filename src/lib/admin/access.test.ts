import { describe, expect, it } from "vitest";

import { describeIdentity, isAdmin } from "@/lib/admin/access";

/**
 * La porte de l'espace d'administration.
 *
 * Ces tests portent sur la seule décision du dépôt dont une erreur donne à
 * quelqu'un d'autre le droit d'écrire dans le dépôt GitHub. Ils sont donc écrits
 * à l'envers de l'habitude : ce qui compte n'est pas que le propriétaire entre,
 * c'est que TOUT LE RESTE soit refusé — configuration absente comprise.
 */

const OWNER = "42424242";

describe("isAdmin", () => {
  it("laisse entrer le propriétaire", () => {
    expect(isAdmin({ githubId: OWNER }, OWNER)).toBe(true);
  });

  it("accepte un identifiant numérique comme un identifiant texte", () => {
    // le fournisseur peut rendre l'un ou l'autre selon le chemin de code
    expect(isAdmin({ githubId: 42_424_242 }, OWNER)).toBe(true);
    expect(
      isAdmin({ githubId: "42424242" }, 42_424_242 as never)
    ).toBe(true);
  });

  /**
   * LE test de ce fichier.
   *
   * Une variable d'environnement oubliée en production doit fermer la porte, pas
   * l'ouvrir. C'est le mode de défaillance le plus courant d'un contrôle
   * d'accès, et le plus coûteux.
   */
  it("refuse tout le monde quand aucun propriétaire n'est configuré", () => {
    for (const missing of [
      undefined,
      null,
      "",
      "   ",
      "undefined",
      "null",
    ]) {
      expect(
        isAdmin({ githubId: OWNER }, missing),
        `configuration « ${String(missing)} » ne doit ouvrir à personne`
      ).toBe(false);
    }
  });

  it("refuse une identité absente ou vide", () => {
    for (const identity of [
      null,
      undefined,
      {},
      { githubId: null },
      { githubId: "" },
      { githubId: "   " },
    ]) {
      expect(isAdmin(identity, OWNER)).toBe(false);
    }
  });

  it("refuse un autre compte GitHub", () => {
    expect(isAdmin({ githubId: "42424243" }, OWNER)).toBe(false);
    expect(isAdmin({ githubId: "4242424" }, OWNER)).toBe(false);
    expect(isAdmin({ githubId: "424242420" }, OWNER)).toBe(false);
  });

  /**
   * Le pseudo ne donne AUCUN droit.
   *
   * C'est la raison d'être du choix de l'identifiant numérique : un pseudo
   * abandonné est réenregistrable par n'importe qui, donc un contrôle par pseudo
   * transformerait un renommage en prise de contrôle de l'espace admin.
   */
  it("ne laisse pas un pseudo se substituer à l'identifiant", () => {
    expect(
      isAdmin(
        { githubId: "99999999", githubLogin: "envindavsorg" },
        OWNER
      )
    ).toBe(false);
    expect(isAdmin({ githubLogin: "envindavsorg" }, OWNER)).toBe(
      false
    );
  });

  /** un identifiant non numérique n'est pas interprété, il est refusé */
  it("refuse ce qui n'est pas un entier positif", () => {
    for (const bogus of [
      "42424242 ", // toléré : les espaces sont rognés
      "0x2872b8a",
      "42424242e0",
      "-42424242",
      "42.424242",
      "42424242abc",
    ]) {
      const expected = bogus.trim() === OWNER;
      expect(isAdmin({ githubId: bogus }, OWNER), bogus).toBe(
        expected
      );
    }
  });

  it("refuse une injection par comparaison laxiste", () => {
    // `["42424242"] == "42424242"` vaut true en JavaScript ; la normalisation
    // par `String()` doit rendre un identifiant, pas un tableau coercé
    expect(isAdmin({ githubId: [OWNER] as never }, OWNER)).toBe(
      false
    );
    expect(isAdmin({ githubId: true as never }, OWNER)).toBe(false);
  });
});

describe("describeIdentity", () => {
  it("compose pseudo et identifiant quand les deux sont là", () => {
    expect(
      describeIdentity({ githubId: OWNER, githubLogin: "florin" })
    ).toBe(`florin (#${OWNER})`);
  });

  it("n'invente rien quand il manque une moitié", () => {
    expect(describeIdentity({ githubId: OWNER })).toBe(`#${OWNER}`);
    expect(describeIdentity({ githubLogin: "florin" })).toBe(
      "florin"
    );
    expect(describeIdentity(null)).toBe("identité inconnue");
    expect(describeIdentity({})).toBe("identité inconnue");
  });
});
