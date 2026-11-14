import type { Metadata } from "next";

export { default } from "@/app/(fr)/(content)/(writings)/layout";

// pas de `title` : voir le layout français, le gabarit vient du layout racine
export const metadata: Metadata = {
  description:
    "Technical explorations of React, Next.js and TypeScript: articles, reusable components and tools for modern web development.",
};
