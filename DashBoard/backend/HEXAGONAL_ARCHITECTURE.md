# Hexagonal Architecture (Ports & Adapters) — Dashboard Server

This document explains the Hexagonal Architecture (also called Ports & Adapters) and shows how the pattern maps to this repository.

## Quick summary
- Purpose: isolate core business logic (the domain) from external concerns (HTTP, DB, third-party APIs).
- Key concepts: **Domain (Core)**, **Ports** (interfaces the core depends on), **Adapters** (concrete implementations for those ports), and **Application / Use-cases** (orchestrate domain behavior).

## How this repo maps to the pattern

- Domain (core): business logic and use-cases
  - [src/domain/useCases](src/domain/useCases)

- Ports (interfaces the domain depends on): repository and provider interfaces
  - [src/domain/port](src/domain/port)

- Inbound Adapters (driving adapters): handle external input (HTTP controllers)
  - [src/adapters/entry](src/adapters/entry)
    - e.g. [src/adapters/entry/auth.controller.ts](src/adapters/entry/auth.controller.ts)

- Outbound Adapters (driven adapters): concrete implementations that fulfill ports (DB, external APIs)
  - Database (Prisma) adapters: [src/adapters/extern/database](src/adapters/extern/database)
    - e.g. [src/adapters/extern/database/prisma-subscription.repository.ts](src/adapters/extern/database/prisma-subscription.repository.ts)
    - e.g. [src/adapters/extern/database/prisma-user.repository.ts](src/adapters/extern/database/prisma-user.repository.ts)
  - OAuth provider adapters: [src/adapters/extern/providers](src/adapters/extern/providers)
    - e.g. [src/adapters/extern/providers/google-oauth.adapter.ts](src/adapters/extern/providers/google-oauth.adapter.ts)

- Infrastructure / generated client
  - [src/generated/prisma](src/generated/prisma)

## Typical request flow (example: user login / auth)

1. HTTP request arrives at an inbound adapter: the controller.
   - See: [src/adapters/entry/auth.controller.ts](src/adapters/entry/auth.controller.ts)
2. Controller delegates to an application service / use-case in the domain.
   - See: [src/domain/useCases/auth.use-case.ts](src/domain/useCases/auth.use-case.ts)
3. The use-case depends on a port (interface) for persistence or external services.
   - Example port: [src/domain/port/user.repository.ts](src/domain/port/user.repository.ts)
4. An outbound adapter implements that port and performs the actual I/O using Prisma or external APIs.
   - Implementation: [src/adapters/extern/database/prisma-user.repository.ts](src/adapters/extern/database/prisma-user.repository.ts)
5. The adapter returns domain-friendly data to the use-case; the use-case returns a result to the controller; the controller crafts the HTTP response.

## Minimal illustrative example

Domain port (interface):

```ts
// src/domain/port/user.repository.ts
export interface UserRepository {
  findByEmail(email: string): Promise<User | null>
  save(user: User): Promise<User>
}
```

Outbound adapter (Prisma implementation):

```ts
// src/adapters/extern/database/prisma-user.repository.ts
import { PrismaClient } from '../../../../../src/generated/prisma'
// implements UserRepository using Prisma client
```

Inbound adapter (controller) calling a use-case:

```ts
// src/adapters/entry/auth.controller.ts
// controller receives HTTP request → calls `authUseCase.execute()` → returns response
```

This separation means the `domain` folder needs no knowledge of HTTP or Prisma; it only depends on `ports` (interfaces). Adapters can be swapped for tests (in-memory repos) or different DBs.

## Why this helps

- Testability: core logic can be unit-tested by injecting test doubles for ports.
- Maintainability: external concerns (DB, web, auth providers) are kept outside core business rules.
- Replaceability: adapters can be swapped without modifying use-cases.

## Where to look in this repo (quick links)

- Ports: [src/domain/port](src/domain/port)
- Use-cases: [src/domain/useCases](src/domain/useCases)
- HTTP controllers (inbound adapters): [src/adapters/entry](src/adapters/entry)
- Prisma adapters (outbound adapters): [src/adapters/extern/database](src/adapters/extern/database)
- OAuth adapters: [src/adapters/extern/providers](src/adapters/extern/providers)

## Next steps / suggestions

- Add a short README in each `adapters/*` folder showing which ports they implement.
- Add small integration tests that boot the app with a test adapter (in-memory) to validate full flows.

---
Created to help new contributors map the Hexagonal pattern onto this codebase.
