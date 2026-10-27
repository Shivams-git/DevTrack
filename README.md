# ⚡ DevTrack — Developer Workflow Manager

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Frontend-Vercel-000000?style=flat&logo=vercel&logoColor=white)](https://vercel.com/)
[![Render](https://img.shields.io/badge/Backend-Render-46E3B7?style=flat&logo=render&logoColor=black)](https://render.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **Plan better. Ship faster.**  
> A high-performance, developer-focused project and issue management suite inspired by modern engineering tools like Linear and GitHub Projects. Built with a full-stack MERN architecture.

---

## 🌟 Key Features

* **📋 Interactive Kanban Board (`/board`)**: Five continuous delivery stages (`Backlog`, `Todo`, `In Progress`, `In Review`, `Done`) featuring native HTML5 drag-and-drop, quick status selectors, and optimistic UI updates.
* **🔥 Dynamic Urgency Scoring Engine**: Calculates objective, integer-based urgency scores ($0 - 120+$) based on priority weights, overdue penalties, due-date proximity, blocked flags, and in-progress stagnation.
* **📊 Metrics Dashboard (`/`)**: Aggregated metrics, interactive Recharts distribution donut and priority bar charts with high-contrast glassmorphism tooltips, highest-urgency tasks, and a 7-day deadline tracker.
* **👥 Multi-Account Profile Switcher**: Switch instantly between multiple developer profiles (e.g. *Full-Stack Developer*, *Tech Lead*, *QA Engineer*, *Product Manager*) without logging out.
* **📈 Velocity Insights (`/insights`)**: Pipeline health metrics, delivery completion rate gauges, and issue distribution analytics across types and priorities.
* **📜 Reverse-Chronological Audit Trail (`/activity`)**: Real-time event log tracking every issue created, status transition, priority adjustment, and deletion.
* **🔒 Per-User Issue Isolation & Clean Default Workspace**: Every new user and guest account starts with a clean, empty dashboard. Issues created by each user are persistently stored and isolated in MongoDB Atlas.
* **🧪 Interactive Test Mode**: Toggle Test Mode with one click in the navbar or sidebar to populate and explore pre-existing sample sprint tasks without polluting personal workspaces.
* **🛡️ Dual-Mode Persistence**: Primary integration with MongoDB Atlas via Mongoose, with an automatic in-memory fallback demo store ensuring instant offline or evaluation readiness.
* **🎨 Developer-Tailored Theme System**: Dynamic theme engine with curated dark and light palettes (*Midnight Slate*, *Neon Violet*, *Cyberpunk*, *Emerald Minimalist*).

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite 6, Tailwind CSS, React Router v6, Recharts, Lucide React |
| **Backend** | Node.js (v18+), Express.js (ES Modules), Mongoose 8 |
| **Database** | MongoDB Atlas (Cloud) / In-Memory Fallback Store |
| **Security & Utilities** | Helmet, CORS Whitelisting, Morgan Logger, BcryptJS, JWT |
| **Testing** | Node Native Test Runner (`node:test`, `node:assert/strict`), Supertest |
| **Deployment** | Vercel (Client SPA) + Render (Node Web Service) |

---

## 🗂️ Project Structure

```
DevTrack/
├── package.json               # Root monorepo workspace scripts
├── vercel.json                # Root fallback deployment config
│
├── server/                    # Express.js REST API Backend
│   ├── package.json
│   ├── render.yaml            # Render deployment blueprint
│   ├── .env.example
│   └── src/
│       ├── server.js          # HTTP server & graceful shutdown handlers
│       ├── app.js             # Express app & CORS whitelist middleware
│       ├── config/            # Database connector & environment loader
│       ├── models/            # Mongoose schemas (Issue, Activity, User)
│       ├── controllers/       # Route request handlers
│       ├── routes/            # REST endpoint routers
│       ├── services/          # Urgency scoring engine & business logic
│       ├── middleware/        # Input validators & error handlers
│       ├── scripts/           # Database seeder & sample data generator
│       └── tests/             # Unit and integration tests
│
└── client/                    # React + Vite Frontend
    ├── package.json
    ├── vite.config.js         # Vite configuration with chunk splitting
    ├── tailwind.config.js     # Custom design tokens & theme classes
    ├── vercel.json            # Vercel SPA route rewrite rules
    └── src/
        ├── context/           # IssueContext, AuthContext, ThemeContext
        ├── components/        # Modals, Kanban, Navbar, Sidebar, Badges, Toasts
        ├── pages/             # Dashboard, Board, Issues, Insights, Activity, Login
        └── services/          # Centralized API client
```

---

## 🧮 Prioritization Engine Formula

The urgency engine (`server/src/services/prioritizationEngine.js`) dynamically scores tasks to prevent stagnant issues and missed deadlines:

$$\text{Urgency Score} = \text{Base Priority} + \text{Deadline Proximity} + \text{Blocked Penalty} + \text{In-Progress Stagnation}$$

| Factor | Condition | Points |
| :--- | :--- | :--- |
| **Priority Weight** | `Critical` / `High` / `Medium` / `Low` | $+50$ / $+35$ / $+20$ / $+10$ |
| **Deadline Proximity** | Overdue / Due in $\le 24$h / $\le 3$d / $\le 7$d | $+40$ / $+30$ / $+20$ / $+10$ |
| **Blocked Status** | Flagged as `isBlocked: true` | $+15$ |
| **Stagnation** | In Progress $> 7$ days / $> 3$ days | $+15$ / $+10$ |
| **Completion Rule** | Status = `Done` | Urgency resets strictly to **$0$** |

---

## 🚀 Quick Start (Local Development)

### Prerequisites
* **Node.js** v18.0.0 or higher
* **npm** v9.0.0 or higher
* *(Optional)* MongoDB Atlas connection string (or run in fallback offline mode)

### 1. Clone & Install
```bash
git clone https://github.com/Shivams-git/DevTrack.git
cd DevTrack
npm install
```

### 2. Configure Environment Files

**`server/.env`**:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string_here
CLIENT_URL=http://localhost:5173
```
*(If `MONGODB_URI` is left blank, the server automatically boots in its self-contained In-Memory Demo Store mode).*

**`client/.env`**:
```env
VITE_API_URL=http://localhost:5000
```

### 3. Seed Sample Issues *(Optional)*
Populate the database with realistic developer issues, labels, and deadlines:
```bash
npm run seed
```

### 4. Run Both Client & Server
```bash
npm run dev
```
* **Frontend**: [http://localhost:5173](http://localhost:5173)
* **Backend API**: [http://localhost:5000](http://localhost:5000)
* **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check, uptime, and database connection state |
| `GET` | `/api/issues` | Filtered, sorted, and paginated issues list |
| `POST` | `/api/issues` | Create a new issue (generates sequential key e.g. `DT-1`) |
| `GET` | `/api/issues/:id` | Retrieve single issue by ID or key |
| `PATCH` | `/api/issues/:id` | Update issue attributes or workflow status |
| `DELETE` | `/api/issues/:id` | Permanently delete an issue |
| `GET` | `/api/dashboard` | Aggregated sprint KPIs and highest urgency issues |
| `GET` | `/api/insights` | Pipeline velocity and workload distribution metrics |
| `GET` | `/api/activity` | Reverse-chronological activity audit stream |
| `POST` | `/api/auth/login` | User authentication & session generation |

---

## 🧪 Testing

Run native unit and integration tests covering the Prioritization Algorithm, date boundary edge cases, payload validation, and full CRUD operations:

```bash
npm test
```

---

## 🌐 Production Deployment

### Backend (Render)
1. Create a new **Web Service** on [Render](https://render.com) connected to your repository.
2. Set **Root Directory** to `server`.
3. Set **Build Command** to `npm install` and **Start Command** to `node src/server.js`.
4. Configure Environment Variables:
   * `NODE_ENV`: `production`
   * `PORT`: `10000`
   * `MONGODB_URI`: `<Your MongoDB Connection String>`
   * `CLIENT_URL`: `<Your Vercel URL>`

### Frontend (Vercel)
1. Import your repository on [Vercel](https://vercel.com).
2. Set **Root Directory** to `client` and **Framework Preset** to `Vite`.
3. Configure Environment Variable:
   * `VITE_API_URL`: `<Your Render Backend URL>`
4. Click **Deploy**.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
