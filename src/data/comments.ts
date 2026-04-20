/**
 * Giscus comments configuration.
 *
 * Phase rules:
 *   • W1-W6 (development): `enabled: false`. The blog post template shows a
 *     pre-launch placeholder card instead of the giscus widget.
 *   • Launch: create the GitHub repo with Discussions enabled, run the giscus
 *     config wizard at https://giscus.app, fill in the four IDs below, then
 *     flip `enabled` to true. No component changes needed.
 *
 * Repo/category IDs here are intentionally placeholders. Never leave production
 * IDs pointing at a repo you don't control — anyone can post there.
 */

export type GiscusConfig = {
  enabled: boolean;
  repo: `${string}/${string}`;
  repoId: string;
  category: string;
  categoryId: string;
  mapping: 'pathname' | 'url' | 'title' | 'og:title' | 'specific' | 'number';
  reactionsEnabled: '0' | '1';
  emitMetadata: '0' | '1';
  inputPosition: 'top' | 'bottom';
  theme: string;
  loading: 'lazy' | 'eager';
};

export const comments: GiscusConfig = {
  enabled: false,
  repo: 'silucor/silucor-web',
  repoId: 'R_PLACEHOLDER',
  category: 'Blog comments',
  categoryId: 'DIC_PLACEHOLDER',
  mapping: 'pathname',
  reactionsEnabled: '1',
  emitMetadata: '0',
  inputPosition: 'bottom',
  theme: 'noborder_dark',
  loading: 'lazy',
};
