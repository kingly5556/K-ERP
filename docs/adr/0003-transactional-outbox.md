# ADR-0003: Transactional outbox and idempotent posting between modules

- **Status:** Accepted
- **Recorded:** 2026-10-21

## Context

A goods receipt in Stock must produce exactly one journal entry in Accounting (Dr 1300 Inventory / Cr 2150 GR/IR). The two modules have separate databases (ADR-0001). Calling the Accounting API right after committing the receipt loses the posting if Accounting is down, and retrying a call that actually succeeded creates a duplicate.

## Decision

- Stock writes the business change **and** an `outbox_events` row in **the same database transaction**. If one is saved, both are.
- A worker in Stock delivers pending events to `POST /api/postings` on Accounting with a service key, retrying with exponential backoff; 4xx answers are marked failed for a person to look at.
- Accounting makes posting **idempotent** on `(sourceModule, sourceType, sourceId)` with a unique index, so a repeated delivery returns the existing entry instead of creating a second one.

## Alternatives considered

- *Direct HTTP call*: loses or duplicates postings on failure.
- *Message broker*: same guarantees need an outbox anyway, plus a broker to host.
- *Two-phase commit across databases*: not available on the hosting and fragile.

## Consequences

- No lost and no duplicated postings. Tested on production by suspending Accounting during a goods receipt: the entry was posted once, on the 6th delivery attempt, after Accounting came back.
- The ledger trails stock by seconds (eventual consistency). A nightly job reconciles stock value with GL 1300.
- The worker assumes one Stock instance; scaling out needs `FOR UPDATE SKIP LOCKED` when claiming events.
