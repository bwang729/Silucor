# Silucor Web · 烁芯个人站

Personal site of **Silucor / 烁芯科技** — a terminal-aesthetic, performance-first
engineer site. Built with Astro 5 islands, React 19, Tailwind CSS v4,
Cloudflare Pages deployable.

## Status

W1 skeleton — placeholder content, no real personal information.
Real data is filled into `src/data/profile.private.ts` (gitignored) just before
the public launch.

## Stack

- **Astro 5** (zero-JS by default, islands for interactivity)
- **React 19** (interactive islands only)
- **Tailwind CSS v4** with OKLCH color space, native `@theme`
- **MDX** for content, Zod-typed Content Collections
- **Biome** for lint + format
- **TypeScript strict**

## Themes

Three terminal palettes, switchable at runtime:

| Theme         | Vibe                                  |
| ------------- | ------------------------------------- |
| `amber`       | IBM 3270 / VT100 amber phosphor       |
| `phosphor`    | Classic green CRT                     |
| `paper`       | Reverse — light "printout" mode       |

Set via `data-theme` on `<html>`. Persisted in `localStorage`.

## Run

```bash
npm install
npm run dev          # http://localhost:4321
npm run build
npm run preview
```

If you have `pnpm` (recommended):

```bash
pnpm install
pnpm dev
```

## Layout

```
src/
├── data/profile.ts          # all personal-info placeholders (single source)
├── content/                 # MDX content collections
│   ├── blog/(en|zh)/
│   ├── projects/
│   └── notes/
├── layouts/
│   ├── BaseLayout.astro
│   └── PageLayout.astro
├── components/
│   ├── static/              # pure Astro
│   └── island/              # React, hydrated
├── pages/                   # routes
├── styles/globals.css       # Tailwind v4 + Terminal tokens
└── lib/                     # helpers
```

## Privacy guardrails (enforced during W1-W6)

- No real name, email, phone, address, GitHub, LinkedIn, employer, or project
  client name in any committed file.
- All personal fields read from `src/data/profile.ts` (placeholders) or
  `src/data/profile.private.ts` (gitignored, fill at launch only).
- Repo stays **private on GitHub** until launch.
- Configure git locally with a noreply email before first commit:
  ```bash
  git config user.email "silucor@users.noreply.github.com"
  git config user.name  "silucor"
  ```

## Deploy

Cloudflare Pages:

1. Build command: `npm run build`
2. Output dir: `dist`
3. Custom domain (dev): `web.cbkeydemo.top` → CNAME to `<project>.pages.dev`
4. Custom domain (prod, later): `silucor.com` + `silucor.dev`

## License

UNLICENSED. All rights reserved (during W1; reconsider at launch).
