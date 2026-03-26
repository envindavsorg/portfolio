export type UtilsSortMode = "a-z" | "z-a";

export interface UtilsItem {
  slug: string;
  metadata: {
    title: string;
    description: string;
    isNew?: boolean;
    createdAt: string;
  };
}
