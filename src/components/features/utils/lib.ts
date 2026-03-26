export const RECENT_KEY = "utils-recently-used";
export const MAX_RECENT = 5;

export const getRecentSlugs = (): string[] => {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const trackVisit = (slug: string) => {
  const slugs = getRecentSlugs().filter((s) => s !== slug);
  slugs.unshift(slug);
  localStorage.setItem(
    RECENT_KEY,
    JSON.stringify(slugs.slice(0, MAX_RECENT))
  );
};
