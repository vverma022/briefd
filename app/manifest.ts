import type { MetadataRoute } from "next"

// Web App Manifest — makes Briefd installable to the home screen (and is a
// prerequisite for iOS web push). Next serves this at /manifest.webmanifest and
// auto-injects <link rel="manifest">. Icons are generated PNG routes.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Briefd — Your newsletters, briefed.",
    short_name: "Briefd",
    description:
      "AI turns every newsletter into a three-line brief, pushed to your phone the moment it lands.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#080808",
    theme_color: "#080808",
    icons: [
      {
        src: "/icons/192",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/512",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/512",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  }
}
