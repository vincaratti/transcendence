*This project has been created as part of the 42 curriculum by vcaratti, mucabrin, arcornil, sbrugman, praucq.*

---

# ft_transcendence — Codenames Online

A real-time multiplayer implementation of the word-deduction board game **Codenames**, built as a full-stack web application. Teams of two compete to identify their agents on the board using one-word clues, all in a live synchronized session powered by WebSockets.

---

## Description

**Codenames Online** is a web application that lets up to four players compete in real time. Players split into two teams — RED and BLUE — each with a Spymaster and an Operative. The Spymaster gives a single-word clue and a number; the Operative must guess which cards on the board match. First team to uncover all their agents wins — but guessing the assassin card ends the game immediately.

### Key Features

- **Real-time multiplayer** — four-player games synchronized across clients via Socket.io
- **Direct messaging**: real-time chat between players with typing indicators, read receipts, presence, and blocking
- **User accounts** — registration, login, profile editing, and avatar upload
- **Social layer** — friend requests, friend list, and live online/offline presence
- **Stats & progression** — personal win rate, match history, global leaderboard, and achievements
- **Secure by default** — all traffic routed through Nginx with HTTPS (TLS 1.2/1.3); passwords hashed with bcrypt; tokens issued as signed JWTs
- **One-command deployment** — fully containerized with Docker Compose

---

## Team Information

| Login | Role | Responsibilities |
|---|---|---|
| **vcaratti** | Product Owner & de facto Project Manager | Defined the product vision and feature priorities; maintained the backlog; validated completed work; set up the Docker environment so all team members could develop their parts independently from day one |
| **mucabrin** | Project Manager | Organized team coordination and tracked deadlines; designed and implemented the database schema, Prisma ORM layer, auth service, and the achievements system |
| **arcornil** | Tech Lead | Defined the technical architecture and made stack decisions; implemented the majority of the frontend and the core backend game logic; reviewed critical code changes |
| **sbrugman** | Developer | Implemented user authentication flows, the initial frontend structure, the homepage/dashboard UI, and the real-time direct messaging system |
| **praucq** | Developer | Developed an additional first-person game prototype that reuses the existing backend and frontend infrastructure |

---

## Project Management

### Team Organization

The project started with a shared kickoff phase where vcaratti set up the Docker environment, allowing each member to work on their area without blocking others. Once everyone found their footing and became confident in their part, the workflow became self-organizing — each person owned a domain and coordinated with others when interfaces needed to align.

### Tools

- **Communication:** Discord (primary channel for daily coordination, questions, and quick reviews)
- **Version control:** Git with GitHub — commit history reflects individual contributions across all members
- **Task tracking:** Work was distributed informally by domain (database, auth, game, frontend, chat) rather than via a formal issue tracker

### Practices

- Domain ownership: each member was responsible for their area end-to-end (design, implementation, testing)
- Cross-review on shared interfaces (API contracts, socket events, database schema)
- Regular Discord syncs to unblock dependencies between services

---

## Technical Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| Vue 3 | ^3.2 | Component-based UI framework (Composition API) |
| Vite | ^8.0 | Build tool and dev server |
| Tailwind CSS | ^4.3 | Utility-first styling |
| Vue Router | ^4.6 | Client-side routing with authentication guards |
| Socket.io-client | ^4.8 | Real-time WebSocket communication |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| Node.js | 22+ (experimental strip-types) | Runtime |
| Express | ^5.1 | HTTP API framework |
| Socket.io | ^4.8 | WebSocket server (game events, presence) |
| Prisma | ^7.8 | ORM and database migrations |
| JSON Web Tokens | ^9.0 | Stateless authentication |
| bcrypt | ^5.1 | Password hashing |
| multer | ^2.2 | Avatar file uploads |

The backend is split into two services:
- **`backend`** — game logic, user routes, friends, stats, and Socket.io
- **`auth-service`** — registration, login, and token issuance (isolated to limit blast radius of auth changes)

### Database

