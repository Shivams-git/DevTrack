# DevTrack — Developer Workflow Manager

> **Plan better. Ship faster.**  
> A high-performance, developer-focused project and issue management tool inspired by modern engineering suites like Linear and GitHub Projects.

---

## 1. Project Overview

**DevTrack** is an end-to-end full-stack software application built for modern developers and engineering teams. It streamlines sprint planning, issue tracking, deadline management, and work prioritization through an automated urgency scoring engine, an interactive drag-and-drop Kanban board, real-time analytics, and persistent audit histories.

---

## 2. Problem Statement

Modern software engineers often struggle with project tools that are either overly bloated (like legacy Jira setups) or overly simplistic (basic TODO lists) that fail to surface what genuinely matters:
- High-priority bugs stagnating in progress without developer visibility.
- Approaching deadlines going unnoticed until tasks become overdue.
- Blocked tickets failing to trigger clear visual blockers for the team.
- Manual urgency assessments that lack objective, data-driven scoring.

**DevTrack solves this** by pairing a clean, distraction-free Linear-like interface with an automated, multi-factor **Prioritization Engine** that ranks and surfaces critical work dynamically.

---

## 3. Key Features

- **Interactive Kanban Board (`/board`)**: Five workflow stages (`Backlog`, `Todo`, `In Progress`, `In Review`, `Done`) with HTML5 drag-and-drop, quick accessible status selectors, and instant optimistic UI updates.
- **Urgency Prioritization Engine**: Dynamically calculates numeric urgency scores (0–120+) based on priority weights, overdue penalties, due-date proximity, blocked status, and time spent in progress.
- **Overview Dashboard (`/`)**: Aggregated metrics (total, in progress, completed, overdue, blocked), Recharts donut and bar visualizations, highest-urgency tasks, and upcoming 7-day deadlines.
- **Comprehensive Issue Management (`/issues`)**: Filterable and searchable table with multi-criteria filters (status, priority, type), multiple sorting modes (urgency score, due date, update time), and pagination.
- **Insights & Velocity Analytics (`/insights`)**: Visual distributions across status pipelines, priority severities, and workload types with delivery completion ratios.
- **Persistent Activity Stream (`/activity`)**: Automatic audit feed recording every create, status change, priority update, and deletion event with reverse-chronological ordering.
- **Fail-Safe Dual-Mode Persistence**: First-class MongoDB Atlas integration via Mongoose, with an automatic in-memory fallback demo mode that ensures offline and demo reliability if database credentials are not yet configured.

---

## 4. Technology Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS with custom developer-tool color palette (Charcoal, Slate, Indigo, Emerald, Amber, Rose)
- **Routing**: React Router v6
- **Charts & Visualizations**: Recharts
- **Icons**: Lucide React
- **Typography**: Inter & JetBrains Mono

### Backend
- **Runtime**: Node.js (v18+)
- **Web Framework**: Express.js (Modular ES modules)
- **Database & ODM**: MongoDB Atlas / Mongoose
- **Security**: Helmet security headers & customizable CORS whitelist
- **Logging**: Morgan HTTP logger & structured console logger

### Testing & Tooling
- **Unit & Integration Testing**: Node.js native test runner (`node:test`, `node:assert/strict`) & Supertest
- **Process Management**: Nodemon & Concurrently

---

## 5. Architecture & Folder Structure

