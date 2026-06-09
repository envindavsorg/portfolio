import type { ReactNode } from "react";

import { PixelHeading } from "../blocks/PixelHeading";

interface ArticleTitleProps {
  title: string;
  children?: ReactNode;
}

export const ArticleTitle = ({
  title,
  children,
}: ArticleTitleProps) => (
  <div className="screen-line-after flex w-full items-center justify-between gap-x-3 px-2 sm:px-4">
    <PixelHeading
      autoPlay
      className="text-balance font-extrabold text-[28px] lowercase leading-snug sm:text-4xl"
      mode="multi"
    >
      {title}
    </PixelHeading>
    {children}
  </div>
);
