import { Order, Product, Customer, Notification, SavedReport, Integration, User } from './types';

// Core Business Health KPIs
export const kpis = {
  todayRevenue: 284500, // INR
  revenueGrowth: 14.2, // % vs yesterday
  todayOrders: 148,
  ordersGrowth: 8.5, // % vs yesterday
  averageOrderValue: 1922, // INR
  aovGrowth: 5.3,
  deliveredOrders: 92,
  inTransit: 215,
  pendingOrders: 42,
  delayedShipmentsCount: 14,
  rtoRate: 12.4, // % Return to Origin rate
  rtoRateChange: -1.8, // -1.8% change vs last week (improvement due to GoKwik RTO blocker)
  lowStockAlerts: 8,
  repeatCustomersRate: 28.5,
};

// 15-day revenue & order trend
const d = (offset: number) => {
  const dt = new Date();
  dt.setDate(dt.getDate() - offset);
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const revenueTrendData = [
  { date: d(14), Revenue: 210000, Orders: 110, COD: 65, Prepaid: 45 },
  { date: d(13), Revenue: 225000, Orders: 118, COD: 70, Prepaid: 48 },
  { date: d(12), Revenue: 198000, Orders: 104, COD: 58, Prepaid: 46 },
  { date: d(11), Revenue: 242000, Orders: 125, COD: 72, Prepaid: 53 },
  { date: d(10), Revenue: 260000, Orders: 135, COD: 80, Prepaid: 55 },
  { date: d(9), Revenue: 235000, Orders: 121, COD: 69, Prepaid: 52 },
  { date: d(8), Revenue: 250000, Orders: 130, COD: 71, Prepaid: 59 },
  { date: d(7), Revenue: 285000, Orders: 148, COD: 78, Prepaid: 70 },
  { date: d(6), Revenue: 290000, Orders: 151, COD: 79, Prepaid: 72 },
  { date: d(5), Revenue: 210000, Orders: 109, COD: 55, Prepaid: 54 },
  { date: d(4), Revenue: 230000, Orders: 119, COD: 62, Prepaid: 57 },
  { date: d(3), Revenue: 275000, Orders: 142, COD: 70, Prepaid: 72 },
  { date: d(2), Revenue: 282000, Orders: 145, COD: 68, Prepaid: 77 },
  { date: d(1), Revenue: 298000, Orders: 154, COD: 72, Prepaid: 82 },
  { date: d(0), Revenue: 284500, Orders: 148, COD: 64, Prepaid: 84 },
];

// Sales by Product Category
export const categoryShareData = [
  { name: 'Apparel & Wear', value: 420000, percentage: 38 },
  { name: 'Footwear', value: 298000, percentage: 27 },
  { name: 'Accessories', value: 165000, percentage: 15 },
  { name: 'Electronics', value: 132000, percentage: 12 },
  { name: 'Home Decor', value: 88000, percentage: 8 },
];

// Courier Performance
export const courierPerformanceData = [
  { name: 'Delhivery', orders: 485, deliveredOnTime: 442, delayed: 28, rto: 15, slaBreachRate: 5.7 },
  { name: 'BlueDart', orders: 195, deliveredOnTime: 184, delayed: 5, rto: 6, slaBreachRate: 2.5 },
  { name: 'Xpressbees', orders: 240, deliveredOnTime: 204, delayed: 22, rto: 14, slaBreachRate: 9.1 },
  { name: 'Shadowfax', orders: 120, deliveredOnTime: 98, delayed: 12, rto: 10, slaBreachRate: 10.0 },
];

// Payment Method Conversion/Distribution (GoKwik Insights)
export const paymentDistributionData = [
  { name: 'GoKwik UPI (1-Click)', value: 142000, count: 75, rtoRisk: 'Low' },
  { name: 'GoKwik COD Verify', value: 88000, count: 42, rtoRisk: 'Medium' },
  { name: 'Standard COD', value: 34000, count: 18, rtoRisk: 'High' },
  { name: 'Shopify Pay (Card)', value: 20500, count: 13, rtoRisk: 'Low' },
];

// Inventory Stock Trend over 6 months
export const inventoryTrendData = [
  { month: 'Feb', InStock: 1200, LowStock: 15, OutOfStock: 2 },
  { month: 'Mar', InStock: 1450, LowStock: 8, OutOfStock: 1 },
  { month: 'Apr', InStock: 1320, LowStock: 22, OutOfStock: 4 },
  { month: 'May', InStock: 1550, LowStock: 12, OutOfStock: 0 },
  { month: 'Jun', InStock: 1680, LowStock: 5, OutOfStock: 1 },
  { month: 'Jul', InStock: 1720, LowStock: 8, OutOfStock: 0 },
];

// Recent Orders
export const recentOrders: Order[] = [
  {
    id: 'ord-1048',
    orderNumber: 'SH-4820',
    customerName: 'Aditya Vardhan',
    customerEmail: 'aditya.v@gmail.com',
    date: '2026-07-17T07:45:00',
    amount: 2499,
    itemsCount: 2,
    paymentMethod: 'GoKwik UPI',
    paymentStatus: 'Paid',
    shippingStatus: 'Pending',
    courier: 'Delhivery',
    trackingNumber: 'DEL92348123',
    destinationCity: 'Gurugram',
    destinationState: 'Haryana',
    rtoRisk: 'Low',
  },
  {
    id: 'ord-1047',
    orderNumber: 'SH-4819',
    customerName: 'Neha Deshmukh',
    customerEmail: 'neha.d@yahoo.com',
    date: '2026-07-17T06:30:00',
    amount: 1850,
    itemsCount: 1,
    paymentMethod: 'GoKwik COD Verify',
    paymentStatus: 'Pending',
    shippingStatus: 'In Transit',
    courier: 'Delhivery',
    trackingNumber: 'DEL92348122',
    destinationCity: 'Mumbai',
    destinationState: 'Maharashtra',
    rtoRisk: 'Medium',
  },
  {
    id: 'ord-1046',
    orderNumber: 'SH-4818',
    customerName: 'Rajesh Nair',
    customerEmail: 'rajesh.nair@hotmail.com',
    date: '2026-07-17T05:12:00',
    amount: 4120,
    itemsCount: 3,
    paymentMethod: 'GoKwik UPI',
    paymentStatus: 'Paid',
    shippingStatus: 'In Transit',
    courier: 'BlueDart',
    trackingNumber: 'BD71249581',
    destinationCity: 'Bengaluru',
    destinationState: 'Karnataka',
    rtoRisk: 'Low',
  },
  {
    id: 'ord-1045',
    orderNumber: 'SH-4817',
    customerName: 'Priya Sharma',
    customerEmail: 'priya.sharma99@gmail.com',
    date: '2026-07-17T04:20:00',
    amount: 999,
    itemsCount: 1,
    paymentMethod: 'Standard COD',
    paymentStatus: 'Pending',
    shippingStatus: 'In Transit',
    courier: 'Xpressbees',
    trackingNumber: 'XB492049102',
    destinationCity: 'Patna',
    destinationState: 'Bihar',
    rtoRisk: 'High', // Standard COD to high risk tier
    delayDays: 2,
  },
  {
    id: 'ord-1044',
    orderNumber: 'SH-4816',
    customerName: 'Amit Saxena',
    customerEmail: 'amit.s@gmail.com',
    date: '2026-07-16T22:30:00',
    amount: 3250,
    itemsCount: 2,
    paymentMethod: 'Credit Card',
    paymentStatus: 'Paid',
    shippingStatus: 'Delivered',
    courier: 'Delhivery',
    trackingNumber: 'DEL92348099',
    destinationCity: 'Noida',
    destinationState: 'Uttar Pradesh',
    rtoRisk: 'Low',
  },
  {
    id: 'ord-1043',
    orderNumber: 'SH-4815',
    customerName: 'Vikram Malhotra',
    customerEmail: 'v.malhotra@outlook.com',
    date: '2026-07-16T21:05:00',
    amount: 1599,
    itemsCount: 1,
    paymentMethod: 'GoKwik UPI',
    paymentStatus: 'Paid',
    shippingStatus: 'Delivered',
    courier: 'Shadowfax',
    trackingNumber: 'SF9930491',
    destinationCity: 'Chennai',
    destinationState: 'Tamil Nadu',
    rtoRisk: 'Low',
  },
  {
    id: 'ord-1042',
    orderNumber: 'SH-4814',
    customerName: 'Sanjay Dutt',
    customerEmail: 'sanjay.dutt@gmail.com',
    date: '2026-07-16T19:45:00',
    amount: 1250,
    itemsCount: 1,
    paymentMethod: 'GoKwik COD Verify',
    paymentStatus: 'Pending',
    shippingStatus: 'RTO Initiated', // High RTO trigger
    courier: 'Xpressbees',
    trackingNumber: 'XB492049081',
    destinationCity: 'Jhansi',
    destinationState: 'Uttar Pradesh',
    rtoRisk: 'High',
    delayDays: 3,
  },
  {
    id: 'ord-1041',
    orderNumber: 'SH-4813',
    customerName: 'Ananya Roy',
    customerEmail: 'ananya.roy@yahoo.com',
    date: '2026-07-16T18:15:00',
    amount: 2199,
    itemsCount: 2,
    paymentMethod: 'GoKwik UPI',
    paymentStatus: 'Paid',
    shippingStatus: 'In Transit',
    courier: 'Delhivery',
    trackingNumber: 'DEL92348045',
    destinationCity: 'Kolkata',
    destinationState: 'West Bengal',
    rtoRisk: 'Low',
    delayDays: 1,
  }
];

// Low Stock Products
export const products: Product[] = [
  { id: 'prod-1', name: 'AeroStride Lightweight Running Shoes', sku: 'AS-RN-09-BL', category: 'Footwear', price: 2999, stock: 4, threshold: 15, sales30Days: 145, status: 'Low Stock' },
  { id: 'prod-2', name: 'CosmoCraft Smart Quartz Watch', sku: 'CW-SQ-42-BK', category: 'Accessories', price: 5499, stock: 0, threshold: 10, sales30Days: 82, status: 'OutOfStock' as any }, // Wait, map to Out of Stock
  { id: 'prod-3', name: 'TitanShield Water-Resistant BackPack', sku: 'TS-BP-25-GR', category: 'Accessories', price: 1899, stock: 7, threshold: 20, sales30Days: 190, status: 'Low Stock' },
  { id: 'prod-4', name: 'FlexFit Breathable Gym Tee', sku: 'FF-GT-MD-BL', category: 'Apparel & Wear', price: 899, stock: 12, threshold: 40, sales30Days: 320, status: 'Low Stock' },
  { id: 'prod-5', name: 'SoundSurge Wireless ANC Headphones', sku: 'SS-HP-ANC-BK', category: 'Electronics', price: 4299, stock: 3, threshold: 10, sales30Days: 74, status: 'Low Stock' },
  { id: 'prod-6', name: 'AeroWeave Knit Active Socks (3-Pack)', sku: 'AW-SK-SZ-WH', category: 'Apparel & Wear', price: 499, stock: 18, threshold: 50, sales30Days: 240, status: 'Low Stock' },
  { id: 'prod-7', name: 'ZenLite Premium Yoga Mat', sku: 'ZL-YM-06-PU', category: 'Accessories', price: 1299, stock: 42, threshold: 15, sales30Days: 88, status: 'In Stock' },
  { id: 'prod-8', name: 'HydraBolt Thermal Flask 1000ml', sku: 'HB-TF-1L-SL', category: 'Accessories', price: 1099, stock: 95, threshold: 20, sales30Days: 110, status: 'In Stock' }
];

// Top Customers
export const topCustomers: Customer[] = [
  { id: 'cust-1', name: 'Kabir Kapoor', email: 'kabir.kapoor@gmail.com', phone: '+91 98765 43210', city: 'Mumbai', totalOrders: 18, totalSpent: 42500, lastOrderDate: '2026-07-15', isRepeat: true },
  { id: 'cust-2', name: 'Meera Iyer', email: 'meera.iyer@outlook.com', phone: '+91 98123 45678', city: 'Chennai', totalOrders: 14, totalSpent: 38200, lastOrderDate: '2026-07-16', isRepeat: true },
  { id: 'cust-3', name: 'Rohan Verma', email: 'rohan.v@gmail.com', phone: '+91 99000 88888', city: 'Delhi', totalOrders: 12, totalSpent: 31800, lastOrderDate: '2026-07-17', isRepeat: true },
  { id: 'cust-4', name: 'Shweta Pandey', email: 'shweta.p@gmail.com', phone: '+91 97777 66666', city: 'Bengaluru', totalOrders: 11, totalSpent: 29500, lastOrderDate: '2026-07-14', isRepeat: true },
  { id: 'cust-5', name: 'Tushar Mehta', email: 'tushar.mehta@yahoo.com', phone: '+91 95555 44444', city: 'Pune', totalOrders: 9, totalSpent: 22800, lastOrderDate: '2026-07-13', isRepeat: true }
];

// Active and Future Integrations
export const integrations: Integration[] = [
  {
    id: 'int-shopify',
    name: 'Shopify Store',
    provider: 'Shopify',
    status: 'Connected',
    lastSync: '2 minutes ago',
    logo: 'ShopifyLogo',
    description: 'Syncs products, customers, and order lifecycle live from your Shopify merchant account.',
  },
  {
    id: 'int-delhivery',
    name: 'Delhivery Unified logistics',
    provider: 'Delhivery',
    status: 'Connected',
    lastSync: 'Just now',
    logo: 'Truck',
    description: 'Polls real-time shipment routing, tracking states, courier assignments, and RTO events.',
  },
  {
    id: 'int-gokwik',
    name: 'GoKwik Checkout Engine',
    provider: 'GoKwik',
    status: 'Connected',
    lastSync: 'Just now',
    logo: 'Zap',
    description: 'Secures one-click checkout, verify Cash-on-Delivery orders, and predicts RTO risks.',
  },
  {
    id: 'int-unicommerce',
    name: 'Unicommerce ERP',
    provider: 'Unicommerce',
    status: 'Disconnected',
    lastSync: 'Never',
    logo: 'Layers',
    description: 'Enterprise multi-warehouse management and item dispatch flow integrations.',
  },
  {
    id: 'int-shiprocket',
    name: 'Shiprocket aggregator',
    provider: 'Shiprocket',
    status: 'Disconnected',
    lastSync: 'Never',
    logo: 'Box',
    description: 'Alternative multi-courier aggregator integration for secondary logistics networks.',
  },
  {
    id: 'int-smtp',
    name: 'SendGrid SMTP Service',
    provider: 'SMTP',
    status: 'Connected',
    lastSync: 'Just now',
    logo: 'Mail',
    description: 'Enterprise transactional email relay for Order Confirmations and alerts.',
  },
  {
    id: 'int-redis',
    name: 'Redis Queue Manager',
    provider: 'Redis',
    status: 'Connected',
    lastSync: 'Just now',
    logo: 'Database',
    description: 'In-memory data structure store, used as a message broker for BullMQ async jobs and cache.',
  }
];

// System Notifications list
export const notifications: Notification[] = [
  {
    id: 'notif-1',
    title: 'Low Stock Alert',
    message: 'AeroStride Running Shoes (AS-RN-09-BL) has only 4 units remaining. Sales velocity suggests stock out in 18 hours.',
    timestamp: '15 mins ago',
    category: 'Inventory',
    read: false,
    severity: 'error',
  },
  {
    id: 'notif-2',
    title: 'Delhivery SLA Delay',
    message: 'Shipment XB492049102 to Patna has been delayed at Varanasi hub by 48 hrs. Expected SLA breach.',
    timestamp: '42 mins ago',
    category: 'Shipping',
    read: false,
    severity: 'warning',
  },
  {
    id: 'notif-3',
    title: 'High RTO Risk Blocked',
    message: 'GoKwik automated checkout intercepted and blocked high RTO risk COD user (8 RTOs in last 30 days) in Kolkata.',
    timestamp: '1 hour ago',
    category: 'Payments',
    read: false,
    severity: 'success',
  },
  {
    id: 'notif-4',
    title: 'Shopify Webhook Status',
    message: 'Webhook batch sync complete. 128 orders synchronized successfully.',
    timestamp: '2 hours ago',
    category: 'System',
    read: true,
    severity: 'info',
  },
  {
    id: 'notif-5',
    title: 'Stockout Event',
    message: 'CosmoCraft Smart Quartz Watch (CW-SQ-42-BK) is completely out of stock. 12 backorders recorded.',
    timestamp: '4 hours ago',
    category: 'Inventory',
    read: true,
    severity: 'error',
  }
];

// Saved and scheduled reports
export const savedReports: SavedReport[] = [
  { id: 'rep-1', name: 'Monthly Financial Audit - June 2026', description: 'Reconciliation report crossing Shopify order revenues against GoKwik payment modes and bank payouts.', createdOn: '2026-07-01', createdBy: 'Accounts Team (Prerna)', type: 'Financial', frequency: 'Monthly' },
  { id: 'rep-2', name: 'GoKwik RTO Mitigation Effectiveness', description: 'Detailed study on return-to-origin rates comparing verify checkout blocklists with historical COD RTO figures.', createdOn: '2026-07-15', createdBy: 'Admin (Sumit)', type: 'AI Forecast', frequency: 'Weekly' },
  { id: 'rep-3', name: 'Delhivery Hub Logistics Transit Matrix', description: 'Analysis of transit times across states, detailing delayed shipments, courier SLA breaches, and hub halts.', createdOn: '2026-07-10', createdBy: 'Warehouse Team (Ankit)', type: 'Logistics', frequency: 'Weekly' },
  { id: 'rep-4', name: 'Low Stock Velocity restock report', description: 'Auto-predicted restocking ledger identifying high sales velocity items breaching re-order margins.', createdOn: '2026-07-16', createdBy: 'System AI', type: 'Sales', frequency: 'Daily' }
];

// Internal team users removed for Real Backend Database mapping.

// Pre-baked answers for "Ask AI" to simulate premium Apple/Notion feel, returning highly intelligent, realistic diagnostic answers!
export const askAiLibrary: Record<string, { answer: string, suggestedQuestions: string[] }> = {
  default: {
    answer: "Welcome to Adeaur AI. Ask me about **today's sales drop**, **RTO risks**, **hub delays**, or **items needing replenishment**. For example, try clicking one of the quick prompt suggestions below.",
    suggestedQuestions: [
      "Why did sales drop today?",
      "Which items are low in stock?",
      "What is Delhivery's SLA breach rate this week?",
      "How is GoKwik performing on RTO reduction?"
    ]
  },
  "sales drop": {
    answer: "Today's sales dip (₹2,84,500 vs average ₹3,10,000) is caused by a **temporary drop in standard COD conversions** between 2 PM and 4 PM due to a known payment gateway handshake delay. However, **GoKwik UPI 1-Click checkout** converted at an all-time high of **48.2%** of total carts, keeping our net AOV steady at **₹1,922** (+5.3% growth vs yesterday).",
    suggestedQuestions: [
      "Is the payment gateway active now?",
      "How can we boost prepaid checkouts?",
      "Show UPI performance metrics."
    ]
  },
  "stock": {
    answer: "We have **8 Low Stock Alerts** today. **AeroStride Lightweight Running Shoes** is the most critical: only **4 units** remaining with 30-day velocity of **145 units**, indicating a stockout will occur within **18 hours**. Additionally, **CosmoCraft Smart Quartz Watch** is completely **Out of Stock** with 12 backorders logged from Shopify.",
    suggestedQuestions: [
      "Create reorder PO for AeroStride",
      "Which suppliers handle AeroStride?",
      "Who purchased CosmoCraft watches?"
    ]
  },
  "rto": {
    answer: "GoKwik integrations have successfully held our RTO (Return to Origin) rate to **12.4%** (a **1.8% drop** week-on-week, which equates to over **₹65,000 saved** in two-way courier fees). Today, GoKwik automated risk engines successfully **intercepted and blocked 4 extremely high-risk COD requests** in Bihar and West Bengal based on users historical rejection patterns across Delhivery and Shadowfax networks.",
    suggestedQuestions: [
      "What is the average shipping fee lost per RTO?",
      "How does RTO risk correlate with states?",
      "Can we disable Standard COD entirely?"
    ]
  },
  "delhivery": {
    answer: "Delhivery's SLA adherence is at **94.3%** today (485 total orders fulfilled). However, we are tracking **14 delayed shipments** breaching standard timelines. The primary bottleneck is the **Varanasi hub**, where 4 shipments bound for Patna have been halted for 48 hours. **Xpressbees** is our lowest logistics performer this week, with a **9.1% SLA breach rate** due to heavy rainfall disruptions in Northeast regions.",
    suggestedQuestions: [
      "Check shipment details for Varanasi hub",
      "Which orders are delayed?",
      "Switch Patna shipments to BlueDart"
    ]
  }
};
