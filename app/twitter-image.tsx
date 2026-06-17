import { ogAlt, ogSize, renderBrandOg } from "@/assets/og"

export const alt = ogAlt
export const size = ogSize
export const contentType = "image/png"

export default function TwitterImage() {
  return renderBrandOg()
}
