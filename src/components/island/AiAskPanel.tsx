import { useCallback, useEffect, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Sparkles, Send, X, Info } from 'lucide-react';
import { AI_CORPUS, retrieve, type CorpusEntry } from '~/data/ai-corpus';

type Locale = 'en' | 'zh';

type Turn =
  | { id: string; role: 'user'; text: string }
  | { id: string; role: 'bot'; text: string; entryId: string | null };

const ui = {
  en: {
    trigger: 'Ask anything',
    title: 'Ask anything',
    subtitle: 'Static demo · answers from a hand-written corpus',
    disclaimer:
      'No API calls — this keyword-matches a local corpus. Real Claude will plug in post-launch.',
    greeting: "Hi. Try one of the prompts below — or ask something technical in your own words.",
    inputPlaceholder: 'Type your question…',
    send: 'Send',
    notFound:
      "That's outside what this static demo knows. The corpus covers Silucor, MPC presign sync, Rust/C tradeoffs, Astro stack choices, Xous, FFI, hiring basics, and contact. Try rephrasing?",
    suggested: 'Try one of these',
    close: 'Close',
  },
  zh: {
    trigger: 'AI 问答',
    title: 'AI 问答',
    subtitle: '静态 Demo · 来源是一份手写语料',
    disclaimer:
      '尚未接入真实模型——目前仅对一份本地语料做关键词匹配，上线后会接 Claude。',
    greeting: '你好。试一下下方的示例，或者用自己的话问一个技术问题。',
    inputPlaceholder: '输入你的问题…',
    send: '发送',
    notFound:
      '这个问题超出了 Demo 语料覆盖范围。目前能答的主题：烁芯 / MPC presign 同步 / Rust 与 C 取舍 / 为什么选 Astro / Xous / FFI / 合作机会 / 联系方式。换个说法？',
    suggested: '示例问题',
    close: '关闭',
  },
} as const;

function typewriter(text: string, onTick: (partial: string) => void, done: () => void) {
  let i = 0;
  const step = Math.max(1, Math.floor(text.length / 80));
  const handle = window.setInterval(() => {
    i = Math.min(text.length, i + step);
    onTick(text.slice(0, i));
    if (i >= text.length) {
      window.clearInterval(handle);
      done();
    }
  }, 16);
  return () => window.clearInterval(handle);
}

function prefersReducedMotion() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default function AiAskPanel({ locale = 'en' }: { locale?: Locale }) {
  const t = ui[locale];
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [turns, setTurns] = useState<Turn[]>([]);
  const [busy, setBusy] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const el = scrollerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [turns, open]);

  useEffect(() => {
    if (open) {
      const id = window.setTimeout(() => inputRef.current?.focus(), 30);
      return () => window.clearTimeout(id);
    }
  }, [open]);

  const answerFor = useCallback(
    (query: string): { text: string; entryId: string | null } => {
      const hit = retrieve(query);
      if (!hit) return { text: t.notFound, entryId: null };
      return { text: hit.entry.answer[locale], entryId: hit.entry.id };
    },
    [locale, t.notFound],
  );

  const pushReply = useCallback(
    (text: string, entryId: string | null) => {
      const id = `bot-${Date.now()}`;
      setTurns((prev) => [...prev, { id, role: 'bot', text: '', entryId }]);
      if (prefersReducedMotion()) {
        setTurns((prev) =>
          prev.map((turn) => (turn.id === id && turn.role === 'bot' ? { ...turn, text } : turn)),
        );
        setBusy(false);
        return;
      }
      setBusy(true);
      typewriter(
        text,
        (partial) => {
          setTurns((prev) =>
            prev.map((turn) =>
              turn.id === id && turn.role === 'bot' ? { ...turn, text: partial } : turn,
            ),
          );
        },
        () => setBusy(false),
      );
    },
    [],
  );

  const submit = useCallback(
    (raw: string) => {
      const query = raw.trim();
      if (!query || busy) return;
      setInput('');
      setTurns((prev) => [...prev, { id: `u-${Date.now()}`, role: 'user', text: query }]);
      const reply = answerFor(query);
      window.setTimeout(() => pushReply(reply.text, reply.entryId), 200);
    },
    [answerFor, busy, pushReply],
  );

  const pickPrompt = useCallback((entry: CorpusEntry) => submit(entry.prompt[locale]), [locale, submit]);

  useEffect(() => {
    const onOpenEvent = () => setOpen(true);
    window.addEventListener('silucor:open-ask', onOpenEvent);
    return () => window.removeEventListener('silucor:open-ask', onOpenEvent);
  }, []);

  const suggestions = AI_CORPUS.slice(0, 5);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          data-ai-ask-trigger
          className="inline-flex items-center gap-1.5 rounded-full border border-outline-variant bg-surface-container-low/60 px-3 py-1.5 text-xs font-medium text-on-surface-variant transition hover:border-[color:color-mix(in_oklab,var(--color-tertiary)_40%,transparent)] hover:text-on-surface"
        >
          <Sparkles size={12} className="text-tertiary" />
          <span>{t.trigger}</span>
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="ai-ask-overlay" />
        <Dialog.Content className="ai-ask-panel" aria-describedby={undefined}>
          <header className="ai-ask-header">
            <div className="flex items-center gap-2">
              <span className="ai-ask-logo" aria-hidden="true">
                <Sparkles size={14} />
              </span>
              <div>
                <Dialog.Title className="ai-ask-title">{t.title}</Dialog.Title>
                <p className="ai-ask-subtitle">{t.subtitle}</p>
              </div>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                className="ai-ask-icon-btn"
                aria-label={t.close}
              >
                <X size={14} />
              </button>
            </Dialog.Close>
          </header>

          <div className="ai-ask-disclaimer">
            <Info size={12} />
            <span>{t.disclaimer}</span>
          </div>

          <div className="ai-ask-scroll" ref={scrollerRef}>
            <div className="ai-ask-turn ai-ask-turn--bot">
              <p>{t.greeting}</p>
            </div>

            {turns.map((turn) => (
              <div
                key={turn.id}
                className={
                  turn.role === 'user'
                    ? 'ai-ask-turn ai-ask-turn--user'
                    : 'ai-ask-turn ai-ask-turn--bot'
                }
              >
                <p>{turn.text}</p>
              </div>
            ))}

            {turns.length === 0 && (
              <div className="ai-ask-suggestions">
                <p className="ai-ask-suggestions-label">{t.suggested}</p>
                <div className="flex flex-wrap gap-1.5">
                  {suggestions.map((entry) => (
                    <button
                      key={entry.id}
                      type="button"
                      className="ai-ask-chip"
                      onClick={() => pickPrompt(entry)}
                    >
                      {entry.prompt[locale]}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <form
            className="ai-ask-form"
            onSubmit={(e) => {
              e.preventDefault();
              submit(input);
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.inputPlaceholder}
              className="ai-ask-input"
              disabled={busy}
              autoComplete="off"
            />
            <button
              type="submit"
              className="ai-ask-send"
              aria-label={t.send}
              disabled={busy || input.trim().length === 0}
            >
              <Send size={14} />
            </button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
