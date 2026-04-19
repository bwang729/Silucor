/**
 * Static site-level constants. Anything not personal goes here.
 */

export const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/projects', label: 'Projects' },
  { href: '/blog', label: 'Blog' },
  { href: '/uses', label: 'Uses' },
  { href: '/now', label: 'Now' },
] as const;

export type NavLink = (typeof NAV_LINKS)[number];

export function isCurrentPath(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/' || pathname === '';
  return pathname === href || pathname.startsWith(`${href}/`);
}
