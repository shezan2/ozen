import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: site.url, changeFrequency: "monthly", priority: 1 },
    { url: `${site.url}/book`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${site.url}/legal`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
