import { describe, expect, it } from "vitest";

import { staggerDuration, staggerEasing } from "@/lib/stagger-easing";

/**
 * Les valeurs attendues sont posées à la main. Celles de la courbe viennent de
 * l'extérieur du module : `cubic-bezier(0, 0, 0.58, 1)` résolue en Python par
 * dichotomie sur x(u) = 1,74u² − 0,74u³, puis y(u) = 3u² − 2u³.
 */
describe("staggerDuration", () => {
  it("additionne l'attente, l'étalement des départs et une animation", () => {
    // 20 lettres : pas de 15 ms, dernier départ à 200 + 19 × 15 = 485 ms
    expect(
      staggerDuration({
        count: 20,
        delay: 200,
        duration: 300,
        spread: 300,
      })
    ).toBe(785);
  });

  it("vaut une seule animation pour un segment unique", () => {
    expect(
      staggerDuration({
        count: 1,
        delay: 0,
        duration: 300,
        spread: 300,
      })
    ).toBe(300);
  });

  it("ne divise pas par zéro sans segment", () => {
    expect(
      staggerDuration({
        count: 0,
        delay: 0,
        duration: 300,
        spread: 300,
      })
    ).toBe(300);
  });
});

describe("staggerEasing", () => {
  it("rend la courbe d'origine quand le segment occupe toute la ligne", () => {
    expect(
      staggerEasing(0, {
        count: 1,
        delay: 0,
        duration: 300,
        spread: 300,
      })
    ).toBe(
      "linear(0, 0 0%, 0.161 10%, 0.308 20%, 0.445 30%, 0.571 40%, 0.685 50%, 0.785 60%, 0.87 70%, 0.938 80%, 0.983 90%, 1 100%, 1)"
    );
  });

  it("retarde chaque segment par un plateau, sans délai", () => {
    // ligne de 500 ms : attente 100, pas 200 / 2 = 100, animation 300
    const timeline = {
      count: 2,
      delay: 100,
      duration: 300,
      spread: 200,
    };

    // de 100 à 400 ms, soit 20 % à 80 %
    expect(staggerEasing(0, timeline)).toBe(
      "linear(0, 0 20%, 0.161 26%, 0.308 32%, 0.445 38%, 0.571 44%, 0.685 50%, 0.785 56%, 0.87 62%, 0.938 68%, 0.983 74%, 1 80%, 1)"
    );
    // de 200 à 500 ms, soit 40 % à 100 %
    expect(staggerEasing(1, timeline)).toBe(
      "linear(0, 0 40%, 0.161 46%, 0.308 52%, 0.445 58%, 0.571 64%, 0.685 70%, 0.785 76%, 0.87 82%, 0.938 88%, 0.983 94%, 1 100%, 1)"
    );
  });

  it("fait partir le dernier segment en premier en sens inverse", () => {
    // ligne de 400 ms : pas de 100, animation 300
    const timeline = {
      count: 2,
      delay: 0,
      duration: 300,
      reverse: true,
      spread: 200,
    };

    // le premier segment attend son tour : de 100 à 400 ms
    expect(staggerEasing(0, timeline)).toBe(
      "linear(0, 0 25%, 0.161 32.5%, 0.308 40%, 0.445 47.5%, 0.571 55%, 0.685 62.5%, 0.785 70%, 0.87 77.5%, 0.938 85%, 0.983 92.5%, 1 100%, 1)"
    );
    // le dernier part tout de suite : de 0 à 300 ms
    expect(staggerEasing(1, timeline)).toBe(
      "linear(0, 0 0%, 0.161 7.5%, 0.308 15%, 0.445 22.5%, 0.571 30%, 0.685 37.5%, 0.785 45%, 0.87 52.5%, 0.938 60%, 0.983 67.5%, 1 75%, 1)"
    );
  });

  it("arrondit les positions à deux décimales", () => {
    // 7 segments : pas de 300 / 7, ligne de 6 × 300 / 7 + 300 = 557,142857 ms.
    // Le segment 1 part à 42,857143 ms, soit 7,6923 % ; son premier relevé
    // tombe 30 ms plus tard, à 72,857143 ms, soit 13,0769 %.
    expect(
      staggerEasing(1, {
        count: 7,
        delay: 0,
        duration: 300,
        spread: 300,
      }).startsWith("linear(0, 0 7.69%, 0.161 13.08%, ")
    ).toBe(true);
  });
});
