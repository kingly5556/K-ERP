# ADR-0005: Accounting rules enforced in code and in the database

- **Status:** Accepted
- **Recorded:** 2026-10-21

## Context

The general ledger must always balance and a posted entry must never change; corrections are made with a reversing entry. Checks in application code are easy to bypass: a seed script, a migration, a future endpoint or someone with a SQL console.

## Decision

Enforce the core rules twice:

- **In code**: pure functions validate entries (each line is debit *or* credit, totals equal, accounts active and postable, period open), with fast unit tests.
- **In PostgreSQL**: a `CHECK` constraint that each line has exactly one of debit/credit greater than zero, and triggers that reject `UPDATE`/`DELETE` on posted entries and their lines, even from raw SQL.

## Alternatives considered

- *Code only*: simpler, but one missed path corrupts the ledger.
- *Database only*: safe, but error messages are poor and rules are hard to test quickly.

## Consequences

- The ledger stays correct even if application code has a bug.
- Some rules exist in two places and must be changed together; the trigger SQL lives in a hand-written migration.
- Tests cover both layers (unit tests for the functions, integration tests that try raw SQL updates).
