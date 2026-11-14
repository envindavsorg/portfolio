import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

/**
 * Ce qui bouge — ou travaille — sans que le visiteur n'ait rien demandé, au
 * chargement. Quatre causes mesurées, une garde chacune :
 *
 * - les deux sections GitHub de l'accueil sortaient du flux HTML et revenaient
 *   300 ms après la première image, en poussant tout ce qui suit ;
 * - le titre pixel changeait de hauteur à l'arrivée de quatre polices ;
 * - le thème était réappliqué au montage, ce qui invalidait le style de tout
 *   le document en pleine hydratation ;
 * - le titre pixel pouvait rester à battre une fois hors de l'écran.
 */

const PHONE = { height: 844, width: 390 };

/** 0,29 à 0,78 quand le saut avait lieu, 0,001 à 0,003 depuis */
const MAX_SHIFT = 0.05;

const THEME_TOGGLE = /changer de thème|toggle theme/u;

/** posé par l'effet de `PixelHeading` : la page est hydratée */
const HYDRATED = "[data-slot='pixel-heading'] [data-state='active']";

interface Probe {
  __classLog?: string[];
  __shift?: number;
  __styleLog?: string[];
}

test.describe("sections GitHub dans le flux", () => {
  for (const path of ["/", "/en"]) {
    test(`le HTML de ${path} ne diffère aucune frontière`, async ({
      request,
    }) => {
      const html = await (await request.get(path)).text();

      const repos = html.indexOf('id="my-repos"');
      const stack = html.indexOf('id="my-stack"');

      // TÉMOIN : les deux sections sont bien servies, sinon rien n'est prouvé
      expect(repos).toBeGreaterThan(-1);
      expect(stack).toBeGreaterThan(-1);

      // à sa place dans le document, pas en fin de flux dans un bloc caché
      expect(repos).toBeLessThan(stack);
      expect(html).not.toContain("<!--$?-->");
      expect(html).not.toContain("$RC(");
    });
  }
});

test.describe("lien profond sur téléphone", () => {
  test.use({ viewport: PHONE });

  test("/#my-experiences ne saute pas", async ({ page }) => {
    await page.addInitScript(() => {
      const probe = window as unknown as Probe;
      probe.__shift = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const shift = entry as unknown as {
            hadRecentInput: boolean;
            value: number;
          };
          if (!shift.hadRecentInput) {
            probe.__shift = (probe.__shift ?? 0) + shift.value;
          }
        }
      }).observe({ buffered: true, type: "layout-shift" });
    });

    await page.goto("/#my-experiences", { waitUntil: "load" });

    const target = page.locator("#my-experiences");
    await expect(target).toBeInViewport();
    // la révélation différée tombait 300 ms après la première image
    await page.waitForTimeout(1500);

    const shift = await page.evaluate(
      () => (window as unknown as Probe).__shift ?? 0
    );
    expect(shift).toBeLessThan(MAX_SHIFT);

    // la section visée est restée là où le navigateur a défilé
    const top = await target.evaluate(
      (element) => element.getBoundingClientRect().top
    );
    expect(top).toBeGreaterThanOrEqual(0);
    expect(top).toBeLessThan(PHONE.height / 2);
  });
});

const LATE_PIXEL_FONTS =
  /GeistPixel[-_](?:Grid|Circle|Triangle|Line)/u;

const readTitle = async (page: Page) =>
  await page
    .locator("[data-slot='pixel-heading'] h1")
    .first()
    .evaluate(async (title) => {
      await document.fonts.ready;
      const box = title.getBoundingClientRect();
      return {
        height: box.height,
        loaded: [...document.fonts]
          .filter((font) => font.status === "loaded")
          .map((font) => font.family.replaceAll('"', "")),
        width: box.width,
      };
    });

