import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import expressiveCode from 'astro-expressive-code';
import { paraglideVitePlugin } from '@inlang/paraglide-js';

export default defineConfig({
  site: 'https://web.cbkeydemo.top',
  trailingSlash: 'never',
  prefetch: { prefetchAll: true, defaultStrategy: 'viewport' },
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh'],
    routing: { prefixDefaultLocale: false, redirectToDefaultLocale: false },
  },
  integrations: [
    expressiveCode({
      themes: ['github-dark-default'],
      styleOverrides: {
        borderRadius: '0.75rem',
        borderColor: 'var(--color-outline-variant)',
        codeFontFamily:
          "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
        codeFontSize: '0.85rem',
        codeLineHeight: '1.65',
        frames: {
          shadowColor: 'color-mix(in oklab, black 35%, transparent)',
          editorTabBarBackground:
            'color-mix(in oklab, var(--color-surface-container-low) 92%, transparent)',
          editorActiveTabBackground: 'var(--color-surface-container-low)',
          editorActiveTabForeground: 'var(--color-on-surface)',
          terminalTitlebarBackground:
            'color-mix(in oklab, var(--color-surface-container-low) 92%, transparent)',
          terminalTitlebarForeground: 'var(--color-on-surface-variant)',
          terminalBackground: 'var(--color-surface-container-low)',
        },
      },
      defaultProps: { wrap: true },
    }),
    mdx(),
    react(),
    sitemap(),
  ],
  vite: {
    plugins: [
      tailwindcss(),
      paraglideVitePlugin({
        project: './project.inlang',
        outdir: './src/paraglide',
        strategy: ['globalVariable', 'baseLocale'],
      }),
    ],
  },
  experimental: {
    clientPrerender: true,
  },
});
