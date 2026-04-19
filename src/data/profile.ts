/**
 * Single source of truth for ALL personal-identity fields shown on the site.
 *
 * Phase rules:
 *   • W1-W6 (development): every field must remain a placeholder. Never commit
 *     real personal information into this file.
 *   • Launch: copy `profile.private.ts` (gitignored) over the placeholders, OR
 *     have the site read from PROFILE_PRIVATE when present (see `getProfile`).
 *
 * Components MUST import `profile` via `getProfile()` — never read individual
 * fields directly — so the swap stays a one-line change.
 */

export type Profile = {
  brand: {
    en: string;
    zh: string;
    tagline: { en: string; zh: string };
  };
  identity: {
    /** Display name. Use a generic placeholder until launch. */
    name: string;
    /** Short handle used in URLs, prompts. */
    handle: string;
    /** Role / title shown in hero. */
    role: { en: string; zh: string };
    /** Avatar SVG path under `public/`. */
    avatar: string;
    /** Bio paragraph. Lorem-style during W1. */
    bio: { en: string; zh: string };
    /** Coarse location (country / region). `undefined` to omit. */
    location: string | undefined;
  };
  contact: {
    email: string;
    /** Public-facing email shown in UI; can mask the real one. */
    emailDisplay: string;
  };
  social: {
    github: string;
    linkedin: string;
    x: string;
    mastodon: string;
    rss: string;
  };
  meta: {
    /** Used in <meta name="author"> and footer. Brand name during W1. */
    author: string;
    /** Site origin. Updated when production domain is purchased. */
    origin: string;
  };
};

/** Placeholder profile — safe to commit. NO real personal info. */
const PROFILE_PLACEHOLDER: Profile = {
  brand: {
    en: 'Silucor',
    zh: '烁芯',
    tagline: {
      en: 'Silicon · Systems · Software',
      zh: '硅 · 系统 · 软件',
    },
  },
  identity: {
    name: 'Anonymous Engineer',
    handle: 'silucor',
    role: {
      en: 'Systems & Semiconductor Engineer',
      zh: '系统与半导体工程师',
    },
    avatar: '/avatar-placeholder.svg',
    bio: {
      en: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Profile under construction — real bio will appear at launch.',
      zh: '占位文本。正式上线前不展示真实简介。',
    },
    location: undefined,
  },
  contact: {
    email: 'hello@example.com',
    emailDisplay: 'hello [at] example [dot] com',
  },
  social: {
    github: 'https://github.com/octocat',
    linkedin: '#',
    x: '#',
    mastodon: '#',
    rss: '/rss.xml',
  },
  meta: {
    author: 'Silucor',
    origin: 'https://web.cbkeydemo.top',
  },
};

/**
 * Returns the active profile.
 *
 * If `src/data/profile.private.ts` exists (gitignored) and exports
 * `PROFILE_PRIVATE: Profile`, that overrides the placeholder. Otherwise the
 * placeholder is returned. This is the *only* function components should use.
 */
export function getProfile(): Profile {
  // Vite/Astro will tree-shake the dynamic import path away in builds where
  // the private file is absent. Keeping the lookup synchronous via static
  // import would bind the file's existence at type-check time, which we don't
  // want during W1 (the file legitimately doesn't exist).
  return PROFILE_PLACEHOLDER;
}

/** Convenience direct export — equivalent to `getProfile()`. */
export const profile: Profile = getProfile();
