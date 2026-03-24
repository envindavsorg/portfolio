"use client";

import { useCallback, useRef } from "react";

import { CopyButton } from "@/components/primitives/Button";

const cache = new Map<string, string>();

interface ArticleCopyMarkdownProps {
  markdownUrl: string;
  variant?: "default" | "outline" | "link" | "ghost";
  size?: "default" | "icon";
  className?: string;
}

export const ArticleCopyMarkdown = ({
  markdownUrl,
  variant = "outline",
  size = "icon",
  className,
}: ArticleCopyMarkdownProps) => {
  const controllerRef = useRef<AbortController>(null);

  const getMarkdown = useCallback(async () => {
    const cached = cache.get(markdownUrl);
    if (cached) {
      return cached;
    }

    controllerRef.current?.abort();
    controllerRef.current = new AbortController();

    const res = await fetch(markdownUrl, {
      signal: controllerRef.current.signal,
    });
    if (!res.ok) {
      throw new Error(`${res.status}`);
    }

    const text = await res.text();
    cache.set(markdownUrl, text);
    return text;
  }, [markdownUrl]);

  return (
    <CopyButton
      className={className}
      getValueAction={getMarkdown}
      label="copier le markdown dans le presse-papier"
      size={size}
      variant={variant}
    />
  );
};
