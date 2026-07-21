# Functional Requirement Document (FRD)
## Project: Internal Business Intelligence Dashboard

### 1. Overview
The goal of this project is to build a centralized, internal BI dashboard for an e-commerce business operating on Shopify. The system will unify data across Shopify, Delhivery, and GoQwik, eliminating the need to cross-check multiple tools to understand daily business health.

### 2. Business Context
- **Business Scale:** Standard volume (Designed for 30+ limit per day and supporting 30 concurrent staff users effortlessly).
- **Tenancy:** Single-store / Single-tenant architecture (adeaur.com).
- **Region:** India (IST Timezone, INR Currency).
- **Users:** Single permission level (Admin). All staff log in with full view access.

### 3. Core Features
The system is built on a **Non-Intrusive / Observer Pattern**. It reads data via webhooks and APIs but does not interfere with live store operations.

#### 3.1 KPIs & Dashboard Visualizations
The main screen must immediately display:
- **Financials:** Today/Yesterday/Week/Month Revenue, AOV, Sales trends.
- **Logistics:** In Transit, Delivered, Delayed, RTO count, Average delivery time.
- **Orders:** Placed today, Pending, Packed, Cancelled/Refunded.
- **Products:** Fast movers, slow movers, low stock alerts, revenue by product.
- **Customers:** New vs. Returning, highest-value customers.
- **Payments:** Success, Failed, Pending COD.

#### 3.2 Reporting Engine
The system must generate downloadable reports (Excel/CSV/PDF):
- Sales Report
- Inventory Report
- Shipment Report
- Customer Report
- Financial/Tax (GST) Report

#### 3.3 Alerting & Notifications system
The system must flag:
- Low stock items.
- Delayed shipments.
- Anomalies (sales drops/spikes).
- Webhook/API integration failures.

### 4. Future Roadmap
- Integration with Meta Ads for marketing ROI tracking.
