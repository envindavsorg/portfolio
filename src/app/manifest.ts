import type { MetadataRoute } from "next";

import GLOBAL_DATA from "@/data/global";
import { META_THEME_COLORS } from "@/data/theme";

const manifest = (): MetadataRoute.Manifest => ({
  background_color: META_THEME_COLORS.light,
  description: GLOBAL_DATA.USER.bio,
  display: "standalone",
  icons: [
    {
      purpose: "any",
      sizes: "192x192",
      src: "/icon-192x192.png",
      type: "image/png",
    },
    {
      purpose: "any",
      sizes: "512x512",
      src: "/icon-512x512.png",
      type: "image/png",
    },
    {
      purpose: "maskable",
      sizes: "512x512",
      src: "/maskable-icon.png",
      type: "image/png",
    },
  ],
  name: GLOBAL_DATA.USER.fullName,
  scope: "/",
  screenshots: [
    {
      form_factor: "narrow",
      sizes: "440x956",
      src: "/images/meta/mobile-dark.webp",
      type: "image/webp",
    },
    {
      form_factor: "narrow",
      sizes: "440x956",
      src: "/images/meta/mobile-light.webp",
      type: "image/webp",
    },
    {
      form_factor: "wide",
      sizes: "1920x1080",
      src: "/images/meta/desktop-dark.webp",
      type: "image/webp",
    },
    {
      form_factor: "wide",
      sizes: "1920x1080",
      src: "/images/meta/desktop-light.webp",
      type: "image/webp",
    },
  ],
  short_name: GLOBAL_DATA.USER.firstName,
  // sans start_url, le lanceur ouvre l'URL courante au moment de l'installation
  start_url: "/",
  theme_color: META_THEME_COLORS.light,
});

export default manifest;