test.describe("titre pixel", () => {
  test.use({ viewport: PHONE });

  test("sa boîte ne dépend pas des quatre polices tardives", async ({
    page,
  }) => {
    await page.route(LATE_PIXEL_FONTS, (route) => route.abort());
    await page.goto("/articles/how-i-write-css", {
      waitUntil: "load",
    });
    const without = await readTitle(page);

    // TÉMOIN : les quatre polices manquent vraiment, Square est là
    expect(without.loaded).toContain("PixelSquare");
    expect(without.loaded).not.toContain("PixelGrid");

    await page.unroute(LATE_PIXEL_FONTS);
    await page.reload({ waitUntil: "load" });
    await expect
      .poll(async () => (await readTitle(page)).loaded)
      .toEqual(
        expect.arrayContaining([
          "PixelGrid",
          "PixelCircle",
          "PixelTriangle",
          "PixelLine",
        ])
      );
    const loaded = await readTitle(page);

    expect(without.height).toBeCloseTo(loaded.height, 1);
    expect(without.width).toBeCloseTo(loaded.width, 1);
  });
});

/**
 * Journal des écritures sur `<html class>` (l'ANCIENNE valeur de chacune) et
 * des feuilles `*{transition:none}` ajoutées à `<head>` — celle qui coupe les
 * transitions le temps d'un changement de thème, pas celles de sonner.
 */
const watchTheme = async (page: Page) => {
  await page.addInitScript(() => {
    const probe = window as unknown as Probe;
    probe.__classLog = [];
    probe.__styleLog = [];
    new MutationObserver((records) => {
      for (const record of records) {
        if (
          record.type === "attributes" &&
          record.target === document.documentElement
        ) {
          probe.__classLog?.push(record.oldValue ?? "");
        }
        for (const node of record.addedNodes) {
          if (
            node.nodeName === "STYLE" &&
            node.textContent?.startsWith("*,*::before,*::after{")
          ) {
            probe.__styleLog?.push(node.textContent);
          }
        }
      }
    }).observe(document, {
      attributeFilter: ["class"],
      attributeOldValue: true,
      attributes: true,
      childList: true,
      subtree: true,
    });
  });
};

const THEME_CLASS = /\b(?:light|dark)\b/u;

/** vrai si la classe du thème a été RETIRÉE après avoir été posée */
const themeWasDropped = (oldValues: string[]) => {
  let hadTheme = false;
  for (const oldValue of oldValues) {
    if (THEME_CLASS.test(oldValue)) {
      hadTheme = true;
    } else if (hadTheme) {
      return true;
    }
  }
  return false;
};

const readThemeLog = async (page: Page) =>
  await page.evaluate(() => {
    const probe = window as unknown as Probe;
    return {
      classLog: probe.__classLog ?? [],
      styleLog: probe.__styleLog ?? [],
    };
  });

