// Shared theme constants. Kept in a server-safe module (NOT the "use client"
// theme-provider) so the server layout can import the real values — client
// modules expose their exports to Server Components only as client references.
export type Theme = "light" | "dark"

export const THEME_COOKIE = "theme"
export const DEFAULT_THEME: Theme = "dark"
