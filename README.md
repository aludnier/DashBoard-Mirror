# Dashboard — Customizable Widget Aggregation Platform

A full-stack web application that allows users to authenticate, subscribe to external services, and build personalized dashboards with customizable widgets. Featuring OAuth integration (GitHub, Google), real-time data aggregation, and a responsive drag-and-drop UI.

> Looking for architecture, testing, project structure or contribution guidelines? See the **[Developer Documentation](./DashBoard/DEVELOPMENT.md)**.

## Table of Contents

- [Features & Services](#features--services)
- [Technologies](#technologies)
- [Installation & Run](#installation--run)
- [Key Use Cases](#key-use-cases)
- [Support & Contribution](#support--contribution)

---

## Features & Services

### Core Features

- **User Authentication**
  - Email/password registration and login
  - OAuth 2.0 integration (GitHub, Google)
  - Email verification workflow
  - Secure session management

- **Service Subscriptions**
  - Connect to external service providers (GitHub, Google, YouTube, etc.)
  - Manage OAuth tokens and refresh workflows
  - Per-service access control

- **Dashboard Widgets**
  - Drag-and-drop widget positioning (`@dnd-kit` powered)
  - Customizable widget instances with per-widget configuration
  - Adjustable refresh rate per widget
  - Responsive grid layout (width/height per widget)
  - Dark theme support

- **Widget Types Available**
  - **YouTube Widget** — display YouTube channel/video stats
  - Extensible architecture for additional widgets

### Services

- **GitHub Service** — OAuth integration for GitHub account linking
- **Google Service** — OAuth integration for Google account linking
- **YouTube Service** — widget provider for YouTube statistics

### Data Model

```
User
  ├─ Subscriptions (e.g., GitHub subscription, YouTube subscription)
  │   ├─ Service (GitHub, Google, YouTube, etc.)
  │   ├─ OAuth tokens (accessToken, refreshToken)
  │   └─ WidgetInstances
  │       ├─ WidgetDefinition (template)
  │       ├─ config (per-instance settings)
  │       └─ layout (position, width, height, refresh rate)
  └─ Dashboard (collection of WidgetInstances)
```

---

## 🛠 Technologies

### Frontend

| Technology | Purpose |
|---|---|
| **React 19** | UI framework |
| **TypeScript** | Type-safe development |
| **Vite 8** | Build tool & dev server |
| **React Router 8** | Client-side routing |
| **@dnd-kit** | Drag-and-drop library |
| **Axios** | HTTP client |
| **ESLint** | Code linting |

### Backend

| Technology | Purpose |
|---|---|
| **NestJS 12** | TypeScript framework for Node.js |
| **Prisma 7** | ORM & database toolkit |
| **MySQL 8** | Primary database |
| **class-validator** | DTO validation |
| **bcrypt** | Password hashing |
| **vitest** | Unit & integration testing |
| **oxlint** | Fast linting |

### Infrastructure

| Tool | Purpose |
|---|---|
| **Docker** | Containerization |
| **docker compose** | Multi-container orchestration |
| **MariaDB adapter** | MySQL compatibility |
| **PostgreSQL adapter** | Alternative database support |

---

> For more details about the project stack choices, see the **[Stack comparison study](./DashBoard/STACK_COMPARAISON.md)**.

## Installation & Run

### Prerequisites

- **Git**
- **Node.js** 18+ and npm
- **Docker** with **docker compose**

### Quick start

After cloning the repository, run:

```bash
git clone <repository-url>
cd Dashboard
npm install
docker compose build
docker compose up
```

That's it. Once the containers are up, the services are available at:

| Service | URL |
|---|---|
| **Frontend** | http://localhost:5173 |
| **Backend API** | http://localhost:8080 |
| **SwaggerUI Documenation**| http://localhost:8080/api |
| **Database** | localhost:3307 |


### Useful commands

Run from the `Dashboard/` folder:

```bash
docker compose up -d        # Start in the background
docker compose logs -f      # Follow the logs
docker compose down         # Stop and remove the containers
docker compose build        # Rebuild the images after changing the code
```

### OAuth configuration (optional)

Email/password authentication works out of the box. To enable GitHub and Google login or service linking, provide your OAuth credentials in `backend/.env`:

```dotenv
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_REDIRECT_URI=http://localhost:5173/oauth/github/callback

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5173/oauth/google/callback
```

Then restart the stack with `docker compose up`.

---

## Key Use Cases

### 1. User Registration & Authentication
1. User navigates to `/signup` or `/login`
2. Enters email/password or clicks OAuth button (GitHub/Google)
3. Server validates and creates user record
4. Session token is returned and stored locally
5. User is redirected to dashboard

### 2. Connect External Service (OAuth)
1. User clicks "Connect GitHub" on dashboard
2. Redirected to GitHub OAuth consent screen
3. User approves permissions
4. GitHub redirects back with auth code
5. Server exchanges code for access token
6. Token is stored in user's Subscription record
7. User can now create widgets from this service

### 3. Create & Configure Widget
1. User selects widget type (e.g., YouTube channel stats)
2. Enters configuration (channel ID, refresh rate)
3. Widget is positioned on dashboard via drag-and-drop
4. Server stores WidgetInstance with config and position
5. Client fetches data at specified refresh rate

### 4. Fetch Widget Data
1. Client calls `/widgets/:id/data` endpoint
2. Server fetches data through the configured provider adapter
3. Data is returned and displayed in widget card
4. Client re-fetches at refreshRateSeconds interval

> For the code behind each use case, see [Key Use Cases — Related Code](./DashBoard/DEVELOPMENT.md#key-use-cases--related-code) in the developer documentation.

---

## Support & Contribution

For issues, questions, or contributions:
1. Open an issue describing the problem or feature request
2. Create a feature branch from `main`
3. Submit a pull request with clear commit messages
4. Ensure all tests pass before merging

See the **[Developer Documentation](./DashBoard/DEVELOPMENT.md)** for architecture, testing and development guidelines.
