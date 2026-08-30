import { renderOgImage, ogContentType, ogSize } from "@/lib/og";

export const alt = "About the coach behind Myo Fitness Solutions";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOgImage({
    kicker: "About",
    title: "A method built by someone who ran out of time first.",
  });
}
