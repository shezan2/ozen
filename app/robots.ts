import type { MetadataRoute } from "next";
import { club } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${club.url}/sitemap.xml`,
  };
}
