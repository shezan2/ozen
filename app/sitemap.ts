import type { MetadataRoute } from "next";
import { club } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: club.url, changeFrequency: "weekly", priority: 1 },
    { url: `${club.url}/squad`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${club.url}/matches`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${club.url}/leaderboard`, changeFrequency: "weekly", priority: 0.7 },
  ];
}
