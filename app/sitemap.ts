import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

const lastModified = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: { path: string; priority: number; changeFrequency: "monthly" | "yearly" }[] = [
    { path: "/", priority: 1, changeFrequency: "monthly" },
    { path: "/the-3-hour-method", priority: 0.9, changeFrequency: "monthly" },
    { path: "/transformations", priority: 0.8, changeFrequency: "monthly" },
    { path: "/pricing", priority: 0.8, changeFrequency: "monthly" },
    { path: "/about", priority: 0.6, changeFrequency: "yearly" },
    { path: "/contact", priority: 0.7, changeFrequency: "yearly" },
    { path: "/privacy-policy", priority: 0.2, changeFrequency: "yearly" },
  ];

  return entries.map((entry) => ({
    url: new URL(entry.path, siteConfig.url).toString(),
    lastModified,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));
}
