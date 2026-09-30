# Dashboard — Developer Documentation

Technical documentation for the Dashboard project: architecture, testing, project structure and development workflow.

> 📦 Installation, setup and build instructions are in the [public documentation](./README.md#installation--setup).

> 📖 Looking for the project overview, features and use cases? See the **[Public Documentation (README)](./README.md)**.

## 📋 Table of Contents

- [System Architecture](#system-architecture)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Key Use Cases — Related Code](#key-use-cases--related-code)
- [Development](#development)
- [Support & Contribution](#support--contribution)

---

## 🏗 System Architecture

This project follows **Hexagonal Architecture** (Ports & Adapters) on the backend, ensuring separation of concerns between business logic, infrastructure, and external integrations.

```
┌─────────────────────────────────────────────────────┐
│                   React Client                      │
│  (./client) — UI, OAuth flows, widget rendering    │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP/REST
                       ▼
┌─────────────────────────────────────────────────────┐
│              NestJS Backend (./server)              │
├─────────────────────────────────────────────────────┤
│ Inbound Adapters (Controllers)                      │
│  ├─ auth.controller.ts (login/register)            │
│  ├─ oauth.controller.ts (OAuth callbacks)          │
│  ├─ widget-instance.controller.ts                  │
│  └─ provider.controller.ts                         │
├─────────────────────────────────────────────────────┤
│ Domain / Use Cases (Business Logic)                 │
│  ├─ auth.use-case.ts                               │
│  ├─ widget-instance.service.ts                     │
│  ├─ widget-catalog.service.ts                      │
│  └─ provider.service.ts                            │
├─────────────────────────────────────────────────────┤
│ Ports (Interfaces)                                 │
│  ├─ user.repository.ts                             │
│  ├─ widget.repository.ts                           │
│  ├─ subscription.repository.ts                     │
│  └─ widget-data.provider.ts                        │
├─────────────────────────────────────────────────────┤
│ Outbound Adapters                                  │
│  ├─ Prisma Database Adapters                       │
│  │   ├─ prisma-user.repository.ts                  │
│  │   ├─ prisma-widget.repository.ts                │
│  │   └─ prisma-subscription.repository.ts          │
│  └─ OAuth Provider Adapters                        │
│      ├─ github-oauth.adapter.ts                    │
│      └─ google-oauth.adapter.ts                    │
└─────────────────────────────────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │      MySQL Database          │
        │  (users, subscriptions,      │
        │   widgets, widget instances) │
        └──────────────────────────────┘
```

See [HEXAGONAL_ARCHITECTURE.md](./server/HEXAGONAL_ARCHITECTURE.md) for detailed explanation and code examples.

---

## 🧪 Testing

```bash
cd server
npm run test           # Run unit tests once
npm run test:watch    # Run tests in watch mode
npm run test:cov      # Run with coverage report
npm run test:e2e      # Run end-to-end tests
```

---

## 📁 Project Structure

```
DashBoard/
├── README.md                           # Public documentation
├── DEVELOPMENT.md                      # This file
├── HEXAGONAL_ARCHITECTURE.md           # Architecture deep dive
├── docker-compose.yml                  # Docker services definition
├── package.json                        # Root monorepo config
│
├── client/                             # Frontend (React + TypeScript + Vite)
│   ├── package.json
│   ├── vite.config.ts                  # Vite config
│   ├── tsconfig.json
│   ├── index.html                      # Entry HTML
│   ├── src/
│   │   ├── main.tsx                    # React root
│   │   ├── App.tsx                     # Main app component
│   │   ├── client.ts                   # Axios HTTP client
│   │   ├── authPages/                  # Login/registration pages
│   │   ├── components/                 # Shared UI components (NavBar, etc.)
│   │   ├── dashboard/                  # Dashboard view & widget management
│   │   │   ├── Dashboard.tsx           # Main dashboard container
│   │   │   ├── SortableWidget.tsx      # Drag-and-drop widget wrapper
│   │   │   ├── WidgetCard.tsx          # Widget display card
│   │   │   ├── WidgetContent.tsx       # Widget content area
│   │   │   ├── api.ts                  # Dashboard API calls
│   │   │   └── types.ts                # TypeScript interfaces
│   │   ├── oauth/                      # OAuth flow handling
│   │   └── widgets/                    # Widget implementations
│   │       └── youtubeWidget.tsx       # YouTube widget example
│   └── docker/
│       ├── Dockerfile                  # Client Docker image
│       └── nginx.conf                  # Nginx reverse proxy config
│
└── server/                             # Backend (NestJS + Prisma + MySQL)
    ├── package.json
    ├── tsconfig.json
    ├── nest-cli.json                   # NestJS CLI config
    ├── prisma.config.ts                # Prisma config override
    ├── vitest.config.ts                # Vitest (testing) config
    ├── src/
    │   ├── main.ts                     # Server entry point
    │   ├── app.module.ts               # NestJS root module
    │   │
    │   ├── adapters/                   # Hexagonal Architecture - Adapters
    │   │   ├── entry/                  # Inbound adapters (controllers)
    │   │   │   ├── auth.controller.ts           # /auth/* endpoints
    │   │   │   ├── oauth.controller.ts          # /oauth/* endpoints
    │   │   │   ├── widget-instance.controller.ts # /widgets/* endpoints
    │   │   │   └── provider.controller.ts       # /providers/* endpoints
    │   │   │
    │   │   └── extern/                 # Outbound adapters (implementations)
    │   │       ├── database/           # Prisma repository implementations
    │   │       │   ├── prisma-user.repository.ts
    │   │       │   ├── prisma-widget.repository.ts
    │   │       │   ├── prisma-subscription.repository.ts
    │   │       │   └── prisma.module.ts
    │   │       └── providers/          # External API adapters
    │   │           ├── github-oauth.adapter.ts
    │   │           └── google-oauth.adapter.ts
    │   │
    │   ├── domain/                     # Business logic (core/hexagon)
    │   │   ├── port/                   # Port interfaces (contracts)
    │   │   │   ├── user.repository.ts
    │   │   │   ├── widget.repository.ts
    │   │   │   ├── subscription.repository.ts
    │   │   │   └── widget-data.provider.ts
    │   │   │
    │   │   └── useCases/               # Application services
    │   │       ├── auth.use-case.ts
    │   │       ├── widget-instance.service.ts
    │   │       ├── widget-catalog.service.ts
    │   │       ├── provider.service.ts
    │   │       └── about.service.ts
    │   │
    │   ├── dto/                        # Data Transfer Objects
    │   │   ├── auth.dto.ts
    │   │   ├── oauth.dto.ts
    │   │   ├── widget-instance.dto.ts
    │   │   └── widget.dto.ts
    │   │
    │   └── generated/                  # Auto-generated (Prisma client)
    │       └── prisma/                 # Prisma client type definitions
    │
    ├── prisma/                         # Database schema & migrations
    │   ├── schema.prisma               # Database models
    │   ├── seed.ts                     # Database seed script
    │   └── migrations/                 # Migration history
    │       ├── 20260915210644_init/
    │       ├── 20260916000000_add_email_verification_fields/
    │       ├── 20260924091402_change_name_in_user_table/
    │       ├── 20260924093428_make_user_name_not_nullable/
    │       └── 20260928162519_replace_xy_with_position/
    │
    ├── test/                          # E2E tests
    │   └── app.e2e-spec.ts
    │
    └── docker/
        └── Dockerfile                  # Server Docker image
```

---

## 💡 Key Use Cases — Related Code

The user-facing steps of each use case are described in the [public documentation](./README.md#key-use-cases). This section lists the code behind each one.

### 1. User Registration & Authentication

**Related code:**
- Frontend: [client/src/authPages/](client/src/authPages/)
- Backend: [server/src/adapters/entry/auth.controller.ts](server/src/adapters/entry/auth.controller.ts)
- Use case: [server/src/domain/useCases/auth.use-case.ts](server/src/domain/useCases/auth.use-case.ts)

### 2. Connect External Service (OAuth)

**Related code:**
- OAuth handlers: [server/src/adapters/extern/providers/](server/src/adapters/extern/providers/)
- Subscription service: [server/src/domain/useCases/provider.service.ts](server/src/domain/useCases/provider.service.ts)

### 3. Create & Configure Widget

**Related code:**
- Frontend: [client/src/dashboard/](client/src/dashboard/)
- Backend: [server/src/adapters/entry/widget-instance.controller.ts](server/src/adapters/entry/widget-instance.controller.ts)
- Service: [server/src/domain/useCases/widget-instance.service.ts](server/src/domain/useCases/widget-instance.service.ts)

### 4. Fetch Widget Data

**Related code:**
- Widget data service: [server/src/domain/useCases/widget-data.service.ts](server/src/domain/useCases/widget-data.service.ts)
- Widget port: [server/src/domain/port/widget-data.provider.ts](server/src/domain/port/widget-data.provider.ts)

---

## 👨‍💻 Development

### Code Quality

**Linting:**

```bash
cd server
npm run lint          # Run oxlint on server code

cd ../client
npm run lint          # Run ESLint on client code
```

**Formatting:**

```bash
cd server
npm run format        # Format code with Prettier
```

### Database Management

**Create a new migration:**

```bash
cd server
npx prisma migrate dev --name your_migration_name
```

**View database in Prisma Studio:**

```bash
cd server
npx prisma studio
```

Opens a GUI at http://localhost:5555 to inspect/edit data.

**Reset database** (development only):

```bash
cd server
npx prisma migrate reset
```

### Running Mock Data

To run the client with mock widgets (no server required):

```bash
npm run dev:mock
```

This uses environment variable `VITE_MOCK_WIDGETS=true` to skip API calls.

---

## 📞 Support & Contribution

For issues, questions, or contributions:
1. Open an issue describing the problem or feature request
2. Create a feature branch from `main`
3. Submit a pull request with clear commit messages
4. Ensure all tests pass before merging
