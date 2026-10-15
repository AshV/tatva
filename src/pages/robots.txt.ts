import type { APIRoute } from "astro";
import { resolveCanonicalUrl } from "wisdom";

export const GET: APIRoute = ({ site }) => {
  const base = import.meta.env.BASE_URL;
  const sitemapUrl = resolveCanonicalUrl("sitemap-index.xml", site?.origin);

  return new Response(`User-agent: *\nAllow: ${base}\n\nSitemap: ${sitemapUrl}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
