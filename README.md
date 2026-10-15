# K-ERP — overview repository

Operational files shared by the K-ERP services. The full project overview (demo link,
architecture, modules, ADRs) will be added here in phase 3 of the portfolio plan.

| Path | What it is |
|---|---|
| `.github/workflows/reset-demo.yml` | Nightly reset of the public demo (03:00 Bangkok): reset + seed both databases, wake both services, drain the outbox, reconcile |
| `scripts/reconcile.mjs` | Checks that the stock value in Stock equals GL account 1300 in Accounting |
| `render.yaml` | Optional Render Blueprint for the two backend services |

Repository secrets used by the workflow: `STOCK_DATABASE_URL`, `ACCOUNTING_DATABASE_URL`,
`STOCK_URL`, `ACCOUNTING_URL`. They must point at the **demo** databases only:
`prisma migrate reset` deletes all data.

Related repositories: [K-ERPHub](https://github.com/kingly5556/K-ERPHub) ·
[Stock-Purchase-Backend](https://github.com/kingly5556/Stock-Purchase-Backend) ·
[Stock-Purchase-Frontend](https://github.com/kingly5556/Stock-Purchase-Frontend) ·
[Accounting-Backend](https://github.com/kingly5556/Accounting-Backend) ·
[Accounting-Frontend](https://github.com/kingly5556/Accounting-Frontend)
