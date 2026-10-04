import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

const font = () => readFile(join(process.cwd(), "public/fonts/PixelifySans-Bold.ttf"));

export async function renderOg() {
  const pixel = await font();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f0d0e",
        }}
      >
        <div
          style={{
            width: 340,
            height: 340,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#c8322b",
            color: "#ffffff",
            fontFamily: "Pixelify",
            fontSize: 170,
            boxShadow: "16px 16px 0 #060406",
          }}
        >
          BA
        </div>
      </div>
    ),
    { width: 1200, height: 630, fonts: [{ name: "Pixelify", data: pixel, weight: 700, style: "normal" }] },
  );
}

export async function renderMonogram(px: number) {
  const pixel = await font();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#c8322b",
          color: "#ffffff",
          fontFamily: "Pixelify",
          fontSize: px * 0.5,
        }}
      >
        BA
      </div>
    ),
    { width: px, height: px, fonts: [{ name: "Pixelify", data: pixel, weight: 700, style: "normal" }] },
  );
}
