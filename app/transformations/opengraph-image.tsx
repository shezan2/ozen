import { renderOgImage, ogContentType, ogSize } from "@/lib/og";

export const alt = "Client transformations at Myo Fitness Solutions";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOgImage({
    kicker: "Transformations",
    title: "Real numbers, including the one nobody advertises.",
  });
}
