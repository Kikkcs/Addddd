# Technical Architecture
## Project: Internal Business Intelligence Dashboard

### 1. Design Philosophy
- **Modular Monolith:** Code is structured by feature (Sales, Logistics, Users) but runs as a single Node.js process. Prevents over-engineering while remaining scalable.
- **Cheapest Viable Architecture:** Zero managed-database costs. Everything will run on a single affordable VPS via Docker Compose.

### 2. Technology Stack
- **Frontend (UI):** Next.js (TypeScript), TailwindCSS, ShadCN UI for premium dashboard components, Recharts/Chart.js for visualizations.
- **Backend (API):** Node.js with Fastify (for high performance/low overhead), Prisma as the ORM.
- **Database:** PostgreSQL (Self-hosted via Docker).
- **Caching & Job Queue:** Redis (Self-hosted via Docker) + BullMQ for processing incoming webhooks without dropping requests.
- **Authentication:** JWT with Refresh Tokens.
- **Infrastructure:** Ubuntu VPS (e.g., DigitalOcean/Hetzner $5/mo droplet), Nginx (Reverse Proxy), Docker & Docker Compose.

### 3. System Data Flow (Observer Pattern)
1. **Trigger:** A customer interacts with `adeaur.com` or Delhivery updates a tracking status.
2. **Webhook:** Shopify/Delhivery fires an HTTP POST payload to `/api/webhooks/shopify` or `/api/webhooks/delhivery`.
3. **Queue:** Fastify immediately responds `200 OK` and pushes the data to Redis.
4. **Worker:** A background worker safely processes the Redis queue, transforming the JSON data and upserting it into PostgreSQL.
5. **UI Update:** The Next.js frontend pulls the aggregated metrics from the Fastify REST API.

### 4. Cost Optimization Strategy
- **Why no Kubernetes?** Overkill for 20 orders/day and 50 users. Too expensive.
- **Why Self-Hosted Postgres?** Managed DBs cost $15-$50/month. Dockerized Postgres costs $0 (shares the $5 VPS).
- **Cost:** Expected monthly hosting cost: $5 - $10 USD total.

### 5. Code Quality & Standards
- Strict TypeScript mode.
- Centralized Error Handling middleware.
- Environment variables for all secrets (No hardcoding).
- SOLID principles: Controllers handle HTTP, Services handle business logic, Repositories handle database calls.
