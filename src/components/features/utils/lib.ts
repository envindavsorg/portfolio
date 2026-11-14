import { readStorage, writeStorage } from "@/lib/safe-storage";

export const RECENT_KEY = "utils-recently-used";
export const MAX_RECENT = 5;

export const getRecentSlugs = (): string[] => {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = readStorage(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const trackVisit = (slug: string) => {
  const slugs = getRecentSlugs().filter((s) => s !== slug);
  slugs.unshift(slug);
  // sans garde, une page d'outil tombait dès que le stockage refusait d'écrire
  writeStorage(
    RECENT_KEY,
    JSON.stringify(slugs.slice(0, MAX_RECENT))
  );
};
