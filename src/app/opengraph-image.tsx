import { renderOg } from "@/lib/og";

export const alt = "BA, logo do portfólio de Bruno Andrade";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return renderOg();
}
