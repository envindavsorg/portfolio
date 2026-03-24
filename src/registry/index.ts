import type { Registry } from "shadcn/schema";

import { blocks } from "./registry-blocks";
import { components } from "./registry-components";
import { examples } from "./registry-examples";
import { hook } from "./registry-hook";
import { lib } from "./registry-lib";

const registry: Registry = {
  homepage: "https://cuzeacflorin.fr/components",
  items: [
    ...lib,
    ...hook,
    ...components,
    ...blocks,
    // Internal use only
    ...examples,
  ],
  name: "envindavsorg",
};

export { registry };
export default registry;
