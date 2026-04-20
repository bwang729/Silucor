/**
 * Local knowledge base for the "Ask anything" demo overlay.
 *
 * Phase rules:
 *   • Development / launch: only this file. No Claude API calls, no real
 *     personal data. Topics stay generic-technical so nothing here needs to
 *     be redacted before going public.
 *   • Post-launch: swap retrieval to Turso + sqlite-vec and call Claude via
 *     @ai-sdk/anthropic. This corpus stays as a fallback.
 *
 * Each entry pairs an English + Chinese answer so the same id is served in
 * the visitor's current locale.
 */

export type CorpusEntry = {
  id: string;
  /** Matching tokens (lowercase). Used for keyword overlap scoring. */
  keywords: string[];
  /** Example prompt shown in the suggested-questions panel. */
  prompt: { en: string; zh: string };
  /** The answer body. Markdown is NOT rendered — plain text only. */
  answer: { en: string; zh: string };
};

export const AI_CORPUS: CorpusEntry[] = [
  {
    id: 'what-is-silucor',
    keywords: ['silucor', '烁芯', 'brand', '品牌', 'who', '是谁', 'about'],
    prompt: { en: 'What is Silucor?', zh: '烁芯是什么？' },
    answer: {
      en: 'Silucor / 烁芯 is a personal engineering brand focused on systems, semiconductors, and low-level software. "Silucor" blends silicon and core; "烁" means to shine and "芯" means chip. Short answer: hardware-adjacent software.',
      zh: 'Silucor / 烁芯 是一个个人工程品牌，聚焦系统、半导体与底层软件。英文名取自 silicon + core；中文"烁"是光辉，"芯"是芯片。简单说：贴着硬件写软件。',
    },
  },
  {
    id: 'what-does-he-work-on',
    keywords: ['work', 'project', '项目', 'mpc', 'wallet', 'embed', '嵌入式', 'current', '现在'],
    prompt: { en: 'What kind of projects?', zh: '主要做什么项目？' },
    answer: {
      en: 'Mostly threshold signing protocols split across a smart card (Cortex-M, Rust), a mobile app (Kotlin Multiplatform + Flutter), and a cloud worker (Rust + gRPC). No single node ever holds the whole key. Side interests: RISC-V microkernels, embedded FFI, and compile-time i18n like this page uses.',
      zh: '主要是把门限签名协议拆到三方执行：智能卡（Cortex-M + Rust）、手机（Kotlin Multiplatform + Flutter）、云端（Rust + gRPC），任何一方都拿不到完整私钥。业余兴趣：RISC-V 微内核、嵌入式 FFI，以及像本站这样的编译期 i18n。',
    },
  },
  {
    id: 'rust-or-c',
    keywords: ['rust', 'c', 'language', '语言', 'prefer', 'choose', '选择'],
    prompt: { en: 'Rust or C?', zh: 'Rust 还是 C？' },
    answer: {
      en: "Both, and the choice is rarely ideological. On the Cortex-M smart card the hot paths stay in Rust because ownership kills whole classes of bugs; the BSP and interrupt glue stay in C because the vendor HAL is C and rewriting it buys nothing. The shared crypto crate compiles for RISC-V, ARM Cortex-M, and aarch64 Android — that only works because it has no std, no tokio, no globals.",
      zh: '都用。选择几乎不是立场问题。Cortex-M 智能卡上热路径用 Rust——所有权模型直接干掉一整类 bug；BSP 和中断胶水还是 C，因为厂家 HAL 就是 C，重写毫无收益。共享密码学 crate 同时编译到 RISC-V、ARM Cortex-M、aarch64 Android——能做到这一点的前提是：没有 std、没有 tokio、没有全局状态。',
    },
  },
  {
    id: 'mpc-presign',
    keywords: ['mpc', 'presign', 'threshold', '门限', '签名', 'ecdsa', 'sync', '同步'],
    prompt: { en: 'How does presign sync work?', zh: 'Presign 同步是怎么设计的？' },
    answer: {
      en: "Mobile is the only trigger authority for presign. It refills when the pool is empty after reconnect, after a signature consumes one, and right after initial reshare. The card stores at most one live presign per group and deletes it before writing a new one; the phone appends-only and uses FIFO consumption. Together they self-heal across BLE drops — neither side could do it alone.",
      zh: 'Mobile 是 presign 的唯一发起方：重连后 pool 空时补、签名消费后补、初次 reshare 后补。卡端每组最多一条活跃 presign，写新的之前先删旧的；手机端只追加不删除，按 FIFO 消费。两边配合就能在 BLE 掉线中自愈——任何一方单独都做不到。',
    },
  },
  {
    id: 'why-astro',
    keywords: ['astro', 'stack', 'site', 'next', 'why', '为什么', 'framework', '框架'],
    prompt: { en: 'Why Astro for this site?', zh: '这个站点为什么选 Astro？' },
    answer: {
      en: 'Zero JS by default, islands where I need React (command palette, WebGL hero, this chat), and content collections with Zod validation. Ships less than 40KB per page for text content. Next.js would have been fine too — the deciding factor was that 90% of this site is static prose, and Astro treats that as the happy path.',
      zh: '默认零 JS，只在需要处用 React 岛（命令面板、WebGL hero、这个对话窗），Content Collections 自带 Zod 校验。文本页面每页 JS 不到 40KB。Next.js 也能做，决定性差异在于：本站 90% 是静态散文，Astro 把这当主路径。',
    },
  },
  {
    id: 'xous-first-impression',
    keywords: ['xous', 'rtos', 'microkernel', '微内核', 'risc-v', 'betrusted', '第一周'],
    prompt: { en: 'Xous in one paragraph?', zh: 'Xous 一句话印象？' },
    answer: {
      en: "Everything is a message. Servers register under 128-bit names, clients connect by looking the name up, and IPC comes in four flavors (Scalar, BlockingScalar, Memory, MutableBorrow). After a week you stop writing callbacks and start writing request handlers — same shape as a small gRPC service but running on a microcontroller.",
      zh: '一切皆消息。Server 用 128 位名字注册，Client 按名查询连接，IPC 四种（Scalar/BlockingScalar/Memory/MutableBorrow）。写一周以后你会停止写 callback，开始写 request handler——形状和一个小 gRPC 服务几乎一样，只是跑在 MCU 上。',
    },
  },
  {
    id: 'ffi-two-targets',
    keywords: ['ffi', 'uniffi', 'cbindgen', 'rust', 'phone', 'card', '手机', '卡'],
    prompt: {
      en: 'One Rust crate, two FFIs — why?',
      zh: '一个 Rust crate 打两套 FFI，为什么？',
    },
    answer: {
      en: 'The phone needs rich Kotlin/Swift types, so UniFFI generates the binding and handles Result → exception mapping. The card has no allocator to spare and no exception model, so cbindgen emits a plain C header with flat error codes. Same source, two dialects — and crucially, no std, no tokio, no globals in the shared crate so both targets link cleanly.',
      zh: '手机要丰富的 Kotlin/Swift 类型，所以用 UniFFI 生成绑定，Result → 异常的映射也交给它。卡端没有多余的分配器、也没有异常模型，所以用 cbindgen 输出一份纯 C 头文件，扁平错误码。同一份源、两种方言——关键是共享 crate 里没有 std、没有 tokio、没有全局状态，两个目标才能干净链接。',
    },
  },
  {
    id: 'hire-available',
    keywords: ['hire', 'hiring', 'work', 'job', '合作', '招聘', '简历', 'resume', 'available'],
    prompt: { en: 'Are you open to work?', zh: '开放合作机会吗？' },
    answer: {
      en: 'The public answer lives on the contact page and changes. For concrete asks — embedded + cryptography, systems Rust, Linux drivers — email is the fastest route. Anything involving real clients or NDA material, please don\'t ask this bot; it only knows what\'s on this site.',
      zh: '最新答复在 Contact 页，会变。具体方向——嵌入式 + 密码学、系统级 Rust、Linux 驱动——发邮件最快。涉及客户信息或 NDA 的事情请不要问这个机器人，它只知道站上公开的内容。',
    },
  },
  {
    id: 'contact',
    keywords: ['contact', 'email', 'reach', '联系', '邮箱', 'social'],
    prompt: { en: 'How do I get in touch?', zh: '怎么联系？' },
    answer: {
      en: 'Email is on the About page footer. Social links are in the hero row on the homepage (GitHub / LinkedIn / email). No DMs on X — it\'s not checked.',
      zh: '邮箱在 About 页脚。首页 hero 那排有社交链接（GitHub / LinkedIn / 邮件）。X 不看私信。',
    },
  },
  {
    id: 'demo-disclaimer',
    keywords: ['demo', 'ai', 'claude', 'how', 'real', '真的', '模型'],
    prompt: { en: 'Is this actually an AI?', zh: '这真的是 AI 吗？' },
    answer: {
      en: 'Not yet. Right now this is a static keyword-match over a hand-written corpus — fast, honest, no API key on the wire. After launch the same UI will call Claude (via Vercel AI SDK) with a retrieval layer over the site content. The disclaimer chip in the header tells you which mode is active.',
      zh: '暂时不是。目前只是对一份手写语料做关键词匹配——快、诚实、线上不会漏 API key。正式上线后同一界面会接 Claude（Vercel AI SDK + 站内检索）。头部的标签会告诉你当前是哪种模式。',
    },
  },
];

const STOPWORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'of', 'to', 'in',
  'on', 'for', 'with', 'and', 'or', 'but', 'how', 'what', 'why', 'does', 'do',
  'did', 'you', 'your', 'i', 'me', 'my', 'this', 'that', 'it', 'its', 'can',
  '的', '了', '是', '在', '和', '与', '吗', '呢', '么',
]);

function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .split(/[\s,.;:!?"'()\[\]{}、。！？，；：""''（）【】]+/u)
    .filter((t) => t.length > 0 && !STOPWORDS.has(t));
}

export type RetrievalResult = {
  entry: CorpusEntry;
  score: number;
};

/**
 * Return the best-matching corpus entry and its raw overlap score (0..N).
 * Score 0 means nothing matched — caller should render a "not in my corpus"
 * fallback instead of the top entry.
 */
export function retrieve(query: string): RetrievalResult | null {
  const tokens = tokenize(query);
  if (tokens.length === 0) return null;

  let best: RetrievalResult | null = null;
  for (const entry of AI_CORPUS) {
    let score = 0;
    for (const t of tokens) {
      if (entry.keywords.includes(t)) score += 2;
      else if (entry.keywords.some((k) => k.includes(t) || t.includes(k))) score += 1;
    }
    if (score > 0 && (!best || score > best.score)) best = { entry, score };
  }
  return best;
}
