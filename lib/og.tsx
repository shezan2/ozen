import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site-config";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

const INK = "#0b0b0c";
const LIME = "#57e64b";

/**
 * Shared Open Graph card. Each route passes its own kicker and title, so no two
 * routes share a social image.
 */
export function renderOgImage({
  kicker,
  title,
  footnote,
}: {
  kicker: string;
  title: string;
  footnote?: string;
}) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: INK,
          color: "#ffffff",
          padding: "72px 80px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 16, height: 16, background: LIME }} />
          <div
            style={{
              fontSize: 26,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: LIME,
            }}
          >
            {kicker}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: title.length > 46 ? 74 : 92,
            lineHeight: 1.02,
            letterSpacing: -3,
            maxWidth: 960,
          }}
        >
          {title}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 34, letterSpacing: -1 }}>{siteConfig.brand}</div>
            <div style={{ fontSize: 24, color: "rgba(255,255,255,0.55)" }}>
              {footnote ?? siteConfig.domain}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              background: LIME,
              color: INK,
              fontSize: 28,
              padding: "12px 22px",
            }}
          >
            3 hrs / week
          </div>
        </div>
      </div>
    ),
    ogSize,
  );
}
