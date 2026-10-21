# ADR-0001: Hub plus independent modules

- **Status:** Accepted
- **Recorded:** 2026-10-21

## Context

K-ERP needs purchasing, stock and accounting for a small business, built and run by one person on free hosting. A single monolith would be simplest to run, but stock and accounting have different owners, rules and release pace, and I wanted the accounting ledger to be protected from bugs in purchasing code. Full microservices (service mesh, broker, many small services) would be far more than one person can operate.

## Decision

Split the system into a **hub** and **modules**:

- **ERPHUB** (Next.js) owns login and is the only public entry point. It issues a JWT in an httpOnly cookie and reverse-proxies `/erp/<module>/*` to each module, so the browser sees one origin.
- Each **module** (Stock & Purchase, Accounting) is one Express service with **its own PostgreSQL database** and its own React SPA. Modules never read each other's tables.
- Modules talk only through a narrow, versioned interface (the posting API in ADR-0003).

## Alternatives considered

- *Monolith*: one deploy and real cross-module transactions, but one bad migration or bug can touch the ledger, and modules cannot be deployed or reasoned about separately.
- *Microservices with a broker*: better isolation, but needs Kafka/RabbitMQ and more services than free hosting allows.

## Consequences

- Each module can be built, tested and deployed alone; the ledger has its own database and rules.
- Cross-module consistency is eventual, not transactional (handled by ADR-0003).
- Every module repeats some plumbing (auth middleware, error handler, Prisma setup).
- One login, one domain: no CORS and no tokens in JavaScript.
