# ADR-0004: Money as BigInt satang

- **Status:** Accepted
- **Recorded:** 2026-10-21

## Context

Amounts are in Thai baht with two decimals. Binary floating point cannot represent values like 0.1 exactly, so sums drift (0.1 + 0.2 ≠ 0.3) and a trial balance can be off by a satang. JavaScript numbers are also only exact up to 2^53.

## Decision

- Store every amount as an integer number of **satang** (1/100 baht) in a `BIGINT` column, and use `bigint` in TypeScript.
- Send amounts as **strings** in JSON (e.g. `"6000000"`), parse them into `bigint` at the edge, and format to baht only for display.

## Alternatives considered

- *`DECIMAL` + a decimal library*: also correct, but adds a dependency and every operation goes through it.
- *Float/`number`*: simplest, but wrong for money.

## Consequences

- Sums and balance checks are exact.
- Clients must parse strings; generic JSON tools show amounts as text.
- Division (e.g. average cost) needs an explicit rounding rule wherever it happens.
