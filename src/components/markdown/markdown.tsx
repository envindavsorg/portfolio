import type { ComponentProps } from "react";
import { MarkdownAsync } from "react-markdown";
import rehypeExternalLinks from "rehype-external-links";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

import { rehypeAddQueryParams } from "@/lib/rehype-add-query-params";

export const Markdown = (
  props: ComponentProps<typeof MarkdownAsync>
) => (
  <MarkdownAsync
    rehypePlugins={[
      rehypeRaw,
      [
        rehypeExternalLinks,
        { rel: "nofollow noopener noreferrer", target: "_blank" },
      ],
      [rehypeAddQueryParams],
    ]}
    remarkPlugins={[remarkGfm]}
    {...props}
  />
);
