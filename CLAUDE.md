# DevStash

A developer knowledge hub for snippets, commands, prompts, notes, files, images, links and custom types.

## Context Files

Read the following to get the full context of the project:

- @context/project-overview.md
- @context/coding-standards.md
- @context/ai-interaction.md
- @context/current-feature.md

## Critical: Next.js version

This project runs **Next.js 16.2.6** with **React 19.2.4** — versions that post-date your training data and contain breaking changes. Before writing any Next.js-specific code, read the relevant guide in `node_modules/next/dist/docs/`. Heed deprecation notices.

## Commands

```bash
npm run dev      # start dev server
npm run build    # production build
npm run start    # serve production build
npm run lint     # ESLint
```

No test runner is configured yet.

## Stack

- **Next.js 16** App Router (`src/app/`)
- **React 19**
- **TypeScript 5**
- **Tailwind CSS 4** via `@tailwindcss/postcss` — configured in `postcss.config.mjs`, imported in `globals.css` with `@import "tailwindcss"`
- **Geist** (sans + mono) loaded via `next/font/google`, exposed as CSS variables `--font-geist-sans` / `--font-geist-mono`

## Project structure

```
src/app/
  layout.tsx   # root layout — sets fonts, metadata, and body wrapper
  page.tsx     # home route
  globals.css  # Tailwind import only; no custom styles
public/        # static assets (currently empty)
```

All routes live under `src/app/` following the App Router file-system convention.

## Neon Database

- **Default project:** `red-wildflower-76913259` (devstash)
- **Default branch:** `br-flat-sound-ap2xnqjb` (development)
- **Production branch:** `br-steep-wave-ap3blh8o` — NEVER use this unless explicitly told to

Always pass `projectId: red-wildflower-76913259` and `branchId: br-flat-sound-ap2xnqjb` to every Neon MCP tool call unless the user explicitly says "production". If the user says production, confirm before proceeding.
