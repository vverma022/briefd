import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function deepTrim<T>(value: T): T {
  if (typeof value === "string") {
    return value.trim() as T
  }
  if (Array.isArray(value)) {
    return value.map((item) => deepTrim(item)) as T
  }
  if (
    value &&
    typeof value === "object" &&
    !(value instanceof FormData) &&
    !(value instanceof Blob) &&
    !(value instanceof Date)
  ) {
    const out: Record<string, unknown> = {}
    for (const [key, val] of Object.entries(value)) {
      out[key] = deepTrim(val)
    }
    return out as T
  }
  return value
}

export function normalizeUrl(raw: string | undefined, fallback: string): string {
  const value = raw?.trim() || fallback
  return /^https?:\/\//i.test(value) ? value : `https://${value}`
}