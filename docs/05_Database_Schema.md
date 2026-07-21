# Database Schema (Phase 3)
## Project: Internal Business Intelligence Dashboard

### 1. Database Choice
We are using **PostgreSQL** as it is open-source, robust, and handles relational financial data flawlessly. 
The schema is written below using **Prisma ORM** format, which will automatically generate our database tables and give us full TypeScript safety on the backend.

### 2. Prisma Schema Definition

```prisma
// This is the blueprint for our PostgreSQL database

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ---------------------------------------------------------
// 1. SYSTEM USERS (Dashboard Access)
// ---------------------------------------------------------
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String   // Hashed via Bcrypt
  role      String   @default("ADMIN")
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// ---------------------------------------------------------
// 2. E-COMMERCE DATA (Synced from Shopify)
// ---------------------------------------------------------
model Customer {
  id               String   @id @default(uuid())
  shopifyId        String   @unique // The ID from Shopify
  firstName        String?
  lastName         String?
  email            String?
  phone            String?
  totalSpent       Float    @default(0.0)
  ordersCount      Int      @default(0)
  
  orders           Order[]
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}

model Product {
  id               String   @id @default(uuid())
  shopifyId        String   @unique
  title            String
  vendor           String?
  productType      String?
  status           String   @default("ACTIVE")
  
  variants         ProductVariant[]
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}

model ProductVariant {
  id               String   @id @default(uuid())
  shopifyId        String   @unique
  productId        String
  title            String
  sku              String?
  price            Float
  inventoryCount   Int      @default(0) // Crucial for low-stock alerts
  
  product          Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  lineItems        OrderLineItem[]
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}

// ---------------------------------------------------------
// 3. CORE BUSINESS DATA (Orders & Analytics)
// ---------------------------------------------------------
model Order {
  id               String   @id @default(uuid())
  shopifyId        String   @unique
  orderNumber      String   @unique // e.g. #1001
  customerId       String?
  
  // Financials
  totalPrice       Float
  subtotalPrice    Float
  totalTax         Float
  totalDiscounts   Float
  currency         String   @default("INR")
  
  // Statuses
  paymentStatus    String   // e.g. PAID, PENDING
  paymentMethod    String?  // e.g. GoQwik, COD, Razorpay
  fulfillmentStatus String  // e.g. UNFULFILLED, FULFILLED
  
  // Relations
  customer         Customer? @relation(fields: [customerId], references: [id])
  lineItems        OrderLineItem[]
  shipment         Shipment? // One-to-one or one-to-many depending on split shipments
  
  // Timestamps (Crucial for Daily/Weekly Revenue Reports)
  orderPlacedAt    DateTime
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}

model OrderLineItem {
  id               String   @id @default(uuid())
  orderId          String
  variantId        String?
  title            String
  quantity         Int
  price            Float
  
  order            Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  variant          ProductVariant? @relation(fields: [variantId], references: [id])
}

// ---------------------------------------------------------
// 4. LOGISTICS (Synced from Delhivery)
// ---------------------------------------------------------
model Shipment {
  id               String   @id @default(uuid())
  orderId          String   @unique
  waybill          String   @unique // AWB Number
  
  // Tracking
  status           String   // e.g. DISPATCHED, IN_TRANSIT, DELIVERED, RTO
  courierName      String   @default("Delhivery")
  
  // Timestamps for performance KPIs
  dispatchedAt     DateTime?
  deliveredAt      DateTime?
  returnedAt       DateTime? // For RTOs
  
  order            Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}
```

### 3. Key Design Decisions for KPIs:
1. **Low Stock Alerts:** We track `inventoryCount` in `ProductVariant`. A simple daily cron job can query `WHERE inventoryCount < 10` to trigger an alert.
2. **Yesterday vs Today Sales:** The `orderPlacedAt` field securely logs the exact time of the sale. We will use SQL aggregate functions locally to graph revenue without pinging Shopify.
3. **RTO & Delivery Performance:** The `Shipment` table uses `dispatchedAt` and `deliveredAt` so we can easily calculate average delivery time. The `status` field explicitly tracks `RTO` for immediate visibility.
