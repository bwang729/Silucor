import * as Tooltip from '@radix-ui/react-tooltip';
import { Github, Linkedin, Mail, type LucideIcon } from 'lucide-react';
import { profile } from '~/data/profile';

type Link = { href: string; label: string; icon: LucideIcon; external: boolean };

const links: Link[] = [
  profile.social.github && {
    href: profile.social.github,
    label: 'GitHub',
    icon: Github,
    external: true,
  },
  profile.social.linkedin &&
    profile.social.linkedin !== '#' && {
      href: profile.social.linkedin,
      label: 'LinkedIn',
      icon: Linkedin,
      external: true,
    },
  profile.contact.email && {
    href: `mailto:${profile.contact.email}`,
    label: 'Email',
    icon: Mail,
    external: false,
  },
].filter(Boolean) as Link[];

export default function SocialLinks() {
  return (
    <Tooltip.Provider delayDuration={150} skipDelayDuration={300}>
      {links.map(({ href, label, icon: Icon, external }) => (
        <Tooltip.Root key={label}>
          <Tooltip.Trigger asChild>
            <a
              href={href}
              aria-label={label}
              className="text-on-surface-variant transition-colors hover:text-on-surface"
              target={external ? '_blank' : undefined}
              rel={external ? 'noopener noreferrer' : undefined}
            >
              <Icon size={20} />
            </a>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content className="tooltip-content" sideOffset={8}>
              {label}
              <Tooltip.Arrow className="tooltip-arrow" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      ))}
    </Tooltip.Provider>
  );
}
