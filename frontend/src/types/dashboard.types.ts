export interface DashboardFilters {
  date?: string;
  startDate?: string;
  endDate?: string;
}

export interface DashboardSummary {
  salesSummary: SalesSummary;
  topProducts: TopProduct[];
  inventoryAlerts: InventoryAlert[];
  orderStats: OrderStats;
  paymentBreakdown: PaymentBreakdown[];
  recentTransactions: RecentTransaction[];
}

export interface SalesSummary {
  totalRevenue: number;
  totalOrders: number;
  averageTicket: number;
  totalItemsSold: number;
  date: string;
}

export interface TopProduct {
  productId: number;
  name: string;
  quantitySold: number;
  revenue: number;
}

export interface InventoryAlert {
  productId: number;
  name: string;
  currentStock: number;
  minStock: number;
  status: 'low' | 'out';
}

export interface OrderStats {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
}

export interface PaymentBreakdown {
  method: 'CASH' | 'CARD';
  totalAmount: number;
  orderCount: number;
}

export interface RecentTransaction {
  orderId: number;
  createdAt: string;
  total: number;
  paymentMethod: 'CASH' | 'CARD';
  status: string;
  itemCount: number;
  sellerName: string;
}