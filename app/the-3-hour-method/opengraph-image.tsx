import { renderOgImage, ogContentType, ogSize } from "@/lib/og";

export const alt = "The 3-Hour Method — time-efficient training for working fathers";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOgImage({
    kicker: "The 3-hour method",
    title: "Three hours a week is the whole training budget.",
  });
}
