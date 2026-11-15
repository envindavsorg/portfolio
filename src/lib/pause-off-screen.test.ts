import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * L'environnement est `node` : ni `IntersectionObserver` ni `HTMLElement`. Les
 * deux sont remplacés par des doublures qui ne font qu'enregistrer — le rappel
 * est ensuite déclenché à la main, avec les lots qu'un navigateur occupé
 * livre réellement.
 */
class FakeElement {
  style = { animationPlayState: "" };
}

interface Change {
  isIntersecting: boolean;
  target: FakeElement;
}

class FakeObserver {
  static readonly instances: FakeObserver[] = [];

  readonly observed = new Set<FakeElement>();
  readonly options: IntersectionObserverInit | undefined;
  readonly report: (changes: Change[]) => void;

  constructor(
    report: (changes: Change[]) => void,
    options?: IntersectionObserverInit
  ) {
    this.report = report;
    this.options = options;
    FakeObserver.instances.push(this);
  }

  observe(element: FakeElement) {
    this.observed.add(element);
  }

  unobserve(element: FakeElement) {
    this.observed.delete(element);
  }
}

const load = async () => {
  const { pauseOffScreen } = await import("./pause-off-screen");
  return (element: FakeElement | null) =>
    pauseOffScreen(element as unknown as HTMLElement | null);
};

beforeEach(() => {
  vi.resetModules();
  FakeObserver.instances.length = 0;
  vi.stubGlobal("HTMLElement", FakeElement);
  vi.stubGlobal("IntersectionObserver", FakeObserver);
});

describe("pauseOffScreen", () => {
  it("ne crée aucun observateur tant qu'aucun élément n'est confié", async () => {
    const pauseOffScreen = await load();

    expect(pauseOffScreen(null)).toBeUndefined();
    expect(FakeObserver.instances).toHaveLength(0);
  });

  it("partage UN observateur entre tous les éléments", async () => {
    const pauseOffScreen = await load();
    const dots = [
      new FakeElement(),
      new FakeElement(),
      new FakeElement(),
    ];

    for (const dot of dots) {
      pauseOffScreen(dot);
    }

    expect(FakeObserver.instances).toHaveLength(1);
    expect([...(FakeObserver.instances[0]?.observed ?? [])]).toEqual(
      dots
    );
  });

  it("reprend avant l'entrée à l'écran", async () => {
    const pauseOffScreen = await load();
    pauseOffScreen(new FakeElement());

    expect(FakeObserver.instances[0]?.options?.rootMargin).toBe(
      "200px"
    );
  });

  it("met en pause hors écran et rend la main au CSS à l'écran", async () => {
    const pauseOffScreen = await load();
    const dot = new FakeElement();
    pauseOffScreen(dot);
    const observer = FakeObserver.instances[0];

    observer?.report([{ isIntersecting: false, target: dot }]);
    expect(dot.style.animationPlayState).toBe("paused");

    observer?.report([{ isIntersecting: true, target: dot }]);
    expect(dot.style.animationPlayState).toBe("");
  });

  it("lit tout le lot, dans l'ordre : ni le premier seul, ni le dernier seul", async () => {
    const pauseOffScreen = await load();
    const [first, second] = [new FakeElement(), new FakeElement()];
    pauseOffScreen(first);
    pauseOffScreen(second);

    // fil principal occupé : deux changements par cible dans UN rappel
    FakeObserver.instances[0]?.report([
      { isIntersecting: true, target: first },
      { isIntersecting: false, target: second },
      { isIntersecting: false, target: first },
      { isIntersecting: true, target: second },
    ]);

    expect(first.style.animationPlayState).toBe("paused");
    expect(second.style.animationPlayState).toBe("");
  });

  it("cesse d'observer l'élément au démontage", async () => {
    const pauseOffScreen = await load();
    const [kept, removed] = [new FakeElement(), new FakeElement()];
    pauseOffScreen(kept);
    const cleanup = pauseOffScreen(removed);

    cleanup?.();

    expect([...(FakeObserver.instances[0]?.observed ?? [])]).toEqual([
      kept,
    ]);
  });
});
