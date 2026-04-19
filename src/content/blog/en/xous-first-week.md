---
title: 'A first week with Xous: the OS where everything is a message'
description: 'Xous is a microkernel written in Rust for devices that refuse to trust you. Coming from Linux embedded work, the biggest adjustment is not no_std — it is that there is no API except IPC.'
publishedAt: 2026-04-05
tags: ['xous', 'rust', 'rtos', 'security', 'ipc']
lang: 'en'
draft: false
---

I spent the last week with [Xous](https://github.com/betrusted-io/xous-core),
the microkernel Andrew Huang's team built for the Precursor wallet and now
the Betrusted project. The pitch is familiar — small kernel, servers as
processes, Rust all the way down — but the feel of actually writing code
against it is not.

What makes Xous interesting is not that it is `no_std`. Plenty of RTOSes
are. What makes it interesting is that **there is no library API** in the
traditional sense. There is the kernel, and then there is a set of
servers, and the only way to talk to a server is by sending it a message.
Your "filesystem", your "RNG", your "display" — all of them are processes
you open a connection to. It is plan9 dressed up as an embedded OS, and it
changes how you write every line of code.

## Getting past the first "where's the SDK"

There isn't one. There's a workspace, a target triple, and
[Renode](https://renode.io) for emulation.

```sh title="bootstrap a dev environment"
rustup target add riscv32imac-unknown-xous-elf
git clone https://github.com/betrusted-io/xous-core
cd xous-core
cargo xtask run                 # builds everything, boots Renode
```

The first time this works it feels anticlimactic — a monochrome 336×536
frame pops up in Renode, a `shellchat` prompt, and that's it. You are
looking at a multi-process system running on a simulated RISC-V CPU on
your laptop.

## The programming model: CID, SID, and four message shapes

Every server has a **Server ID** (SID): a 128-bit random identifier,
never reused. Clients don't open servers by name — they go through a
registry server called `xous-name-server` that holds a table of
`"name" → SID`. Once you have the SID, the kernel hands you a
**Connection ID** (CID), which is cheap (a u32) and local to your
process.

Once you have a CID, four message shapes cover everything:

```text title="IPC primitives"
┌───────────────────┬──────────┬──────────────────────────────────────┐
│ shape             │ blocking │ payload                              │
├───────────────────┼──────────┼──────────────────────────────────────┤
│ Scalar            │ no       │ up to 4 u32s, register-only          │
│ BlockingScalar    │ yes      │ up to 4 u32s in, up to 2 u32s back   │
│ Memory            │ no       │ one or more pages, ownership moved   │
│ MutableBorrow     │ yes      │ a page lent read+write, returned     │
└───────────────────┴──────────┴──────────────────────────────────────┘
```

That table is the whole calling convention. Once you internalise it,
you can read any server's opcode enum and know the cost of calling it.

## The trivial echo server

Here is a complete echo server. Not a sketch — a complete one.

```rust title="services/echo/src/main.rs"
#![no_std]
#![no_main]

use num_traits::FromPrimitive;
use xous::{msg_scalar_unpack, send_message, Message};
use xous_ipc::Buffer;

#[derive(num_derive::FromPrimitive, num_derive::ToPrimitive)]
enum Op {
    Say = 0,    // memory msg: str in, str out
    Quit = 1,   // scalar msg, no reply
}

#[xous::xous_main]
fn main() -> ! {
    let sid = xous_names::register_name("echo", None).unwrap();
    loop {
        let msg = xous::receive_message(sid).unwrap();
        match FromPrimitive::from_usize(msg.body.id()) {
            Some(Op::Say) => {
                let mut buf = unsafe {
                    Buffer::from_memory_message_mut(msg.body.memory_message_mut().unwrap())
                };
                let s: &str = buf.to_original().unwrap();
                buf.replace(format!("echo: {s}")).unwrap();
            }
            Some(Op::Quit) => break,
            _ => { /* ignore unknown */ }
        }
    }
    xous::terminate_process(0);
}
```

A few things stand out immediately:

- **The opcode is a number on the wire.** `Op::Say as usize` is what the
  client sends. Your discriminants are your ABI — add a variant in the
  middle and you break every binary in the system. Append-only enums are
  the convention.
- **There is no `async`.** `receive_message` blocks the server thread. You
  get concurrency by spawning more servers, not by state machines.
- **Memory messages carry ownership of pages.** `Buffer::from_memory_message`
  gives you a zero-copy view into the page the client lent you. When the
  handler returns, the page goes back. No lifetimes in your signatures,
  but the safety is enforced by the kernel.

## The client looks like a library call

From the caller's side it reads like any Rust API, because someone wrote
a thin wrapper around the raw IPC:

```rust title="echo-api/src/lib.rs — the part your code sees"
pub struct Echo(xous::CID);

impl Echo {
    pub fn new() -> xous::Result<Self> {
        let cid = xous_names::request_connection("echo")?;
        Ok(Echo(cid))
    }

    pub fn say(&self, s: &str) -> xous::Result<String> {
        let mut buf = xous_ipc::Buffer::from_slice(s.as_bytes());
        buf.lend_mut(self.0, Op::Say as u32)?;
        Ok(String::from_utf8(buf.as_flat::<Vec<u8>, _>()?.to_vec())?)
    }
}
```

Nothing unusual on the surface. Underneath, `lend_mut` marks one page of
your address space as lent, the kernel remaps it into the server's space,
the server writes back, the page comes home. You paid one syscall and
one page remap to move a variable-size blob — no allocator shuffling on
the hot path.

## What changed in how I wrote code

Two habits formed in the first few days:

**1. Stop writing types that span server boundaries.** The temptation is
to define `struct Config { ... }` in a shared crate, serialize it, ship
it as a memory message. It works. It also means a version bump to that
crate is an implicit bump to every server that links it. Instead:
version your opcodes, version your payload shapes, and keep shared
types small and boring (plain byte arrays, fixed-size tuples).

**2. Think about failure modes as "no server".** On Linux you worry
about a syscall returning `EAGAIN`. On Xous the analogous failure is
"the server has no connection slots left" or "the server hasn't
booted yet". Your client code needs to handle
`xous::Error::ServerNotFound` and `Error::OutOfMemory` as routine,
not exceptional:

```rust title="real retry loop"
let echo = loop {
    match Echo::new() {
        Ok(e) => break e,
        Err(xous::Error::ServerNotFound) => {
            xous::yield_slice();   // cheap yield, no ticker
            continue;
        }
        Err(e) => return Err(e),
    }
};
```

That `yield_slice` is not a sleep. There is no `sleep(ms)` on boot
because there is no time server yet. You yield to the scheduler and
hope the dependency has come up by the time you run again.

## The dev loop is surprisingly tight

```sh title="edit → boot → test"
cargo xtask run                   # full boot in Renode, ~25s cold
cargo xtask run --app echo        # rebuild just your app, reuse image
```

Renode runs much faster than a real Precursor, of course, but more
importantly it doesn't lie. Because the whole system lives in Rust and
the kernel is tiny, the emulated boot matches the hardware boot so
closely that I ran into exactly zero "works in sim, fails on device"
bugs in this first week. That is rare in embedded.

## What this is actually for

Xous is niche on purpose. It targets devices where you want to open
every running service and read it end-to-end before trusting it — secure
wallets, auditable enclaves, research hardware. If your project's
threat model includes your own OS vendor, the calculus starts to make
sense. If it doesn't, Embassy, RTIC, FreeRTOS, or Zephyr will ship you
a product faster.

The thing I didn't expect: after a week the forced message-passing
discipline made me want it on projects that don't need the security
story at all. A system where you cannot cheat around an API boundary
because **there is no API boundary, only messages** — that is a good
architecture even on a Linux box.

Next week: writing a simple key-value server that uses the TRNG service
for id generation, and the first real discovery that reconnection
semantics on a microkernel are *very* different from sockets.
