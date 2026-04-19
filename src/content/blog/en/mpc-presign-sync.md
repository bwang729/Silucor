---
title: 'Designing presign sync for a 2-party MPC wallet'
description: 'Why the Mobile side uses append-only writes, why reconnection cannot blindly refill, and how the Active Card keeps exactly one presign per group.'
publishedAt: 2026-04-15
tags: ['mpc', 'embedded', 'ble', 'protocol']
lang: 'en'
draft: false
---

Presigning is the unglamorous half of a practical ECDSA MPC wallet. Signing is
where users see speed; presign is where you pay for it. In a 2-party split
where one party lives on a low-power embedded card and talks to the phone over
BLE, the interesting question is not *how to compute a presign* — the
cryptography is settled — but *when to trigger one, and how to keep both sides
in sync when the radio drops*.

Get that wrong and you ship a wallet that looks fine on a clean bench test and
then mysteriously fails the third signature in a flaky-reception e2e run.

## The three moments that must trigger a refill

Mobile is the sole authority for initiating a presign. Three, and only three,
moments warrant starting a round:

```text title="presign triggers (mobile-initiated)"
1. after an initial resharing completes     → seed the pool
2. after BLE reconnects AND pool is empty   → refill only if needed
3. after a signature consumes a presign     → opportunistic top-up
```

Everything else is a footgun. A timer-based refill, a "helpful" refill on app
foreground, a refill on wallet-select — they all look reasonable and they all
cause the same bug: the pool gets out of sync with the card.

## Why reconnect must not blindly refill

The mobile presign pool is an append-only SQLite table:

```kotlin title="cipher_presign rows (abridged)"
data class PresignRow(
  val id: UUID,              // PK — no (groupId, poolId) uniqueness
  val groupId: String,
  val createdAt: Instant,
  val status: Status,        // UNUSED | CONSUMED
)
```

Signatures pull the oldest `UNUSED` row (FIFO by `createdAt`). `CONSUMED` rows
stay in the table — we want the audit trail.

Now imagine a reconnect that blindly fires a fresh presign because "we might
as well have a warm pool":

```text title="reconnect-always-refill (the bug)"
state before reconnect:
  mobile pool:  [A(UNUSED)]
  card flash:   A
after reconnect, mobile triggers presign:
  card behaviour: delete A, store B
  mobile pool:  [A(UNUSED), B(UNUSED)]
next signature:
  mobile picks FIFO  →  A
  card has           →  B
  protocol aborts: presign mismatch
```

The fix is boring and correct: gate the refill on **pool emptiness**.

```kotlin title="PresignPoolMonitor.kt"
suspend fun onBleConnected(groupId: String) {
  if (pool.needsRefill(groupId)) {  // UNUSED count < 1
    presignProtocol.run(groupId)
  }
}
```

`needsRefill()` is load-bearing. Every time someone files an issue asking to
"remove the check because it feels redundant", the right answer is a link to
this page.

## Why the card deletes on every new presign

The card side is resource-constrained — one slot per group, flash-backed. When
a presign request comes in, it follows a dumb, safe rule:

```c title="mpcapp_v2.c — presign start handler"
if (mpc_storage_has_presign(group_id)) {
    mpc_storage_delete_presign(group_id);
}
mpc_session_presign_begin(group_id);
```

The card never accumulates stale presigns. "One live presign per group" is a
hardware invariant; everything else in the firmware can rely on it.

That invariant is exactly what makes mobile's `needsRefill` check safe. Card
deletes, mobile appends. If mobile appends too eagerly, card-deletes-to-append
creates the divergence above. If mobile appends only when its pool is empty,
both sides stay aligned.

## The resulting protocol, in five messages

With the triggering rules in place, the wire protocol over BLE collapses to
five typed messages per `presign → sign` pair:

```text title="2-party unified protocol"
┌──────────────┬──────────┬─────────────────────────┬────────────────────────┐
│ step         │ dir      │ type                    │ payload                │
├──────────────┼──────────┼─────────────────────────┼────────────────────────┤
│ presign R1   │ mob → ac │ TX25_UPRESIGN_START     │ (group_id in TssMsg)   │
│ presign R1'  │ ac → mob │ TX25_UPRESIGN_R1_HW     │ PresignRound1Msg       │
│ finalize     │ mob → ac │ TX25_UPRESIGN_R1_ONLINE │ PresignRound1Msg       │
│ sign         │ mob → ac │ TX25_USIGN_R1_ONLINE    │ SignRound1Msg + hash   │
│ sign'        │ ac → mob │ TX25_USIGN_HW           │ 65-byte signature      │
└──────────────┴──────────┴─────────────────────────┴────────────────────────┘
```

Every message is bincode-encoded at the TssMessage layer. The card does not
invent any of these flows — it only reacts to mobile-initiated starts.

## Recovery when the card reboots mid-session

BLE drops, the card boots from cold, flash holds the last-written presign.
Mobile reconnects and sees its own pool is non-empty. Result: mobile *does
not* trigger a new presign. Card's flash-resident presign matches the oldest
row in the mobile pool, the next signature consumes it, and the system
self-heals without any coordination message.

The thing that looked like a bug — mobile not immediately refilling on
reconnect — is the behaviour that lets recovery be trivial.

## Takeaways

- **Put the trigger authority on one side.** Both sides triggering presigns
  is a distributed-consensus problem disguised as a convenience feature.
- **Make storage append-only on the high-resource side.** CONSUMED rows are
  cheap and debugging gold.
- **Make the low-resource side obliterate on write.** Flash is expensive,
  correctness is cheaper than clever state management.
- **Gate refills on "do I actually need one?" not "can I?"**. An idle
  refill is always the wrong answer.

The full implementation sits in `PresignPoolMonitor.kt` on mobile and
`mpcapp_v2.c` on the card. Both files fit on a laptop screen. That is the
goal — if the sync logic doesn't fit on one screen per side, the design is
still hiding complexity somewhere.
