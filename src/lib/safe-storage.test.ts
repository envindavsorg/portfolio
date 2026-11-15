import { afterEach, describe, expect, it, vi } from "vitest";

import {
  readStorage,
  removeStorage,
  writeStorage,
} from "./safe-storage";

const memoryStorage = () => {
  const entries = new Map<string, string>();

  return {
    getItem: (key: string) => entries.get(key) ?? null,
    removeItem: (key: string) => {
      entries.delete(key);
    },
    setItem: (key: string, value: string) => {
      entries.set(key, value);
    },
  };
};

const denied = () => {
  throw new DOMException("denied", "SecurityError");
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("stockage disponible", () => {
  it("écrit, relit et retire une valeur", () => {
    vi.stubGlobal("localStorage", memoryStorage());

    expect(readStorage("clock-format")).toBeNull();
    expect(writeStorage("clock-format", "12h")).toBe(true);
    expect(readStorage("clock-format")).toBe("12h");
    expect(removeStorage("clock-format")).toBe(true);
    expect(readStorage("clock-format")).toBeNull();
  });
});

describe("stockage qui lève", () => {
  it("rend l'échec au lieu de le lever, méthode par méthode", () => {
    vi.stubGlobal("localStorage", {
      getItem: denied,
      removeItem: denied,
      setItem: denied,
    });

    expect(readStorage("clock-format")).toBeNull();
    expect(writeStorage("clock-format", "12h")).toBe(false);
    expect(removeStorage("clock-format")).toBe(false);
  });

  it("tient aussi quand l'ACCÈS à `localStorage` lève", () => {
    // stockage du site bloqué : c'est la lecture de la propriété qui jette,
    // avant tout appel de méthode
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      get: denied,
    });

    try {
      expect(readStorage("clock-format")).toBeNull();
      expect(writeStorage("clock-format", "12h")).toBe(false);
      expect(removeStorage("clock-format")).toBe(false);
    } finally {
      Reflect.deleteProperty(globalThis, "localStorage");
    }
  });
});
