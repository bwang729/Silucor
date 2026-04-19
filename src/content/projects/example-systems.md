---
title: 'Multi-party Signer · 2-of-3 Wallet'
summary: 'A 3-party MPC wallet where one party lives on a Cortex-M smart card, one on the phone, and one in the cloud. No single node ever holds the whole key.'
role: 'Systems · Protocol · Firmware'
period: '2024 — present'
stack: ['Rust', 'C', 'UniFFI', 'BLE', 'Cortex-M', 'gRPC']
link: '#'
featured: true
order: 10
canvas: 'mpc-3party'
---

## Overview

A threshold-ECDSA wallet split across three parties. **P1** is an embedded
smart card running Rust on a Cortex-M. **P2** is a cloud worker exposing a
small gRPC surface. **P3** is a mobile app (Flutter + a Kotlin Multiplatform
SDK) that brokers between the two. Signing needs 2 of the 3 to be online;
the card is tamper-resistant and can lock itself offline at will.

The architecture canvas above maps the shape. The short version: `mpc-core`
is a single Rust crate linked two different ways — UniFFI on the phone,
hand-written C FFI on the card — and every message on the wire is a typed
variant carried over bincode.

## What mattered

- **One trigger authority.** Mobile is the only side that initiates presign
  or sign. The card reacts. Pool-state sync was the single largest source
  of integration bugs before we made this rule non-negotiable.
- **Append on phone, obliterate on card.** The phone keeps a CONSUMED row
  for every presign it ever burned; the card holds at most one live
  presign per group. Either side alone would be wrong — together they
  self-heal across BLE drops.
- **The shared crate stays pure.** `mpc-core` has no `std`, no
  `tokio`, no global state. It compiles to `riscv32imac-unknown-xous-elf`
  for research, `thumbv7em-none-eabihf` for the card, and
  `aarch64-linux-android` for the phone.

## Cut / deferred

- No N-of-M generalisation yet. The cryptography is ready; the firmware
  storage model isn't.
- No cloud-initiated recovery from the card's perspective. The card will
  only talk to P3; P2 is reachable only via the phone as a relay.

## What would change

The 2025 redesign moved presign sync from a timer-based refill to
event-triggered refill. Earliest version of the code had four refill
paths and two race windows; the current version has one path and none.

If starting today, the first thing I'd draw on the whiteboard is the
state machine on the **phone** side — not the card. The card is the
constrained node, but the phone's pool is where all the divergence
bugs came from.
