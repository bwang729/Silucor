---
title: 'hello, world'
description: 'First post on the new site — terminal aesthetic, Astro 5, Tailwind v4.'
publishedAt: 2026-04-19
tags: ['meta', 'site']
lang: 'en'
draft: false
---

```sh title="terminal"
$ echo "hello, world"
hello, world
```

This is a placeholder post used to verify the blog collection renders.
The real first post will land at launch.

## What lives here

- Notes on low-level systems work — kernel, drivers, firmware.
- Occasional deep-dives into semiconductor stacks.
- Build logs from side projects.

## Stack

- **Astro 5** with islands.
- **Tailwind CSS v4** (`@theme`, OKLCH).
- **MDX + Content Collections** with Zod schemas.
- **Cloudflare Pages** for delivery.

## Code samples (expressive-code demo)

Inline `const x = 1` stays teal. Block with file title + highlights:

```ts title="src/lib/greet.ts" {3} ins={5-6} del={4}
export function greet(name: string): string {
  const clean = name.trim();
  const label = clean.length > 0 ? clean : 'friend';
  return `hi, ${name}`;
  const prefix = 'hello';
  return `${prefix}, ${label}`;
}
```

Collapsed block with line numbers:

```rust title="bench.rs" showLineNumbers collapse={1-3, 10-12}
use std::time::Instant;

fn now() -> Instant { Instant::now() }

fn run() {
    let t = now();
    for i in 0..1_000_000 {
        std::hint::black_box(i * 2);
    }
    let dt = t.elapsed();
    println!("{:?}", dt);
}

fn main() { run() }
```
