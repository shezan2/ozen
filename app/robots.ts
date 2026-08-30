import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

/**
 * Production robots. The whole site is crawlable — nothing here disallows the
 * site after launch.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
