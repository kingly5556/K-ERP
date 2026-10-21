# Architecture Decision Records

Short records of the main design decisions in K-ERP: the context, what I chose, what else I considered, and what it costs. Each one is the answer I would give if asked "why is it built this way?".

| # | Decision |
|---|---|
| [ADR-0001](0001-hub-plus-modules.md) | Hub plus independent modules |
| [ADR-0002](0002-append-only-stock-ledger.md) | Stock as an append-only ledger with a row lock |
| [ADR-0003](0003-transactional-outbox.md) | Transactional outbox and idempotent posting between modules |
| [ADR-0004](0004-money-as-bigint-satang.md) | Money as BigInt satang |
| [ADR-0005](0005-accounting-rules-in-two-layers.md) | Accounting rules enforced in code and in the database |
| [ADR-0006](0006-backend-decides-permissions.md) | The backend decides permissions; the UI does not hide buttons by role |
| [ADR-0007](0007-periods-in-bangkok-time.md) | Accounting periods in Bangkok time (UTC+7) |
