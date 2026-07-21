# Project Context Summary (Adeaur Dashboard)
**Status:** Paused at the end of Phase 4 (Backend Initialized). Waiting for Frontend UI selection.

## 1. Project Background
- **Business:** Adeaur Perfume (India).
- **Goal:** Centralized Internal Staff Dashboard replacing 3 separate tools (Shopify, Delhivery, GoQwik).
- **Scale Constraints:** System strictly optimized for 30 maximum concurrent users and 30+ orders per day.
- **Workflow (Observer Pattern):** The dashboard securely tracks, calculates, and alerts on data via Webhooks but does not alter the live checkout flow.

## 2. Core KPIs & Data Requirements
- **Financials:** Yesterday vs Today Revenue, Average Order Value (AOV), Payment method splits.
- **Logistics:** Complete tracking lifecycle (Forward & Reverse), RTO count monitoring, Average Delivery Time.
- **Alerts:** Automated Low Stock warnings (< 10 units) and delayed shipment flags.
- **Reporting:** Downloadable comprehensive data reports.
- **Future Integrations:** Meta Ads.

## 3. Architecture & Tech Decisions
- **Philosophy:** Highly Optimized, Highly Secure, Cost-Efficient Modular Monolith.
- **Backend:** Node.js + Fastify (for speed) + Prisma ORM.
- **Frontend:** Next.js (TypeScript) + TailwindCSS.
- **Database:** PostgreSQL. 
- **Task Queue:** Redis + BullMQ (to safely catch inbound Shopify/Delhivery webhooks without dropping them).
- **Security Protocols:** Helmet (strict headers), CORS whitelisting, Bcrypt hashing, strict JWT authentication.
- **Infrastructure:** Docker Compose on a single Ubuntu VPS (Targeting < $10/mo hosting cost).

## 4. Current Workspace State
- Defined all Phase 1 and Phase 2 Requirements and Architecture blueprints in `/docs`.
- Finalized Phase 3 (Prisma PostgreSQL Schema) at `backend/prisma/schema.prisma`.
- Executed Phase 4 (Backend npm initialization, installed Fastify/Helmet, wrote `src/server.ts`).

## 5. Immediate Next Steps
- Start **Phase 5: Frontend** once the UI design/inspiration is decided by the user.
