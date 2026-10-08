# Dashboard — Developer Documentation

Technical documentation for the Dashboard project: architecture, testing, project structure and development workflow.

> Installation, setup and build instructions are in the [public documentation](./README.md#installation--run).

> Looking for the project overview, features and use cases? See the **[Public Documentation (README)](./README.md)**.

## Table of Contents

- [System Architecture](#system-architecture)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Key Use Cases — Related Code](#key-use-cases--related-code)
- [Development](#development)
- [Support & Contribution](#support--contribution)

---

## System Architecture

This project follows **Hexagonal Architecture** (Ports & Adapters) on the backend, ensuring separation of concerns between business logic, infrastructure, and external integrations.

```
┌─────────────────────────────────────────────────────┐
│                   React Client                      │
│  (./frontend) — UI, OAuth flows, widget rendering │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP/REST
                       ▼
┌─────────────────────────────────────────────────────┐
│              NestJS Backend (./backend)             │
├─────────────────────────────────────────────────────┤
│ Inbound Adapters (Controllers)                      │
│  ├─ app.controller.ts                              │
│  ├─ auth.controller.ts                              │
│  ├─ oauth.controller.ts                             │
│  ├─ services.controller.ts                          │
│  ├─ widget-instance.controller.ts                   │
│  └─ provider.controller.ts                          │
├─────────────────────────────────────────────────────┤
│ Domain / Use Cases (Business Logic)                 │
│  ├─ app.service.ts                                  │
│  ├─ about.service.ts                                │
│  ├─ auth.use-case.ts                                │
│  ├─ provider.service.ts                             │
│  ├─ widget-catalog.service.ts                      │
│  ├─ widget-instance.service.ts                     │
│  ├─ widget-data.service.ts                          │
│  └─ ...                                             │
├─────────────────────────────────────────────────────┤
│ Ports (Interfaces)                                 │
│  ├─ catalog.repository.ts                           │
│  ├─ provider.repository.ts                          │
│  ├─ subscription.repository.ts                      │
│  ├─ user.repository.ts                              │
│  ├─ widget.repository.ts                            │
│  ├─ widget-data.provider.ts                         │
│  └─ ...                                             │
├─────────────────────────────────────────────────────┤
│ Outbound Adapters                                  │
│  ├─ prisma/* repository implementations             │
│  ├─ provider-solver.adapter.ts                     │
│  ├─ github-oauth.adapter.ts                        │
│  ├─ google-oauth.adapter.ts                        │
│  └─ ...                                             │
└─────────────────────────────────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │      MariaDB / MySQL        │
        │  users, subscriptions,      │
        │   widgets, widget instances  │
        └──────────────────────────────┘
```

See [backend/HEXAGONAL_ARCHITECTURE.md](./backend/HEXAGONAL_ARCHITECTURE.md) for a deeper explanation and code examples.

---

## Testing

```bash
cd backend
npm run test           # Run unit tests once
npm run test:watch    # Run tests in watch mode
npm run test:cov      # Run with coverage report
npm run test:e2e      # Run end-to-end tests
```

---

## Project Structure

```
DashBoard/
├── README.md                           # Public documentation
├── DEVELOPMENT.md                      # This file
├── docker-compose.yml                  # Docker services definition
├── package.json                        # Root monorepo config / workspaces
│
├── backend/                            # NestJS backend
│   ├── package.json
│   ├── nest-cli.json
│   ├── tsconfig.json
│   ├── tsconfig.build.json
│   ├── prisma.config.ts
│   ├── vitest.config.ts
│   ├── vitest.config.e2e.ts
│   ├── README.md
│   ├── src/
│   │   ├── app.module.ts
│   │   ├── main.ts
│   │   ├── adapters/
│   │   │   ├── entry/
│   │   │   │   ├── app.controller.ts
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── oauth.controller.ts
│   │   │   │   ├── services.controller.ts
│   │   │   │   ├── widget-instance.controller.ts
│   │   │   │   └── ...
│   │   │   └── extern/
│   │   ├── domain/
│   │   │   ├── port/
│   │   │   ├── useCases/
│   │   │   └── ...
│   │   ├── dto/
│   │   │   ├── auth.dto.ts
│   │   │   ├── oauth.dto.ts
│   │   │   ├── widget-instance.dto.ts
│   │   │   └── widget.dto.ts
│   │   └── generated/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.ts
│   │   └── migrations/
│   ├── docker/
│   │   └── Dockerfile
│   └── test/
│       └── app.e2e-spec.ts
│
├── frontend/                          # React + Vite frontend
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── index.html
│   ├── eslint.config.js
│   ├── nginx.conf
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── client.ts
│   │   ├── colors.css
│   │   ├── authPages/
│   │   ├── components/
│   │   ├── dashboard/
│   │   ├── oauth/
│   │   ├── titlePage/
│   │   └── widgets/
│   └── docker/
│       ├── Dockerfile
│       └── nginx.conf
│
└── .gitignore
```

---

## Key Use Cases — Related Code

The user-facing steps of each use case are described in the [public documentation](./README.md#key-use-cases). This section lists the code behind each one.

### 1. User Registration & Authentication

**Related code:**
- Frontend: [frontend/src/authPages/](./frontend/src/authPages/)
- Backend: [backend/src/adapters/entry/auth.controller.ts](./backend/src/adapters/entry/auth.controller.ts)
- Use case: [backend/src/domain/useCases/auth.use-case.ts](./backend/src/domain/useCases/auth.use-case.ts)

### 2. Connect External Service (OAuth)

**Related code:**
- OAuth entry controller: [backend/src/adapters/entry/oauth.controller.ts](./backend/src/adapters/entry/oauth.controller.ts)
- Service: [backend/src/domain/useCases/provider.service.ts](./backend/src/domain/useCases/provider.service.ts)
- External adapters: [backend/src/adapters/extern/](./backend/src/adapters/extern/)

### 3. Create & Configure Widget

**Related code:**
- Frontend: [frontend/src/dashboard/](./frontend/src/dashboard/)
- Backend: [backend/src/adapters/entry/widget-instance.controller.ts](./backend/src/adapters/entry/widget-instance.controller.ts)
- Service: [backend/src/domain/useCases/widget-instance.service.ts](./backend/src/domain/useCases/widget-instance.service.ts)

### 4. Fetch Widget Data

**Related code:**
- Widget data service: [backend/src/domain/useCases/widget-data.service.ts](./backend/src/domain/useCases/widget-data.service.ts)
- Widget port: [backend/src/domain/port/widget-data.provider.ts](./backend/src/domain/port/widget-data.provider.ts)

---

## Development

### API Documentation (Swagger)

The backend exposes the Swagger UI at:

```text
http://localhost:8080/api
```

This is configured in `backend/src/main.ts` via `SwaggerModule.setup('api', app, documentFactory)`.

### Code Quality

**Linting:**

```bash
cd backend
npm run lint

cd ../frontend
npm run lint
```

**Formatting:**

```bash
cd backend
npm run format
```

### Database Management

**Create a new migration:**

```bash
cd backend
npx prisma migrate dev --name your_migration_name
```

**View database in Prisma Studio:**

```bash
cd backend
npx prisma studio
```

Opens a GUI at http://localhost:5555 to inspect/edit data.

**Reset database** (development only):

```bash
cd backend
npx prisma migrate reset
```

### Start the app

From the repository root:

```bash
npm install
npm run dev
```

This starts the backend and frontend by using the workspace scripts defined in `package.json`.

### Running Mock Data

To run the frontend with mock widgets (without a live backend):

```bash
cd frontend
npm run dev:mock
```

This uses `VITE_MOCK_WIDGETS=true` and skips API calls when the mock mode is enabled.

---

## Support & Contribution

For issues, questions, or contributions:
1. Open an issue describing the problem or feature request
2. Create a feature branch from `main`
3. Submit a pull request with clear commit messages
4. Ensure all tests pass before merging
