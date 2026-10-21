# ADR-0002: Stock as an append-only ledger with a row lock

- **Status:** Accepted
- **Recorded:** 2026-10-21

## Context

Stock levels change from goods receipts, adjustments and (later) issues. Storing a single `quantity` column and updating it is easy but loses history, and two concurrent requests can both read the same old value and write a wrong result. Inventory value must also match the general ledger (account 1300).

## Decision

- Every change is a new row in `stock_movements` with a signed quantity and `balanceBefore` / `balanceAfter`. Rows are never updated or deleted; the balance is the sum of movements.
- All movements go through one function, `postStockMovement`, which first runs `SELECT … FROM products WHERE id = $1 FOR UPDATE`. That serialises movements per product, so each one starts from the balance the previous one left.
- A movement that would take the balance below zero is rejected with 409.

## Alternatives considered

- *Mutable quantity column*: no history and racy without the same lock.
- *Optimistic locking (version column + retry)*: works, but under contention many requests retry; a short row lock is simpler at this volume.
- *SERIALIZABLE isolation for everything*: correct, but every caller must handle serialization failures.

## Consequences

- Full audit trail; a stock card is just a query.
- Concurrent movements on the same product queue behind each other (different products do not block each other).
- Covered by an integration test against real PostgreSQL ([`stock-movement.integration.test.ts`](https://github.com/kingly5556/Stock-Purchase-Backend/blob/main/src/modules/inventory/stock-movement.integration.test.ts)): 50 concurrent issues of 1 unit against 30 in stock must give 30 successes, 20 × 409, a final balance of 0 and an unbroken `balanceBefore` chain. It passes on main; on a throwaway branch without `FOR UPDATE` it fails, with 32 of the 50 issues accepted (2 units oversold). A k6 run of 50 users on one product for 30 s gave 10,275 requests, 0% errors, p95 168 ms and a consistent ledger.
- Summing movements gets slower as history grows; a snapshot table would be the next step.
