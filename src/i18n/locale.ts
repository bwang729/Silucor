import { locales, baseLocale } from '~/paraglide/runtime.js';

export type Locale = (typeof locales)[number];

export function resolveLocale(pathname: string): Locale {
  const normalized = pathname.replace(/\/+$/, '');
  const segments = normalized.split('/').filter(Boolean);
  const head = segments[0];
  if (head && (locales as readonly string[]).includes(head)) {
    return head as Locale;
  }
  return baseLocale as Locale;
}

export function stripLocale(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length && (locales as readonly string[]).includes(segments[0])) {
    segments.shift();
  }
  return `/${segments.join('/')}`.replace(/\/$/, '') || '/';
}

export function localizePath(pathname: string, locale: Locale): string {
  const base = stripLocale(pathname);
  if (locale === baseLocale) return base === '' ? '/' : base;
  return base === '/' ? `/${locale}` : `/${locale}${base}`;
}
