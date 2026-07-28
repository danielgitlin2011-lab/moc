import { ImageResponse } from "next/og";

// Safari ignores SVG touch icons, so the home-screen mark is rendered here.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#233a31",
          color: "#e3c287",
          fontSize: 116,
          fontFamily: "Georgia, serif",
          fontStyle: "italic",
        }}
      >
        S
      </div>
    ),
    size,
  );
}
