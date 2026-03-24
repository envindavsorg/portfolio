import type React from "react";

import { CodeCollapsibleWrapper } from "./CodeCollapsibleWrapper";

interface ComponentSourceProps {
  name: string;
  src?: string;
  title?: string;
  showLineNumbers?: boolean;
  collapsible?: boolean;
}

export const ComponentSource = ({
  collapsible = true,
  children,
}: React.ComponentProps<"div"> & ComponentSourceProps) => {
  if (!collapsible || String(collapsible) === "false") {
    return <div className="mt-6">{children}</div>;
  }

  return <CodeCollapsibleWrapper>{children}</CodeCollapsibleWrapper>;
};
