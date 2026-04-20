import { Command } from 'cmdk';
import {
  ArrowUpRight,
  BookOpen,
  FileText,
  Github,
  Home,
  Layers,
  Mail,
  Radio,
  Search,
  Sparkles,
  User,
  Wrench,
} from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';

type CmdItem = {
  id: string;
  label: string;
  hint?: string;
  icon: ReactNode;
  action: () => void;
  keywords?: string;
};

type CmdGroup = {
  heading: string;
  items: CmdItem[];
};

function navigateTo(href: string) {
  window.location.href = href;
}

function openExternal(href: string) {
  window.open(href, '_blank', 'noopener,noreferrer');
}

/**
 * Site-wide ⌘K / Ctrl+K palette. Mounted once in BaseLayout with client:load
 * so the listener is active on every page regardless of View Transitions.
 */
export default function CommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    // Event delegation: any element with [data-cmdk-trigger] opens the palette.
    // Delegating at document lets static Astro components trigger without scripts,
    // and survives View Transition navigations because this island is transition:persist-ed.
    function onDocClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      if (target?.closest('[data-cmdk-trigger]')) {
        e.preventDefault();
        setOpen(true);
      }
    }
    document.addEventListener('keydown', onKey);
    document.addEventListener('click', onDocClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('click', onDocClick);
    };
  }, []);

  function run(fn: () => void) {
    setOpen(false);
    // let the exit animation begin before triggering navigation
    setTimeout(fn, 30);
  }

  const groups: CmdGroup[] = [
    {
      heading: 'Actions',
      items: [
        {
          id: 'ai-ask',
          label: 'Ask anything (AI)',
          hint: 'demo corpus',
          icon: <Sparkles size={16} />,
          action: () => window.dispatchEvent(new CustomEvent('silucor:open-ask')),
          keywords: 'ai chat question help',
        },
      ],
    },
    {
      heading: 'Navigation',
      items: [
        { id: 'home', label: 'Home', hint: '/', icon: <Home size={16} />, action: () => navigateTo('/') },
        { id: 'about', label: 'About', hint: '/about', icon: <User size={16} />, action: () => navigateTo('/about') },
        { id: 'projects', label: 'Projects', hint: '/projects', icon: <Layers size={16} />, action: () => navigateTo('/projects') },
        { id: 'blog', label: 'Blog', hint: '/blog', icon: <BookOpen size={16} />, action: () => navigateTo('/blog') },
        { id: 'now', label: 'Now', hint: '/now', icon: <FileText size={16} />, action: () => navigateTo('/now') },
        { id: 'uses', label: 'Uses', hint: '/uses', icon: <Wrench size={16} />, action: () => navigateTo('/uses') },
      ],
    },
    {
      heading: 'Links',
      items: [
        {
          id: 'github',
          label: 'GitHub profile',
          hint: 'external',
          icon: <Github size={16} />,
          action: () => openExternal('https://github.com/octocat'),
          keywords: 'code source',
        },
        {
          id: 'email',
          label: 'Send an email',
          hint: 'mailto:',
          icon: <Mail size={16} />,
          action: () => navigateTo('mailto:hello@example.com'),
          keywords: 'contact',
        },
        {
          id: 'rss',
          label: 'RSS feed',
          hint: '/rss.xml',
          icon: <Radio size={16} />,
          action: () => navigateTo('/rss.xml'),
          keywords: 'subscribe feed',
        },
      ],
    },
  ];

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Command palette"
      className="cmdk-dialog"
      overlayClassName="cmdk-overlay"
      contentClassName="cmdk-content"
    >
      <div className="flex items-center gap-3 border-b border-[color:var(--color-outline-variant)] px-4">
        <Search size={16} className="shrink-0 text-[color:var(--color-outline)]" />
        <Command.Input
          placeholder="Type a command or search..."
          className="h-12 w-full bg-transparent text-sm text-[color:var(--color-on-surface)] placeholder:text-[color:var(--color-outline)] focus:outline-none"
        />
        <kbd className="hidden shrink-0 rounded border border-[color:var(--color-outline-variant)] bg-[color:var(--color-surface-container)] px-1.5 py-0.5 font-mono text-[10px] text-[color:var(--color-on-surface-variant)] sm:inline">
          esc
        </kbd>
      </div>

      <Command.List className="max-h-[60vh] overflow-y-auto p-2">
        <Command.Empty className="px-3 py-6 text-center text-sm text-[color:var(--color-on-surface-variant)]">
          No results.
        </Command.Empty>

        {groups.map((g) => (
          <Command.Group
            key={g.heading}
            heading={g.heading}
            className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-[color:var(--color-on-surface-variant)] [&_[cmdk-group-heading]]:uppercase"
          >
            {g.items.map((it) => (
              <Command.Item
                key={it.id}
                value={`${it.label} ${it.keywords ?? ''} ${it.hint ?? ''}`}
                onSelect={() => run(it.action)}
                className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-[color:var(--color-on-surface)] aria-selected:bg-[color:color-mix(in_oklab,var(--color-primary)_14%,transparent)] aria-selected:text-[color:var(--color-on-surface)]"
              >
                <span className="text-[color:var(--color-on-surface-variant)]">{it.icon}</span>
                <span className="flex-1 truncate">{it.label}</span>
                {it.hint && (
                  <span className="shrink-0 font-mono text-[10px] text-[color:var(--color-outline)]">
                    {it.hint}
                  </span>
                )}
                <ArrowUpRight size={12} className="shrink-0 text-[color:var(--color-outline)] opacity-0 aria-selected:opacity-100" />
              </Command.Item>
            ))}
          </Command.Group>
        ))}
      </Command.List>
    </Command.Dialog>
  );
}
