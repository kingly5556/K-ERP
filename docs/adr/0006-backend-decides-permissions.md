# ADR-0006: The backend decides permissions; the UI does not hide buttons by role

- **Status:** Accepted
- **Recorded:** 2026-10-21

## Context

Five roles (Purchasing, Manager, Warehouse, Accountant, Admin) can do different things, for example only a Manager may approve a purchase order over 50,000 THB. Hiding buttons in the frontend looks tidy, but it is not security: anyone can call the API directly.

## Decision

- Every permission is checked in the backend: the hub checks `allowedModules` before proxying, and each module checks the module and the role from the JWT on every request, answering **403** when not allowed.
- The frontends show the same actions to everyone and display the 403 message when the backend refuses.

## Alternatives considered

- *Hide buttons by role in the UI as well*: nicer UX, but a second copy of the rules that drifts from the real ones.
- *UI only*: insecure.

## Consequences

- One source of truth for permissions, tested as a matrix (16 actions × 5 roles = 80 checks).
- Users can click buttons they are not allowed to use and get an error; hiding them is a planned UX improvement that would read permissions from the backend rather than copy them.