```
DevTrack/
├── package.json               # Root monorepo orchestrator scripts
├── .gitignore                 # Git ignore rules for node_modules, build, .env
├── README.md                  # Comprehensive project documentation
├── server/                    # Express.js REST API Backend
│   ├── package.json
│   ├── render.yaml            # Render deployment blueprint
│   ├── .env.example           # Environment template
│   └── src/
│       ├── server.js          # Server entrypoint and graceful shutdown
│       ├── app.js             # Express application & middleware pipeline
│       ├── config/
│       │   ├── db.js          # Mongoose DB connector with graceful fallback
│       │   └── env.js         # Environment variable loader
│       ├── models/
│       │   ├── Issue.js       # Issue schema with validation & indexes
│       │   └── Activity.js    # Activity audit log schema
│       ├── routes/
│       │   ├── healthRoutes.js    # Health check & DB status
│       │   ├── issueRoutes.js     # Issue CRUD endpoints
│       │   ├── dashboardRoutes.js # Aggregated metrics
│       │   ├── insightsRoutes.js  # Analytics data
│       │   └── activityRoutes.js  # Activity feed
│       ├── controllers/
│       │   ├── issueController.js
│       │   ├── dashboardController.js
│       │   ├── insightsController.js
│       │   └── activityController.js
│       ├── services/
│       │   ├── prioritizationEngine.js # Urgency scoring logic
│       │   ├── issueService.js         # Core business logic
│       │   ├── activityService.js      # Audit log service
│       │   └── memoryStore.js          # In-memory fallback demo store
│       ├── middleware/
│       │   ├── validate.js     # Request payload validators
│       │   └── errorHandler.js # Centralized error & 404 handlers
│       ├── utils/
│       │   ├── constants.js    # Status, Priority, Type definitions
│       │   └── logger.js       # Structured logger
│       ├── scripts/
│       │   ├── seed.js         # Database seeder
│       │   └── seedData.js     # 14 realistic sample developer issues
│       └── tests/
│           ├── prioritization.test.js # Urgency algorithm unit tests
│           └── api.test.js            # API endpoint integration tests
│
└── client/                    # Vite + React Frontend
    ├── package.json
    ├── vite.config.js         # Optimized Vite build with manual chunks
    ├── tailwind.config.js     # Custom design system configuration
    ├── postcss.config.js
    ├── vercel.json            # Vercel SPA rewrite configuration
    ├── .env.example
    ├── index.html
    └── src/
        ├── main.jsx           # React DOM root entry
        ├── App.jsx            # App routing layout
        ├── index.css          # Tailwind base & custom scrollbars
        ├── context/
        │   └── IssueContext.jsx # Global state, toasts & optimistic updates
        ├── services/
        │   └── api.js         # Centralized API client (reads VITE_API_URL)
        ├── utils/
        │   └── formatters.js  # Date, badge styles, relative time helpers
        ├── components/
        │   ├── common/        # Badge, Toast, ConfirmDialog, EmptyState, Skeleton
        │   ├── layout/        # Sidebar, Navbar, AppLayout
        │   ├── board/         # KanbanColumn, IssueCard
        │   └── issues/        # IssueFormModal, IssueDetailModal
        └── pages/
            ├── DashboardPage.jsx # Metrics, Recharts & Urgent Tasks
            ├── BoardPage.jsx     # Kanban Board with drag-and-drop
            ├── IssuesPage.jsx    # Table view with search, filter & sort
            ├── InsightsPage.jsx  # Analytical charts & velocity
            ├── ActivityPage.jsx  # Event timeline & audit feed
            └── NotFoundPage.jsx  # 404 Handler
```

---

## 6. Prioritization Algorithm & Urgency Scoring

DevTrack uses a multi-factor **Prioritization Engine** (`server/src/services/prioritizationEngine.js`) to objectively compute an integer **Urgency Score** ($0 \le \text{Score} \le 120+$) and an **Urgency Level** (`Low`, `Medium`, `High`, `Critical`).

### Scoring Formula

$$\text{Urgency Score} = \text{Base Priority} + \text{Deadline Proximity} + \text{Blocked Factor} + \text{In-Progress Stagnation}$$

#### 1. Base Priority Weight
- **Critical**: $+50$ points
- **High**: $+35$ points
- **Medium**: $+20$ points
- **Low**: $+10$ points

#### 2. Deadline & Overdue Penalty (Non-Done only)
- **Overdue** ($\text{DueDate} < \text{Now}$): $+40$ points
- **Due within 24 hours**: $+30$ points
- **Due within 3 days (72 hours)**: $+20$ points
- **Due within 7 days**: $+10$ points
- **No Due Date or $> 7$ days**: $+0$ points

