# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Critical: Next.js 16

This project uses **Next.js 16** (`next@16.2.6`), which has breaking changes from
earlier versions you may know. As `AGENTS.md` warns: **read the relevant guide in
`node_modules/next/dist/docs/` before writing any Next.js code**, and heed
deprecation notices. Do not assume APIs, conventions, or file structure from older
Next.js versions.

## Commands

Package manager is **pnpm** (see `pnpm-lock.yaml`, `pnpm-workspace.yaml`).

- `pnpm dev` — run dev server
- `pnpm build` — production build
- `pnpm start` — serve production build
- `pnpm lint` — ESLint (flat config, `eslint-config-next` core-web-vitals + typescript)
- `pnpm typecheck` — `tsc --noEmit`
- `pnpm format` — Prettier write across `**/*.{ts,tsx}`

There is no test framework configured.

## Code style (enforced by Prettier)

- **No semicolons**, **double quotes**, 2-space indent, trailing commas `es5`, 80 col.
- The Prettier Tailwind plugin sorts classes; `cn(...)` and `cva(...)` arguments are
  treated as class lists (`tailwindFunctions` in `.prettierrc`).

## Architecture

App Router project (`app/`), React Server Components enabled (`rsc: true`).

- **Styling**: Tailwind **v4** with no `tailwind.config` file — configuration lives
  in `app/globals.css` via `@import "tailwindcss"` + `@theme inline` and CSS
  variables (oklch color tokens, `.dark` variant). `shadcn/tailwind.css` and
  `tw-animate-css` are imported there too.
- **UI components**: shadcn/ui, **`radix-rhea` style**, icon library **hugeicons**
  (`@hugeicons/react`). Add components with `npx shadcn@latest add <name>` — they
  land in `components/ui/`. Import via the `@/components/ui/*` alias.
- **Path alias**: `@/*` maps to the repo root (`tsconfig.json`). Aliases configured
  in `components.json`: `@/components`, `@/lib`, `@/lib/utils`, `@/hooks`,
  `@/components/ui`.
- **`cn()`** (`lib/utils.ts`) is the `clsx` + `tailwind-merge` class-name helper used
  throughout.
- **Theming**: `next-themes` via `components/theme-provider.tsx`, wrapping the app in
  `app/layout.tsx`. Defaults to `system`. A built-in hotkey (`ThemeHotkey`) toggles
  light/dark on pressing **`d`** (ignored while typing in inputs/contenteditable).
- **Fonts**: Geist / Geist Mono loaded in `app/layout.tsx` as `--font-sans` /
  `--font-mono`.
