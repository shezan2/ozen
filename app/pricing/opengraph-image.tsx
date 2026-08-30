import { renderOgImage, ogContentType, ogSize } from "@/lib/og";

export const alt = "Coaching packages and prices at Myo Fitness Solutions";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOgImage({
    kicker: "Pricing",
    title: "Blocks of sessions, not a subscription.",
  });
}
