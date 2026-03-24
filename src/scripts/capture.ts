import { promises } from "node:fs";
import { join } from "node:path";

import { green, red, yellow } from "colorette";
import consola from "consola";
import { launch } from "puppeteer-core";
import type { Browser, Page } from "puppeteer-core";

type FilePath = `${string}.webp` | `${string}.png` | `${string}.jpeg`;

const executablePath =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const url = "http://localhost:1409";

const screenshotsDir = join(process.cwd(), "public/images/meta");
const ogDir = join(process.cwd(), "public/images/og");

export const SIZE = {
  desktop: {
    height: 1080,
    width: 1920,
  },
  mobile: {
    height: 956,
    width: 440,
  },
  "og-image": {
    height: 630,
    width: 1200,
  },
} as const;

interface CaptureScreenshot {
  browser: Browser;
  urlLink: string;
  size: keyof typeof SIZE;
  themes?: "light" | "dark" | ("light" | "dark")[];
  type?: "webp" | "png" | "jpeg";
}

const captureScreenshot = async ({
  browser,
  urlLink,
  size,
  themes = ["light"],
  type = "webp",
}: CaptureScreenshot): Promise<void> => {
  const outputDir = size === "og-image" ? ogDir : screenshotsDir;

  await promises.mkdir(outputDir, {
    recursive: true,
  });

  for (const theme of themes) {
    const page: Page = await browser.newPage();

    const { width, height } = SIZE[size];
    await page.setViewport({
      height,
      width,
    });

    await page.emulateMediaFeatures([
      {
        name: "prefers-color-scheme",
        value: theme,
      },
    ]);

    await page.evaluateOnNewDocument((themeElement) => {
      localStorage.setItem("theme", themeElement);
    }, theme);

    await page.goto(urlLink, {
      waitUntil: "networkidle2",
    });

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const fileName: string = `${size}-${theme}.${type}`;
    const path = join(outputDir, fileName) as FilePath;
    const quality = type === "png" ? undefined : 90;

    await page.screenshot({ path, quality, type });

    const relativePath = path.replace(process.cwd(), "");

    consola.info(
      `${size === "og-image" ? "OG Image" : "Screenshot"} saved : ${yellow(relativePath)}`
    );

    await page.close();
  }
};

const main = async (): Promise<void> => {
  const browser: Browser = await launch({
    executablePath,
  });

  const themes = ["light", "dark"] as "light" | "dark"[];

  try {
    await captureScreenshot({
      browser,
      size: "desktop",
      themes,
      urlLink: url,
    });
    await captureScreenshot({
      browser,
      size: "mobile",
      themes,
      urlLink: url,
    });
    await captureScreenshot({
      browser,
      size: "og-image",
      themes: ["dark"],
      type: "png",
      urlLink: `${url}/og`,
    });

    consola.success(
      `All screenshots and og image ${green("captured successfully")} !`
    );
  } catch (error) {
    consola.error(
      `${red("Error capturing")} screenshots or og image:`,
      error
    );
  } finally {
    await browser.close();
  }
};

main();
