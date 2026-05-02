export interface User {
  id: string;
  username: string;
  role: 'admin' | 'staff';
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  model: string;
  description?: string;
  imei?: string;
  category: string;
  purchasePrice: number;
  salePrice: number;
  stockQuantity: number;
  lowStockThreshold: number;
  createdAt: number;
}

export interface TransactionItem {
  productId: string;
  name: string;
  brand: string;
  model: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Transaction {
  id: string;
  items: TransactionItem[];
  subtotal: number;
  tax: number;
  total: number;
  cashReceived: number;
  change: number;
  customerName?: string;
  customerPhone?: string;
  timestamp: number;
  staffId: string;
}

export interface DashboardStats {
  totalSalesToday: number;
  totalTransactionsToday: number;
  totalProducts: number;
  lowStockCount: number;
  recentTransactions: Transaction[];
}
