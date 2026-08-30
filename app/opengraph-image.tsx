import { renderOgImage, ogContentType, ogSize } from "@/lib/og";

export const alt = "Myo Fitness Solutions — coaching for time-poor Singapore dads";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOgImage({
    kicker: "Singapore",
    title: "Lose 5–10kg on three hours a week.",
  });
}