test.describe("thème", () => {
  test.use({ colorScheme: "light" });

  for (const path of ["/", "/en", "/articles/how-i-write-css"]) {
    test(`n'est pas réappliqué au montage sur ${path}`, async ({
      page,
    }) => {
      await watchTheme(page);
      await page.goto(path, { waitUntil: "load" });
      await expect(page.locator(HYDRATED).first()).toBeAttached();
      await page.waitForTimeout(1000);

      // TÉMOIN : le thème est bien posé, par le script en ligne
      await expect(page.locator("html")).toHaveClass(/\blight\b/u);

      const { classLog, styleLog } = await readThemeLog(page);
      expect(themeWasDropped(classLog)).toBe(false);
      expect(styleLog).toEqual([]);
    });
  }

  test("le bouton bascule la classe, sans transition, et s'en souvient", async ({
    page,
  }) => {
    await watchTheme(page);
    await page.goto("/", { waitUntil: "load" });
    const html = page.locator("html");
    const toggle = page
      .getByRole("button", { name: THEME_TOGGLE })
      .first();

    await expect(page.locator(HYDRATED).first()).toBeAttached();
    await expect(html).toHaveClass(/\blight\b/u);
    await toggle.click();

    await expect(html).toHaveClass(/\bdark\b/u);
    await expect(html).not.toHaveClass(/\blight\b/u);
    await expect(html).toHaveCSS("color-scheme", "dark");
    expect(
      await page.evaluate(() => localStorage.getItem("theme"))
    ).toBe("dark");

    // les transitions ont été coupées le temps de la bascule, puis rendues
    expect((await readThemeLog(page)).styleLog).toHaveLength(1);
    await expect
      .poll(
        async () =>
          await page.evaluate(
            () =>
              [...document.head.querySelectorAll("style")].filter(
                (style) =>
                  style.textContent?.startsWith(
                    "*,*::before,*::after{"
                  )
              ).length
          )
      )
      .toBe(0);

    await toggle.click();
    await expect(html).toHaveClass(/\blight\b/u);
    await expect(html).not.toHaveClass(/\bdark\b/u);
    await expect(html).toHaveCSS("color-scheme", "light");
  });

  test("le thème « système » suit le système", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    const html = page.locator("html");
    await expect(page.locator(HYDRATED).first()).toBeAttached();
    await expect(html).toHaveClass(/\blight\b/u);

    await page.emulateMedia({ colorScheme: "dark" });
    await expect(html).toHaveClass(/\bdark\b/u);
    await expect(html).not.toHaveClass(/\blight\b/u);

    await page.emulateMedia({ colorScheme: "light" });
    await expect(html).toHaveClass(/\blight\b/u);
  });

  test("un thème enregistré l'emporte sur le système au rechargement", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      localStorage.setItem("theme", "dark");
    });
    await watchTheme(page);
    await page.goto("/", { waitUntil: "load" });

    await expect(page.locator("html")).toHaveClass(/\bdark\b/u);
    await expect(page.locator(HYDRATED).first()).toBeAttached();
    await page.waitForTimeout(1000);
    const { classLog, styleLog } = await readThemeLog(page);
    expect(themeWasDropped(classLog)).toBe(false);
    expect(styleLog).toEqual([]);
  });
});

/** changements de police du titre pixel sur une fenêtre de temps */
const countTitleTicks = async (page: Page, duration: number) =>
  await page
    .locator("[data-slot='pixel-heading']")
    .first()
    .evaluate(async (heading, wait) => {
      let ticks = 0;
      const observer = new MutationObserver((records) => {
        ticks += records.length;
      });
      observer.observe(heading, {
        attributeFilter: ["class"],
        attributes: true,
        subtree: true,
      });
      await new Promise((resolve) => setTimeout(resolve, wait));
      observer.disconnect();
      return ticks;
    }, duration);

test.describe("titre pixel hors écran", () => {
  test.use({ viewport: PHONE });

  test("ne bat plus, même si deux changements arrivent d'un coup", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "load" });

    // TÉMOIN : à l'écran, le titre bat
    await expect
      .poll(async () => await countTitleTicks(page, 500))
      .toBeGreaterThan(0);

    // Fil principal occupé entre deux images : le titre revient à l'écran puis
    // en ressort, et l'observateur reçoit les deux changements dans UN rappel.
    await page.evaluate(() => window.scrollTo(0, 4000));
    await expect
      .poll(async () => await countTitleTicks(page, 300))
      .toBe(0);
    await page.evaluate(() => {
      const channel = new MessageChannel();
      let step = 0;
      channel.port1.onmessage = () => {
        window.scrollTo(0, step === 0 ? 0 : 4000);
        step += 1;
        const end = performance.now() + 150;
        while (performance.now() < end) {
          // occupé
        }
      };
      channel.port2.postMessage(0);
      channel.port2.postMessage(0);
    });
    await page.waitForTimeout(1000);

    await expect(
      page.locator("[data-slot='pixel-heading']").first()
    ).not.toBeInViewport();
    expect(await countTitleTicks(page, 1000)).toBe(0);
  });
});
