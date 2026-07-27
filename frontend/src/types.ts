export type PaymentMethod =
  | 'GoKwik UPI'
  | 'GoKwik COD'
  | 'GoKwik COD Verify'
  | 'Standard COD'
  | 'Shopify Pay'
  | 'Net Banking'
  | 'Credit Card';

export type ShippingStatus =
  | 'Pending'
  | 'In Transit'
  | 'Out for Delivery'
  | 'Delivered'
  | 'RTO Initiated'
  | 'RTO Delivered';

export type RtoRisk = 'Low' | 'Medium' | 'High';

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  date: string;
  amount: number;
  itemsCount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'Paid' | 'Pending' | 'Failed' | 'Refunded';
  shippingStatus: ShippingStatus;
  courier: 'Delhivery' | 'BlueDart' | 'Xpressbees' | 'Shadowfax';
  trackingNumber: string;
  destinationCity: string;
  destinationState: string;
  rtoRisk: RtoRisk;
  delayDays?: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  threshold: number; // Low stock warning threshold
  sales30Days: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  isRepeat: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  category: 'Inventory' | 'Orders' | 'Shipping' | 'Payments' | 'System';
  read: boolean;
  severity: 'info' | 'warning' | 'error' | 'success';
}

export interface SavedReport {
  id: string;
  name: string;
  description: string;
  createdOn: string;
  createdBy: string;
  type: 'Financial' | 'Logistics' | 'Sales' | 'AI Forecast';
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Ad-hoc';
}

export interface Integration {
  id: string;
  name: string;
  provider: 'Shopify' | 'Delhivery' | 'GoKwik' | 'Unicommerce' | 'Shiprocket' | 'Razorpay' | 'SMTP' | 'Redis';
  status: 'Connected' | 'Disconnected' | 'Syncing';
  lastSync: string;
  logo: string;
  description: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Admin' | 'Sales' | 'Warehouse' | 'Accounts' | 'Support';
  avatar?: string;
  status: 'Active' | 'Inactive';
}

export interface AIResponse {
  answer: string;
  suggestedQuestions: string[];
  chartsData?: any[];
}
