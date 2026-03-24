import { Logger } from "tslog";

export const logger = new Logger({
  minLevel: process.env.NODE_ENV === "production" ? 3 : 0,
  name: "mon portfolio",
  type: "pretty",
});
