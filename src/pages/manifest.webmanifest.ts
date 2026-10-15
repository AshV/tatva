import type { APIRoute } from "astro";

export const GET: APIRoute = () => {
  const base = import.meta.env.BASE_URL;
  const manifest = {
    $schema: "https://json.schemastore.org/web-manifest-combined.json",
    name: "तत्त्व — शाश्वत विचार",
    short_name: "तत्त्व",
    description: "संत कबीर, स्वामी विवेकानंद, गौतम बुद्ध और भारतीय दर्शन के कालजयी विचार, दोहे और अनमोल सूक्तियां।",
    start_url: base,
    scope: base,
    display: "standalone",
    display_override: ["window-controls-overlay", "standalone", "minimal-ui"],
    orientation: "any",
    background_color: "#0a0a0f",
    theme_color: "#0a0a0f",
    categories: ["lifestyle", "education", "books"],
    lang: "hi-IN",
    dir: "ltr",
    icons: [
      {
        src: `${base}icons/icon-192.png`,
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: `${base}icons/icon-512.png`,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: `${base}icons/icon-maskable-192.png`,
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: `${base}icons/icon-maskable-512.png`,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: `${base}icons/apple-touch-icon.png`,
        sizes: "180x180",
        type: "image/png",
      },
    ],
    shortcuts: [
      {
        name: "दैनिक चिंतन",
        short_name: "चिंतन",
        description: "आज का अमर विचार एवं प्रेरणा",
        url: base,
        icons: [{ src: `${base}icons/icon-192.png`, sizes: "192x192" }],
      },
      {
        name: "विचारक व विषय",
        short_name: "अन्वेषण",
        description: "भारतीय दार्शनिकों और संतों के विचार खोजें",
        url: `${base}#explore`,
        icons: [{ src: `${base}icons/icon-192.png`, sizes: "192x192" }],
      },
    ],
  };

  return new Response(JSON.stringify(manifest, null, 2), {
    headers: { "Content-Type": "application/manifest+json; charset=utf-8" },
  });
};
