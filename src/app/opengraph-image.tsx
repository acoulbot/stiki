import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #1A1A1A 0%, #2A2A2A 50%, #1A1A1A 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              fontSize: "72px",
              fontWeight: 800,
              color: "white",
              letterSpacing: "-2px",
            }}
          >
            hit
          </div>
          <div
            style={{
              fontSize: "72px",
              fontWeight: 800,
              color: "#E8403A",
              letterSpacing: "-2px",
            }}
          >
            tabak
          </div>
        </div>
        <div
          style={{
            fontSize: "28px",
            color: "rgba(255,255,255,0.8)",
            textAlign: "center",
            maxWidth: "800px",
            lineHeight: 1.4,
          }}
        >
          Устройства и стики нового поколения
        </div>
        <div
          style={{
            fontSize: "20px",
            color: "rgba(255,255,255,0.5)",
            marginTop: "16px",
          }}
        >
          hittabak.ru
        </div>
      </div>
    ),
    { ...size }
  );
}
