# Dashboard — Customizable Widget Aggregation Platform

A full-stack web application that allows users to authenticate, subscribe to external services, and build personalized dashboards with customizable widgets. Featuring OAuth integration (GitHub, Google), real-time data aggregation, and a responsive drag-and-drop UI.

> 👨‍💻 Looking for architecture, testing, project structure or contribution guidelines? See the **[Developer Documentation](./DashBoard/DEVELOPMENT.md)**.

## 📋 Table of Contents

- [Features & Services](#features--services)
- [Technologies](#technologies)
- [Installation & Setup](#installation--setup)
- [Build & Run](#build--run)
- [Key Use Cases](#key-use-cases)
- [Support & Contribution](#support--contribution)

---

## ✨ Features & Services

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
| **docker-compose** | Multi-container orchestration |
| **MariaDB adapter** | MySQL compatibility |
| **PostgreSQL adapter** | Alternative database support |

---

## 📦 Installation & Setup

### Prerequisites

- **Node.js** 18+ and npm/yarn
- **Docker** & **docker-compose** (for containerized setup)
- **Git**

### Option 1: Local Development Setup (Recommended for Development)

#### 1. Clone and install dependencies

```bash
git clone <repository-url>
cd DashBoard
npm install
```

This installs dependencies for the monorepo root, client, and server simultaneously.

#### 2. Set up environment variables

Create `.env` files in the `server` folder:

```bash
# Copy the example and edit with your values
cp server/.env.example server/.env
```

Edit `server/.env`:

```dotenv
DATABASE_URL="mysql://dashboard_user:dashboard_pass@localhost:3307/dashboard"
SHADOW_DATABASE_URL="mysql://root:rootpass@localhost:3307/dashboard_shadow"

DATABASE_HOST=localhost
DATABASE_PORT=3307
DATABASE_USER=dashboard_user
DATABASE_PASSWORD=dashboard_pass
DATABASE_NAME=dashboard

GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_REDIRECT_URI=http://localhost:3000/oauth/github/callback

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/oauth/google/callback
```

#### 3. Start the database (MySQL)

```bash
docker-compose up -d db
```

Wait for the database to be ready (check health with `docker-compose ps`).

#### 4. Run Prisma migrations

```bash
npm run server:migrate
```

This applies pending database migrations and generates the Prisma client.

#### 5. (Optional) Seed the database

```bash
cd server
npx prisma db seed
```

---

### Option 2: Full Docker Compose (Recommended for Production/Testing)

#### 1. Clone the repository

```bash
git clone <repository-url>
cd DashBoard
```

#### 2. Configure environment

```bash
cp server/.env.example server/.env
# Edit server/.env with your OAuth credentials
```

#### 3. Start all services

```bash
docker-compose up --build
```

Services will be available at:
- **Client**: http://localhost:3000
- **Server API**: http://localhost:8080
- **Database**: localhost:3307

---

## 🚀 Build & Run

### Development

Start both client and server with live reloading:

```bash
npm run dev
```

This command:
- Starts the backend server on **http://localhost:8080** (NestJS watch mode)
- Starts the frontend on **http://localhost:5173** (Vite dev server)

Individual services:

```bash
npm run dev:server    # Backend only (watch mode)
npm run dev:client    # Frontend only (Vite dev server)
```

### Production Build

#### Build both client and server

```bash
npm run build
```


#### Run production server

```bash
cd server
npm run start:prod
# Server listens on port 8080 (configurable via PORT env var)
```

---

## 💡 Key Use Cases

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
2. Server fetches datathrough the configured provider adapter
3. Data is returned and displayed in widget card
4. Client re-fetches at refreshRateSeconds interval

> For the code behind each use case, see [Key Use Cases — Related Code](./DashBoard/DEVELOPMENT.md#key-use-cases--related-code) in the developer documentation.

---

## 📞 Support & Contribution

For issues, questions, or contributions:
1. Open an issue describing the problem or feature request
2. Create a feature branch from `main`
3. Submit a pull request with clear commit messages
4. Ensure all tests pass before merging

See the **[Developer Documentation](./DashBoard/DEVELOPMENT.md)** for architecture, testing and development guidelines.
