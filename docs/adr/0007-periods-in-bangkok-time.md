# ADR-0007: Accounting periods in Bangkok time (UTC+7)

- **Status:** Accepted
- **Recorded:** 2026-10-21

## Context

Servers and the database run in UTC. The business is in Thailand. A goods receipt at 00:30 on 1 November Bangkok time is still 31 October in UTC; filed by UTC, it would land in the wrong month, possibly in a period that is already closed.

## Decision

- Store timestamps in UTC, but compute the **accounting period** (`YYYY-MM`) and all date boundaries from the entry date in **`Asia/Bangkok`**.
- Report filters include the whole Bangkok day; year-end closing entries are dated 31 December at noon Bangkok time.
- System events dated in a closed period are booked into the next open period, with the real date kept in the memo, so the outbox never gets stuck.

## Alternatives considered

- *UTC periods*: simple, but wrong for a Thai business around midnight.
- *Store local time*: loses the instant and breaks if the business ever spans time zones.

## Consequences

- Entries land in the month the business expects.
- Every place that turns a date into a period must use the shared helper; tests cover the month boundary.
- Thailand has no daylight saving, so the offset is fixed; supporting other zones would need a per-company setting.
