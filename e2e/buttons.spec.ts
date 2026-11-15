import { expect, test } from "@playwright/test";

/**
 * Les états d'un bouton que son dessin ne doit pas effacer.
 *
 * Le bouton est une pièce de plan : pointillés, équerres, reflet au survol.
 * Une relecture de ce dessin a trouvé deux états qu'il avait affaiblis, et
 * qu'aucun test ne regardait.
 */
test.describe("états des boutons", () => {
  /**
   * Enfoncée, une bascule n'avait plus qu'un cadre en pointillés d'un pixel
   * dans la couleur du thème, à côté de voisines portant quatre équerres à
   * pleine force : c'était la boîte la plus faible de sa rangée. Et la lettre
   * des drapeaux du testeur de regex ne suivait pas la couleur du bouton.
   */
  test("une bascule enfoncée se lit à son cadre et à son libellé", async ({
    page,
  }) => {
    await page.goto("/utils/regex-tester");

    const read = (pressed: boolean) =>
      page
        .locator(`main button[aria-pressed='${pressed}']`)
        .first()
        .evaluate((button) => {
          const style = getComputedStyle(button);
          const label = button.querySelector("span");

          return {
            border: style.borderTopStyle,
            color: style.color,
            label: label ? getComputedStyle(label).color : "",
            ring: style.boxShadow,
          };
        });

    const on = await read(true);
    const off = await read(false);

    // TÉMOIN : la bascule au repos garde le dessin ordinaire
    expect(off.border).toBe("dashed");
    expect(off.ring).toBe("none");

    expect(on.border).toBe("solid");
    expect(on.ring).not.toBe("none");
    expect(on.label).toBe(on.color);
    expect(on.color).not.toBe(off.color);
  });

  /**
   * Un bouton désactivé gardait son curseur, son fond de survol, et jouait le
   * reflet : trois signes de vie sur un contrôle qui ne peut rien faire.
   */
  test("un bouton désactivé ne répond plus au pointeur", async ({
    page,
  }) => {
    await page.goto("/utils/lorem-ipsum-generator");

    const decrease = page.getByRole("button", {
      name: "Decrease value",
    });

    // TÉMOIN : actif, il répond
    await expect(decrease).toBeEnabled();
    await expect(decrease).toHaveCSS("pointer-events", "auto");

    for (let step = 0; step < 60; step += 1) {
      if (await decrease.isDisabled()) {
        break;
      }
      await decrease.click();
    }

    await expect(decrease).toBeDisabled();
    await expect(decrease).toHaveCSS("pointer-events", "none");
    await expect(decrease).toHaveCSS("opacity", "0.5");
  });
});
