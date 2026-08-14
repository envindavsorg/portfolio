import { createWriteStream, promises } from "node:fs";
import { join } from "node:path";
import { finished as streamFinished } from "node:stream/promises";
import { setTimeout as sleep } from "node:timers/promises";

import { GifEncoder } from "@skyra/gifenc";
import consola from "consola";
import { PNG } from "pngjs";
import type { Browser, ElementHandle, Page } from "puppeteer-core";
import { launch } from "puppeteer-core";
import sharp from "sharp";

const executablePath =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const baseUrl = "http://localhost:1409";
const outputDir = join(process.cwd(), "public/images/blog");

const COMPONENTS = [
  {
    canReplay: true,
    duration: 5000,
    name: "apple-hello-effect-demo",
  },
  {
    canReplay: true,
    duration: 10_000,
    name: "flip-sentences-demo",
  },
  {
    canReplay: false,
    name: "theme-switcher-demo",
  },
] as const;

const THEMES = ["light", "dark"] as const;

interface CaptureComponentOptions {
  browser: Browser;
  componentName: string;
  theme: (typeof THEMES)[number];
  canReplay: boolean;
  duration?: number;
}

const captureGif = async (
  _page: Page,
  componentElement: ElementHandle,
  duration: number,
  outputPath: string
): Promise<void> => {
  const box = await componentElement.boundingBox();
  if (!box) {
    throw new Error("Could not get element bounding box");
  }

  const fps = 20;
  const frameInterval = 1000 / fps;
  const totalFrames = Math.ceil(duration / frameInterval);

  consola.info(
    `Recording ${totalFrames} frames at ${fps}fps for ${duration}ms...`
  );

  const encoder = new GifEncoder(
    Math.round(box.width),
    Math.round(box.height)
  );
  const stream = createWriteStream(outputPath);
  encoder.createReadStream().pipe(stream);

  encoder.start();
  encoder.setRepeat(0);
  encoder.setDelay(frameInterval);
  encoder.setQuality(20);

  for (let i = 0; i < totalFrames; i += 1) {
    const screenshot = (await componentElement.screenshot({
      type: "png",
    })) as Buffer;

    const png = PNG.sync.read(screenshot);
    encoder.addFrame(new Uint8ClampedArray(png.data));

    await sleep(frameInterval);

    if ((i + 1) % 10 === 0) {
      consola.info(`  - progress: ${i + 1}/${totalFrames} frames`);
    }
  }

  encoder.finish();

  await streamFinished(stream);
};

const captureComponent = async ({
  browser,
  componentName,
  theme,
  canReplay,
  duration,
}: CaptureComponentOptions): Promise<void> => {
  const componentDir = join(outputDir, componentName);
  await promises.mkdir(componentDir, { recursive: true });

  const page = await browser.newPage();

  await page.setViewport({ height: 800, width: 1200 });

  const slugMap: Record<string, string> = {
    "apple-hello-effect-demo": "writing-effect-inspired-by-apple",
    "flip-sentences-demo": "flip-sentences-component",
    "theme-switcher-demo": "theme-switcher-component",
  };

  const blogSlug = slugMap[componentName];
  if (!blogSlug) {
    consola.warn(`No blog slug mapping found for ${componentName}`);
    return;
  }

  const url = `${baseUrl}/components/${blogSlug}`;

  await page.emulateMediaFeatures([
    {
      name: "prefers-color-scheme",
      value: theme,
    },
  ]);

  await page.evaluateOnNewDocument((themeElement) => {
    localStorage.setItem("theme", themeElement);
  }, theme);

  await page.goto(url, { waitUntil: "networkidle2" });

  await page.waitForSelector(
    '[role="tabpanel"][data-state="active"]',
    {
      timeout: 10_000,
    }
  );

  await sleep(3000);

  const componentElement = await page.$(
    "[data-screenshot-anchor-target-for-capture]"
  );

  if (!componentElement) {
    consola.warn(`Component preview not found for ${componentName}`);

    await page.close();

    return;
  }

  if (canReplay && duration) {
    const buttonFound = await page.evaluate(() => {
      const preview = document.querySelector(
        '[role="tabpanel"][data-state="active"]'
      );

      if (!preview) {
        return false;
      }

      const buttons = preview.querySelectorAll("button");

      for (const btn of buttons) {
        if (btn.querySelector("svg")) {
          (btn as HTMLButtonElement).click();

          return true;
        }
      }

      return false;
    });

    if (!buttonFound) {
      consola.warn(`Replay button not found for ${componentName}`);

      await page.close();

      return;
    }

    await sleep(300);

    const remountedElement = await page.$(
      "[data-screenshot-anchor-target-for-capture]"
    );

    if (!remountedElement) {
      consola.warn(
        `Component element not found after remount for ${componentName}`
      );

      await page.close();

      return;
    }

    // le GIF n'est qu'un INTERMÉDIAIRE : l'encodeur image par image fonctionne,
    // mais son format pesait 2 827 351 octets pour quatre démos. La conversion en
    // WebP animé les ramène à 204 866 octets (−92,8 %) à durée, dimensions et
    // rendu identiques — libwebp fusionne simplement les images consécutives
    // identiques en cumulant leur délai.
    const gifPath = join(componentDir, `${theme}.gif`);
    const webpPath = join(
      componentDir,
      `${theme}.webp`
    ) as `${string}.webp`;

    await captureGif(page, remountedElement, duration, gifPath);

    await sharp(gifPath, { animated: true })
      .webp({ effort: 6, quality: 90 })
      .toFile(webpPath);

    await promises.unlink(gifPath);

    consola.success(`Animated WebP saved: ${webpPath}`);
  } else {
    const filePath = join(
      componentDir,
      `${theme}.webp`
    ) as `${string}.webp`;

    await componentElement.screenshot({
      path: filePath,
      quality: 90,
      type: "webp",
    });

    consola.success(`Screenshot saved: ${filePath}`);
  }

  await page.close();
};

const main = async (): Promise<void> => {
  const browser = await launch({
    executablePath,
  });

  try {
    for (const component of COMPONENTS) {
      consola.info(
        `Capturing ${component.canReplay ? "GIFs" : "screenshots"} for ${component.name}...`
      );

      for (const theme of THEMES) {
        await captureComponent({
          browser,
          canReplay: component.canReplay,
          componentName: component.name,
          duration:
            "duration" in component ? component.duration : undefined,
          theme,
        });
      }
    }

    consola.success(
      "All component screenshots captured successfully."
    );
  } catch (error) {
    consola.error("Error capturing component screenshots:", error);
  } finally {
    await browser.close();
  }
};

main();
