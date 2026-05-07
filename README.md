# InsightForge
### AI-Powered Business Intelligence Platform

A production-ready full-stack SPA with authentication, CSV history, dark/light mode, and 4 detailed analysis pages — deployable on Vercel + Railway/Render.

𝐏𝐑𝐎𝐉𝐄𝐂𝐓 𝐋𝐈𝐍𝐊 -> https://insight-forge-w4it.vercel.app

---

## 🏗️ Full File Structure

```
insightforge/
│
├── vercel.json                          ← Vercel frontend deployment config
├── docker-compose.yml                   ← Full-stack Docker orchestration
├── README.md
│
├── backend/                             ← Node.js + TypeScript + Apollo GraphQL
│   ├── .env.example
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts                     ← Express + Apollo Server entry
│       ├── types.ts                     ← All TypeScript interfaces
│       ├── graphql/
│       │   ├── schema.ts                ← Full GraphQL schema
│       │   └── resolvers.ts             ← Queries, mutations, auth context
│       ├── services/
│       │   ├── authService.ts           ← JWT register/login/verify
│       │   ├── historyService.ts        ← Per-user CSV history CRUD
│       │   ├── fileService.ts           ← CSV parsing
│       │   ├── forecastingService.ts    ← Linear regression, breakdowns
│       │   ├── anomalyService.ts        ← Z-score detection
│       │   ├── segmentationService.ts   ← RFM clustering
│       │   ├── feedbackService.ts       ← Sentiment + themes
│       │   └── aiService.ts             ← Gemini/OpenAI/Anthropic router
│       └── utils/
│           └── storage.ts               ← Upstash Redis + in-memory fallback
│
└── frontend/                            ← React 18 + TypeScript
    ├── .env.example
    ├── Dockerfile
    ├── package.json
    ├── tsconfig.json
    ├── public/
    │   └── index.html
    └── src/
        ├── App.tsx                      ← SPA router + global state
        ├── index.tsx                    ← React DOM root
        ├── styles/
        │   └── globals.css              ← Design system + dark/light theme
        ├── types/index.ts               ← Frontend TypeScript types
        ├── utils/apollo.ts              ← Apollo client + all GraphQL ops
        ├── components/
        │   ├── auth/
        │   │   ├── Auth.tsx             ← Login + Register modal
        │   │   └── Auth.css
        │   ├── shared/
        │   │   ├── Navbar.tsx           ← Sticky nav with tabs + theme toggle
        │   │   └── Navbar.css
        │   ├── dashboard/
        │   │   ├── Overview.tsx         ← Main dashboard (KPIs + charts + nav)
        │   │   └── Overview.css
        │   └── pages/
        │       ├── Landing.tsx          ← Hero + history panel + features
        │       ├── Landing.css
        │       ├── Upload.tsx           ← Drag-and-drop + progress steps
        │       ├── Upload.css
        │       ├── SalesAnalysis.tsx    ← Full sales detail page
        │       ├── Segmentation.tsx     ← Customer segments detail page
        │       ├── SentimentPage.tsx    ← Sentiment detail page
        │       ├── AIInsights.tsx       ← AI reports detail page
        │       ├── AIInsights.css
        │       └── DetailPage.css       ← Shared detail page styles
```

---

## 🚀 Quick Start (Local)

### 1. Install dependencies
```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install --legacy-peer-deps
```

### 2. Configure environment
```bash
# Backend
cd backend
cp .env.example .env
# Edit .env: add JWT_SECRET, GEMINI_API_KEY (or other AI key)

# Frontend
cd ../frontend
cp .env.example .env
# REACT_APP_GRAPHQL_URL=http://localhost:4000/graphql (already set)
```

### 3. Start development servers
```bash
# Terminal 1 — Backend (http://localhost:4000/graphql)
cd backend && npm run dev

# Terminal 2 — Frontend (http://localhost:3000)
cd frontend && npm start
```

---

## ☁️ Vercel Deployment

### Frontend → Vercel (free)
1. Push project to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Set **Root Directory** to `frontend`
4. Add environment variable: `REACT_APP_GRAPHQL_URL` = your backend URL
5. Deploy

### Backend → Railway (free tier)
1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Set **Root Directory** to `backend`
3. Add all environment variables from `.env.example`
4. Railway auto-detects Dockerfile and deploys

### Persistent Storage → Upstash Redis (free)
1. Go to [upstash.com](https://upstash.com) → Create Redis database (free)
2. Copy `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
3. Add to Railway backend environment variables

---

## 🐳 Docker (Full Stack)

```bash
cp backend/.env.example .env
# Edit .env with your keys

docker-compose up --build

# Frontend: http://localhost:3000
# Backend:  http://localhost:4000/graphql
```

---

## 🔑 Auth Flow

| Action | GraphQL Operation | Notes |
|---|---|---|
| Register | `mutation register(email, password, name)` | Returns JWT + user |
| Login | `mutation login(email, password)` | Returns JWT + user |
| Auto-login | `query me` | Validates stored token |
| Protected ops | All upload/history queries | Require Bearer token header |

---

## 📱 Responsive Design

| Breakpoint | Layout |
|---|---|
| Desktop (>1100px) | 6-column KPI grid, 2-column charts |
| Tablet (768–1100px) | 3-column KPIs, stacked charts |
| Mobile (<768px) | 2-column KPIs, single column, hidden tab labels |
| Small mobile (<480px) | 1-column, simplified navigation |

---

## 🧠 AI Providers

Set `AI_PROVIDER` in backend `.env`:

| Provider | Key Variable | Free Tier |
|---|---|---|
| `gemini` | `GEMINI_API_KEY` | ✅ 1,500 req/day free |
| `openai` | `OPENAI_API_KEY` | Free trial credits |
| `anthropic` | `ANTHROPIC_API_KEY` | Paid |
| (none) | — | Built-in fallback insights |

Get free Gemini key: https://aistudio.google.com/app/apikey

---

## 📊 GraphQL API

```graphql
# Auth
mutation register(email, password, name) → AuthPayload
mutation login(email, password) → AuthPayload
query me → User

# Data
mutation uploadFile(fileContent, fileName) → UploadResult
query getDashboardData(id) → DashboardData
query getUserHistory → [CSVHistory]
mutation deleteHistory(historyId) → Boolean
```

---

## ⚙️ Full-Stack Engineering Concepts Used

| Concept | Implementation |
|---|---|
| JWT Authentication | bcryptjs + jsonwebtoken |
| Persistent Storage | Upstash Redis (serverless-compatible) |
| In-memory fallback | Development mode, no config needed |
| GraphQL API | Apollo Server 4 + typed resolvers |
| Protected routes | Auth context in every resolver |
| Single Page App | View state machine in React |
| Dark/Light mode | CSS variables + data-theme attribute |
| CSV history | Per-user indexed storage with TTL |
| AI multi-provider | Gemini / OpenAI / Anthropic router |
| Statistical models | Z-score anomaly, linear regression |
| RFM Segmentation | Recency, Frequency, Monetary clustering |
| NLP Sentiment | Lexicon-based classification |
| Containerization | Multi-stage Docker builds |
| Vercel-ready | Upstash Redis replaces in-memory store |