**PostgreSQL 16** — chosen for its robust relational model (the game's team/role/friendship relationships map naturally to normalized tables), strong JSON support for the game board state, mature transaction guarantees, and the Prisma ecosystem's first-class PostgreSQL integration.

### Infrastructure

| Component | Technology |
|---|---|
| Reverse proxy / TLS termination | Nginx (self-signed cert, TLS 1.2/1.3) |
| Containerization | Docker Compose (5 services: nginx, frontend, backend, auth-service, postgresql) |
| Volume persistence | Named Docker volume for PostgreSQL data |

### Justification for Major Choices

- **Vue 3 over React:** The team had prior Vue experience and the Composition API maps well to game-state reactivity without extra state management libraries.
- **Express 5 + raw Node.js types:** Avoids the overhead of a TypeScript compilation step while still allowing type annotations via the experimental strip-types flag.
- **Prisma over raw SQL:** Provides type-safe queries, auto-generated migrations, and a clear schema-as-source-of-truth, reducing the risk of schema drift across team members.
- **Microservice split (backend / auth):** Isolates authentication concerns so that changes to game logic cannot accidentally break login flows and vice versa.
- **Socket.io over raw WebSockets:** Provides built-in room management, automatic reconnection, and event-based API that matches the game's action model.

---

## Database Schema

### Tables and Relationships

```
users
├── id            UUID  PK
├── username      TEXT  UNIQUE NOT NULL
├── email         TEXT  UNIQUE NOT NULL
├── password      TEXT  NOT NULL (bcrypt hash)
├── avatar_url    TEXT  NULLABLE
└── created_at    TIMESTAMPTZ

games
├── id             UUID  PK
├── code           TEXT  UNIQUE          -- join code shown to players
├── status         ENUM  (WAITING | IN_PROGRESS | FINISHED)
├── current_team   ENUM  (RED | BLUE)
├── phase          ENUM  (CLUE | GUESS)
├── remaining_guess INT
├── current_clue   TEXT  NULLABLE
├── winner         ENUM  (RED | BLUE)  NULLABLE
├── board          JSON                  -- 25-card board state
├── created_at     TIMESTAMPTZ
└── updated_at     TIMESTAMPTZ

players  (junction: users ↔ games)
├── id      UUID  PK
├── team    ENUM  (RED | BLUE)
├── role    ENUM  (SPYMASTER | OPERATIVE)
├── user_id UUID  FK → users.id
└── game_id UUID  FK → games.id  (CASCADE DELETE)
    UNIQUE (user_id, game_id)

friendships
├── id            UUID  PK
├── requester_id  UUID  FK → users.id  (CASCADE DELETE)
├── addressee_id  UUID  FK → users.id  (CASCADE DELETE)
├── status        ENUM  (PENDING | ACCEPTED)
├── created_at    TIMESTAMPTZ
└── updated_at    TIMESTAMPTZ
    UNIQUE (requester_id, addressee_id)

messages
├── id           UUID  PK
├── sender_id    UUID  FK → users.id
├── recipient_id UUID  FK → users.id  NULLABLE  -- null = lobby/global channel
├── content      TEXT  NOT NULL
├── read_at      TIMESTAMPTZ  NULLABLE          -- set when the recipient reads it
└── created_at   TIMESTAMPTZ

blocks
├── blocker_id  UUID  FK → users.id  (CASCADE DELETE)
├── blocked_id  UUID  FK → users.id  (CASCADE DELETE)
└── created_at  TIMESTAMPTZ
    PRIMARY KEY (blocker_id, blocked_id)

achievements
├── id          UUID  PK
├── name        TEXT
├── description TEXT
├── icon        TEXT  NULLABLE
├── condition   TEXT  UNIQUE  -- logic key (e.g. "5_wins", "1_spymaster_wins")
└── created_at  TIMESTAMPTZ

user_achievements  (junction: users ↔ achievements)
├── id             UUID  PK
├── user_id        UUID  FK → users.id
├── achievement_id UUID  FK → achievements.id
└── unlocked_at    TIMESTAMPTZ
    UNIQUE (user_id, achievement_id)
```

### Key Relationships

- A **User** can be a **Player** in many **Games** (many-to-many via `players`)
- A **Game** has exactly 4 **Players** (2 teams × 2 roles)
- **Friendships** are bidirectional — `requester_id` sends the request, `addressee_id` accepts; both directions are queried in the API
- **Messages** are sent from one **User** to another; a null `recipient_id` marks a lobby message rather than a direct one
- **Blocks** are directional and keyed on the pair of users, so a block exists at most once and disappears with either account
- **Achievements** are global definitions; **UserAchievement** records which user has unlocked which, with a timestamp
- The achievement definitions are seeded on backend startup, so a fresh `docker compose up` has all 8 available immediately

---

## Features List

| Feature | Implemented by | Description |
|---|---|---|
| User registration & login | mucabrin, sbrugman | Email + password auth via dedicated auth-service; JWT issued on login |
| Password hashing | mucabrin | bcrypt with salt rounds |
| JWT authentication middleware | mucabrin | Every protected route validates the bearer token |
| Profile editing | sbrugman, vcaratti | Update username, email, and password via dashboard form |
| Avatar upload | sbrugman, arcornil | Upload PNG/JPEG/GIF/WebP (max 2 MB); MIME allow-listed; stored under a random UUID filename; accessible at `/api/uploads/avatars/` |
| Input validation | arcornil | Username, email and password rules enforced identically in the browser and on the server; the API rejects invalid input independently of the frontend |
| Auth rate limiting | arcornil | Fixed-window per-IP limits on login and registration to make brute forcing impractical |
| Privacy Policy & Terms of Service | arcornil | Dedicated pages describing the data the app stores and the rules of use; linked from the footer of every page |
| Friend requests | sbrugman, mucabrin | Send request by username; accept or decline incoming requests |
| Friends list with online status | sbrugman, arcornil | Real-time online/offline indicator via Socket.io presence tracking |
| Lobby system | arcornil | Share a game code; join a lobby; pick team (RED/BLUE) and role (Spymaster/Operative); switch before game starts |
| Real-time Codenames game | arcornil | Full game loop: Spymaster submits clue + number, Operative clicks cards, turn ends manually or on wrong guess, assassin ends game immediately |
| Match history | arcornil, mucabrin | Paginated log of finished games with result, role, team, and opponents |
| Global leaderboard | arcornil, mucabrin | Ranked by total wins; cursor-based pagination |
| Personal stats | arcornil, mucabrin | Win rate, total games, wins/losses, red vs. blue breakdown |
| Achievements | mucabrin | 8 unlock conditions (first win, 3 wins, 5 wins, 3 games played, Spymaster win, Operative win, Red win, Blue win); awarded automatically when conditions are met |
| Direct messaging | sbrugman | Real-time one-to-one chat over a dedicated `/ws/chat` Socket.io namespace: authenticated connections, whisper commands, typing indicators, read receipts, online presence, and per-user blocking; messages persisted in the `messages` table |
| Blocking | sbrugman | Block a user to stop receiving their messages; enforced server-side and stored in the `blocks` table |
| Docker deployment | vcaratti | Single `docker compose up --build` starts all 5 services with Nginx HTTPS termination |

---

## Modules

**Total claimed: 16 points** (requirement: 14)

| Module | Category | Type | Points | Implemented by |
|---|---|---|---|---|
| Frontend framework (Vue 3) + Backend framework (Express 5) | Web | Major | 2 | arcornil, team |
| Real-time features via WebSockets (Socket.io) | Web | Major | 2 | arcornil |
| User interaction — profiles, friends system, chat | Web | Major | 2 | sbrugman, mucabrin, arcornil |
| ORM (Prisma) | Web | Minor | 1 | mucabrin |
| Standard user management & authentication | User Management | Major | 2 | mucabrin, sbrugman |
| Game statistics & match history | User Management | Minor | 1 | arcornil, mucabrin |
| Web-based game (Codenames) | Gaming | Major | 2 | arcornil |
| Multiplayer 3+ players (4-player Codenames) | Gaming | Major | 2 | arcornil |
| Remote players — real-time play across machines | Gaming | Major | 2 | arcornil |
| **Total** | | | **16** | |

### Module Details

**Web frameworks (Major, 2pts):** Vue 3 on the frontend with Vite as the build tool; Express 5 on the backend. Both use a structured architecture with routing, middleware, and separation of concerns.

**Real-time WebSockets (Major, 2pts):** Socket.io manages all live game state (clue submission, card guesses, end-of-turn), lobby events (player joined, player switched role), and user presence (online/offline). Connections are authenticated at the handshake level and cleaned up gracefully on disconnect.

**User interaction (Major, 2pts):** A profile system displays user information and stats. A friends system allows adding users by username, accepting or declining requests, and viewing the full friend list with live presence indicators. Real-time direct messaging runs over a dedicated `/ws/chat` Socket.io namespace with authenticated connections, typing indicators, read receipts, presence, and per-user blocking; messages are persisted in the database and can be started directly from the friend list.

**ORM — Prisma (Minor, 1pt):** All database access goes through Prisma with a schema-first approach. Migrations are versioned and applied automatically on startup via `prisma migrate deploy`.

**Standard user management (Major, 2pts):** Users register with email and password (bcrypt-hashed), log in to receive a JWT, update their profile information, upload a custom avatar, and see friends' online status in real time. Registration and profile updates are validated on both sides of the wire: the same username, email and password rules run in the browser and again in the service that writes to the database, so the API cannot be bypassed with a direct request. Login and registration are rate limited per IP.

**Game stats & match history (Minor, 1pt):** Every finished game records the result for each player. The stats API aggregates wins, losses, and win rate. Match history supports pagination and result filtering (win/loss). Achievements unlock automatically based on cumulative game conditions. A global leaderboard ranks all users by wins.

**Web-based game (Major, 2pts):** A fully playable, rule-complete implementation of Codenames. 25 cards are distributed between RED agents, BLUE agents, a neutral bystander group, and one assassin. The Spymaster sees all card colors; the Operative does not. The game enforces turn order and phase transitions.

**Multiplayer 3+ players (Major, 2pts):** Games support exactly 4 players (2 teams × 2 roles), all synchronized in real time through a shared Socket.io room. The lobby prevents invalid configurations and shows live player state.

**Remote players (Major, 2pts):** Any authenticated user on any machine can join a game by entering its code. All game events are broadcast to every client in the room. Disconnections are detected and the game state is preserved so players can reconnect.

---

## Instructions

### Prerequisites

| Requirement | Version |
|---|---|
| Docker | 24+ |
| Docker Compose | v2 (bundled with Docker Desktop) |
| Git | any recent version |
| Web browser | Latest stable Google Chrome |

No other software needs to be installed on the host — Node.js, PostgreSQL, and all dependencies run inside containers.

### Setup

**1. Clone the repository**

```bash
git clone <repository-url>
cd transcendence_git
```

**2. Configure environment variables**

```bash
cp .env.example .env
```

Open `.env` and set the following values:

```
# PostgreSQL
POSTGRES_USER=transcendence
POSTGRES_PASSWORD=<choose a strong password>
POSTGRES_DB=transcendence

# Auth
JWT_SECRET=<choose a long random secret>

# Internal ports (change only if there are conflicts)
AUTH_PORT=3001
BACKEND_PORT=3000
```

**3. Build and start all services**

```bash
docker compose up --build
```

This builds all five images (nginx, frontend, backend, auth-service, postgresql), runs database migrations automatically, and starts the application.

**4. Open the application**

Navigate to [https://localhost](https://localhost) in Google Chrome.

> The application uses a self-signed TLS certificate. Your browser will show a security warning — click "Advanced" → "Proceed to localhost" to continue.

### Stopping the Application

```bash
docker compose down
```

To also remove the database volume (all data):

```bash
docker compose down -v
```

### Useful Development Commands

```bash
# View logs for all services
docker compose logs -f

# View logs for a specific service
docker compose logs -f backend

# Open Prisma Studio (database GUI) — run inside the backend container
docker compose exec backend npx prisma studio
```

---

## Individual Contributions

### vcaratti — Product Owner & de facto Project Manager

- Defined the project concept (Codenames), its scope, and feature priorities
- Set up the Docker Compose infrastructure at the project's start, enabling all team members to develop their parts in isolation without environment conflicts
- Took on project management responsibilities in addition to the PO role: tracked deadlines, facilitated coordination between members, resolved blockers
- Validated completed features and coordinated the overall integration

**Challenge:** Balancing a dual PO/PM role while keeping the team unblocked. The solution was investing heavily in the Docker setup upfront so each member had a reproducible environment, reducing integration friction throughout the project.

---

### mucabrin — Project Manager & Backend Engineer

- Designed the full database schema (users, games, players, friendships, achievements, user_achievements) and the Prisma migration workflow
- Implemented the dedicated `auth-service` microservice: registration endpoint, login endpoint, JWT issuance, and password hashing with bcrypt
- Built the achievements system end-to-end: defined conditions, implemented the unlock logic, and wired it to the game completion flow
- Managed team meetings and tracked delivery progress

**Challenge:** Designing the achievement system to be data-driven (conditions stored in the database) rather than hard-coded, so new achievements can be added without schema changes. Resolved by using a `condition` string column as a logic key interpreted at runtime.

---

### arcornil — Tech Lead & Lead Developer

- Defined the overall technical architecture: service split, API contracts, socket event naming, and routing conventions
- Implemented the core backend game logic: game creation, lobby joining, role switching, game start, clue submission, card guessing, turn transitions, win/loss detection
- Built the majority of the frontend: Dashboard, Codenames game view, Lobby, Stats, Leaderboard, Match History, Achievements display, StatsOverview
- Implemented all Socket.io server-side event handlers for game and presence
- Conducted code reviews on shared interfaces

**Challenge:** Synchronizing complex multi-step game state (clue → guess → end turn) reliably across four clients while handling edge cases like disconnects mid-game. Solved by keeping the game state authoritative on the server and broadcasting the full updated state after each mutation.

---

### sbrugman — Developer

- Implemented the authentication UI (login and registration forms in `Logins.vue`) and wired it to the auth-service
- Built the initial frontend structure and the Dashboard homepage
- Implemented the full Friends UI: send requests by username, accept/decline incoming requests, display the friend list with avatars and real-time online/offline badges
- Built the real-time direct messaging system end-to-end: the `/ws/chat` Socket.io namespace on the server (`chatsocket.js`) with connection authentication, whisper commands, typing indicators, read receipts, presence and blocking; the client composable (`composables/chat.js`) with reconnect and frame handling; and the chat UI (`Messages.vue`), wired to the friend list so a DM can be started from a friend's row

**Challenge:** Integrating the friend presence (online/offline) display with the real-time Socket.io layer while keeping the friend list UI reactive to WebSocket events without unnecessary re-renders.

---

### praucq — Developer

- Developed a first-person 3D slasher game prototype as an additional project, designed to reuse the existing backend API and authentication infrastructure
- Contributed to shared tooling and backend integration patterns used across both applications

---

## Resources

### Documentation

- [Vue 3 Documentation](https://vuejs.org/guide/)
- [Express.js Documentation](https://expressjs.com/)
- [Prisma ORM Documentation](https://www.prisma.io/docs)
- [Socket.io Documentation](https://socket.io/docs/v4/)
- [PostgreSQL 16 Documentation](https://www.postgresql.org/docs/16/)
- [Vite Documentation](https://vite.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [JSON Web Tokens — jwt.io](https://jwt.io/introduction)
- [Docker Compose Reference](https://docs.docker.com/compose/)

### Game Rules Reference

- [Codenames Official Rules (Czech Games Edition)](https://czechgames.com/files/rules/codenames-rules-en.pdf)

### AI Usage

AI tools were used throughout the project for the following tasks:

- **Claude (Anthropic):** Used by multiple team members for architecture questions, debugging complex logic (socket event sequencing, Prisma query optimization, JWT middleware), code review, and generating boilerplate that was then adapted and reviewed.
- **GitHub Copilot:** Used inline during development for code completion, repetitive CRUD patterns, and Vue template scaffolding. All AI-generated suggestions were reviewed and tested by the author before merging.

AI was used as a productivity tool and pair-programming assistant, not as a replacement for understanding. Every team member can explain their code and the decisions behind it.
