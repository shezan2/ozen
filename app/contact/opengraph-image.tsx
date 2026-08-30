import { renderOgImage, ogContentType, ogSize } from "@/lib/og";

export const alt = "Contact Myo Fitness Solutions";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOgImage({
    kicker: "Contact",
    title: "One word gets it started.",
  });
}
