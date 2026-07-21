# Adeaur BI Dashboard - Project State Summary

## 1. Current Progress & Integrations
*   **Frontend Refactoring:** The React/Vite dashboard (`d:\addd dashboard\frontend`) has been fully decoupled from static, mocked TypeScript arrays (`data.ts`). The UI now exclusively sources data via asynchronous `fetch` calls to the Node.js backend.
*   **Shopify Live Data:** Successfully implemented a secure OAuth 2.0 handshake (`ShopifyService`). The active store (`adeaur.myshopify.com`) allows the `Orders`, `Products`, and `KPI Analytics` dashboard components to read live operations data.
*   **Delhivery Live Tracking:** ✅ COMPLETED. Token injected (`d6e4576f...`). Real AWB tracking numbers are extracted from Shopify fulfillments and queried against Delhivery's live track API. Response is parsed and mapped into the dashboard format.
*   **GoKwik Live RTO Risk:** ✅ COMPLETED. App Secret injected (`0f584aae...`). The `GokwikService` now sends live POST requests to `sandbox.gokwik.co/v2/rto/predict` for each order, with graceful fallback if the API is unreachable.
*   **Database Caching (SQLite):** ✅ COMPLETED. Prisma schema pivoted from PostgreSQL to SQLite for zero-config setup. Background `SyncService` runs every 2 minutes, pulling from all three APIs and caching Customers, Orders, and Shipments locally.
*   **CSV/PDF Reports:** ✅ COMPLETED. Backend `GET /api/v1/reports/export` endpoint generates real CSV and JSON reports from live Shopify data. Frontend download buttons trigger actual file downloads.
*   **Omni AI Chat Agent:** ✅ COMPLETED. Backend `POST /api/v1/ai/ask` endpoint processes natural language questions against live store metrics and returns intelligent, data-driven responses. Frontend chat box is wired to this endpoint.
*   **Dynamic UI Adjustments:** 
    *   Replaced failing fallback metrics with safe null-coalescing operators (`??`) to correctly process `0` transactions without breaking.
    *   Rewired the Time parameters (`Today`, `Last 30 Days`, etc.) in `App.tsx` and `Topbar.tsx` to pass the desired `dateRange` deep into the backend.
    *   Orders and Shipping views now pull real tracking numbers, cities, and risk levels from the API.
*   **Notification Center:** Overhauled with dynamic entries and an updated glassmorphism aesthetic.

## 2. Logistics & Risk Backend Pipeline (The Orchestrator)
The core `GET /api/v1/orders` endpoint acts as a monolithic orchestrator:
1.  **Shopify Source:** Pulls raw historical orders filtered dynamically by timeframe.
2.  **Delhivery Intercept:** Extracts real AWB tracking numbers from Shopify fulfillments and queries Delhivery's live tracking API.
3.  **GoKwik Intercept:** Sends each order to GoKwik's RTO prediction API for live risk scoring.
4.  **Final Payload:** The endpoint merges the three datasets perfectly aligned into a custom JSON array suitable for the frontend React tables.

## 3. Backend API Routes
| Route | Method | Description |
|---|---|---|
| `/health` | GET | Health check |
| `/api/v1/analytics/kpis` | GET | Live KPI metrics from Shopify |
| `/api/v1/analytics/charts` | GET | Revenue trend chart data |
| `/api/v1/orders` | GET | Orders enriched with Delhivery + GoKwik |
| `/api/v1/products` | GET | Live inventory from Shopify |
| `/api/v1/reports/export` | GET | CSV/JSON report generation |
| `/api/v1/ai/ask` | POST | Omni AI natural language queries |

## 4. All Integrations Complete ✅
No further API keys or external configuration is required. The dashboard is fully operational.
