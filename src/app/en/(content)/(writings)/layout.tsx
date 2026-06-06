import type { Metadata } from "next";

export { default } from "@/app/(fr)/(content)/(writings)/layout";

export const metadata: Metadata = {
  description:
    "Technical explorations of React, Next.js and TypeScript: articles, reusable components and tools for modern web development.",
  title: {
    default: "Articles",
    template: "%s | Articles, components and web tools",
  },
};
