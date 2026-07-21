# API & System Structure
## Project: Internal Business Intelligence Dashboard

### 1. Folder Structure (Modular Monolith)
The project will be split into a frontend and backend directory.
```text
/addd-dashboard
├── /frontend               # Next.js Application
│   ├── /src
│   │   ├── /app            # App Router (Pages: Dashboard, Orders, Settings)
│   │   ├── /components     # UI Components (ShadCN, Charts, Cards)
│   │   ├── /hooks          # React Query hooks for fetching API data
│   │   └── /lib            # Zustand state, Axios instances, formatting utilities
├── /backend                # Node.js + Fastify Application
│   ├── /prisma             # Database schema & migrations
│   ├── /src
│   │   ├── /modules
│   │   │   ├── /auth       # Login, JWT issuing, Password Hashing
│   │   │   ├── /webhooks   # Shopify/Delhivery webhook receivers
│   │   │   ├── /orders     # Order APIs and DB operations
│   │   │   ├── /analytics  # Calculation engine for KPIs
│   │   │   └── /jobs       # BullMQ Background Workers
│   │   ├── /config         # Environment variables & constants
│   │   └── server.ts       # Fastify instance initialization
└── docker-compose.yml      # Infrastructure setup (Postgres + Redis)
```

### 2. General API Design (RESTful)
All endpoints will be prefixed with `/api/v1/`.
- `POST /api/v1/auth/login` - Authenticate admin users.
- `GET /api/v1/analytics/kpis` - Fetch core dashboard widgets.
- `GET /api/v1/orders` - Fetch paginated list of orders with filters.
- `GET /api/v1/reports/sales` - Download CSV/Excel.

### 3. Webhook Design & Background Jobs
Webhooks must never drop data.
- **Shopify Endpoint:** `POST /api/v1/webhooks/shopify`
- **Delhivery Endpoint:** `POST /api/v1/webhooks/delhivery`
- **Flow:** When a webhook arrives, the backend immediately places the raw JSON string into a Redis Queue named `shopify-events` or `delhivery-events` and replies to the sender with `HTTP 200 OK`. 
- **Worker:** A separate BullMQ worker picks up the event from Redis, formats the data, and securely Upserts it into the PostgreSQL database.

### 4. Authentication Design
- **Method:** JSON Web Tokens (JWT).
- **Security:** Access Token expires in 15 minutes. Refresh Token (stored in a secure HTTP-Only cookie) lasts 7 days.
- **RBAC:** Since all users are currently treated as Admin, roles are simplified. We will include a static `role: "ADMIN"` in the token so RBAC can be easily extended in the future.
- **Passwords:** Hashed using Bcrypt with a work factor of 12.
