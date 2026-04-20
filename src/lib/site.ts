/**
 * Static site-level constants. Anything not personal goes here.
 */

import { m } from '~/paraglide/messages.js';
import type { Locale } from '~/i18n/locale';
import { localizePath } from '~/i18n/locale';

export type NavLink = { href: string; label: string };

export function getNavLinks(locale: Locale): readonly NavLink[] {
  return [
    { href: localizePath('/', locale), label: m.nav_home({}, { locale }) },
    { href: localizePath('/about', locale), label: m.nav_about({}, { locale }) },
    { href: localizePath('/projects', locale), label: m.nav_projects({}, { locale }) },
    { href: localizePath('/blog', locale), label: m.nav_blog({}, { locale }) },
    { href: localizePath('/uses', locale), label: m.nav_uses({}, { locale }) },
    { href: localizePath('/now', locale), label: m.nav_now({}, { locale }) },
  ];
}

export function isCurrentPath(pathname: string, href: string): boolean {
  const norm = (s: string) => s.replace(/\/+$/, '') || '/';
  const p = norm(pathname);
  const h = norm(href);
  if (h === '/') return p === '/';
  return p === h || p.startsWith(`${h}/`);
}
