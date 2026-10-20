import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kitty Glitter",
    short_name: "Kitty Glitter",
    description: "A calm personal life hub. Demo with fictional data.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f1f5f3",
    theme_color: "#2b7a74",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