#### 3. Blocked Status Factor
- **Flagged as Blocked**: $+15$ points (blocked work surfaces immediately for unblocking)

#### 4. Stagnation in 'In Progress'
- **In Progress $> 7$ days without update**: $+15$ points
- **In Progress $> 3$ days**: $+10$ points
- **In Progress $\le 3$ days**: $+5$ points

#### 5. Completion Rule
- **Status = 'Done'**: Urgency score is strictly reset to **$0$** and level to `Low`. Completed tasks are never classified as overdue or urgent.

### Urgency Level Classification
- **$\ge 75$ points**: `Critical` (Red Flame)
- **$50 - 74$ points**: `High` (Amber)
- **$30 - 49$ points**: `Medium` (Sky Blue)
- **$< 30$ points**: `Low` (Slate)

---

## 7. Data Models

### Issue Model (`Issue.js`)
| Field | Type | Required | Description |
|---|---|---|---|
| `key` | String | Yes | Unique identifier (e.g., `DEV-001`), indexed |
| `title` | String | Yes | Issue title (3–150 characters) |
| `description` | String | No | Detailed description / reproduction steps |
| `type` | String | Yes | `Task`, `Bug`, `Feature`, or `Improvement` |
| `status` | String | Yes | `Backlog`, `Todo`, `In Progress`, `In Review`, `Done` |
| `priority` | String | Yes | `Low`, `Medium`, `High`, `Critical` |
| `labels` | [String] | No | Array of tags (e.g. `['Auth', 'Security']`) |
| `dueDate` | Date | No | Due date timestamp (or `null`) |
| `estimatedHours`| Number | No | Estimated effort in hours ($\ge 0$) |
| `isBlocked` | Boolean | Yes | Flag indicating if task is blocked |
| `blockingReason`| String | No | Explanation of blocker |
| `createdAt` | Date | Auto | Creation timestamp |
| `updatedAt` | Date | Auto | Last update timestamp |

### Activity Model (`Activity.js`)
| Field | Type | Description |
|---|---|---|
| `action` | String | `ISSUE_CREATED`, `STATUS_CHANGED`, `PRIORITY_CHANGED`, `ISSUE_UPDATED`, `ISSUE_DELETED` |
| `description`| String | Human-readable audit text (e.g., "Moved DEV-001 from Todo to In Progress") |
| `issueKey` | String | Associated issue key |
| `metadata` | Object | Change context (e.g., `{ from: 'Todo', to: 'In Progress' }`) |
| `createdAt` | Date | Timestamp of event |

---

## 8. REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check, uptime, environment, and DB connection state |
| `GET` | `/api/issues` | Retrieve paginated issues with filtering (`search`, `status`, `priority`, `type`) and sorting |
| `POST` | `/api/issues` | Create new issue with automated key generation and activity logging |
| `GET` | `/api/issues/:id` | Retrieve single issue by ID or key (`DEV-001`) with urgency enrichment |
| `PATCH` | `/api/issues/:id` | Update issue fields, trigger status transitions, and record audit log |
| `DELETE` | `/api/issues/:id` | Delete issue by ID or key and log audit record |
| `GET` | `/api/dashboard` | Aggregated sprint statistics, urgent tasks, and deadline metrics |
| `GET` | `/api/insights` | Analytical distribution data for Recharts visualizations |
| `GET` | `/api/activity` | Reverse-chronological activity feed (limit parameter supported) |

---

## 9. Local Setup & Running Instructions

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Step 1: Install Dependencies
From the repository root:
```bash
npm run install:all
```
*(Or install in each directory individually: `cd server && npm install`, then `cd ../client && npm install`)*

### Step 2: Configure Environment Variables
Create `.env` in `server/`:
```bash
# In server/.env
PORT=5000
NODE_ENV=development
MONGODB_URI=
CLIENT_URL=http://localhost:5173
```
Create `.env` in `client/`:
```bash
# In client/.env
VITE_API_URL=http://localhost:5000
```
*(Note: If `MONGODB_URI` is left blank, DevTrack automatically initializes with its robust In-Memory Demo Store, allowing the entire app to be evaluated immediately without needing an Atlas cluster!)*

### Step 3: Seed Sample Data
DevTrack includes 14 realistic developer issues covering critical bugs, performance tasks, upcoming deadlines, overdue tasks, and blocked items:
```bash
npm run seed
```

### Step 4: Run the Application
To start both backend and frontend concurrently:
```bash
npm run dev
```
- Frontend will open at: **`http://localhost:5173`**
- Backend API will listen on: **`http://localhost:5000`**
- Health status available at: **`http://localhost:5000/api/health`**

---

## 10. Running Tests

DevTrack includes unit and integration tests covering the Prioritization Algorithm, date boundary edge cases, input validation, and full REST CRUD lifecycles:

Run tests from repository root:
```bash
npm test
```
*(Or from within `server/`: `npm test`)*

**Sample Test Output:**
```
✔ API GET /api/health returns healthy payload (36.6ms)
✔ API Issue Lifecycle (Create, Read, Update, Delete) (42.1ms)
✔ API Validation errors reject invalid payloads (5.3ms)
✔ Prioritization Engine - Overdue detection (1.1ms)
✔ Prioritization Engine - Upcoming deadline detection (2.4ms)
✔ Prioritization Engine - Priority weighting rules (0.6ms)
✔ Prioritization Engine - Overdue unfinished issues receive substantial urgency increase (0.4ms)
✔ Prioritization Engine - Blocked issues receive urgency boost (0.4ms)
✔ Prioritization Engine - Done issues are cleared of urgency (0.2ms)

pass 9, fail 0 (duration ~700ms)
```

---

## 11. Deployment Guide

### A. Deploy Backend to Render

1. Create a free account at [render.com](https://render.com).
2. Click **New +** $\rightarrow$ **Web Service**.
3. Connect your Git repository.
4. Configure the Web Service settings:
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js`
5. In **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `MONGODB_URI`: `<Your MongoDB Atlas connection string>`
   - `CLIENT_URL`: `<Your Vercel frontend URL>`
6. Deploy the service and note your live URL (e.g. `https://devtrack-api.onrender.com`).

### B. Deploy Frontend to Vercel

1. Create a free account at [vercel.com](https://vercel.com).
2. Click **Add New...** $\rightarrow$ **Project**.
3. Import your Git repository.
4. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Under **Environment Variables**, add:
   - `VITE_API_URL`: `<Your Render Backend URL, e.g. https://devtrack-api.onrender.com>`
6. Click **Deploy**. Vercel will build the frontend with SPA rewrite support configured in `client/vercel.json`.

---

## 12. Screenshots & Visual Walkthrough

> Instructions for adding screenshots: Capture screenshots of the following pages and save them into an `assets/screenshots/` directory, then update the references below.

- **Overview Dashboard**: Metrics cards, Recharts status and priority charts, urgent tasks ranking.
- **Kanban Board**: Drag-and-drop workflow columns with priority and blocked flags.
- **Issue Detail & Edit Modal**: Issue attributes, status transitions, and audit records.
- **Insights & Analytics**: Workload by issue type and completion rate gauge.
- **Activity History**: Reverse-chronological event timeline.

---

## 13. Known Limitations & Future Improvements

### Current Design Scope
- Single-workspace personal developer workflow manager without multi-tenant authentication.
- Optimized for desktop screens with responsive collapsible drawer for mobile tablets.

### Future Roadmap
- GitHub / GitLab Webhook integration (auto-closing issues on pull request merge).
- Sprint velocity burndown charts.
- Sub-tasks and issue dependency graphing.
- Custom tag color configuration.

---

## 14. License

DevTrack is open-source software licensed under the MIT License.
