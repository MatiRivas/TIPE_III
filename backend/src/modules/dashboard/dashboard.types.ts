export interface DashboardSummary {
  salesSummary: SalesSummary;
  topProducts: TopProduct[];
  inventoryAlerts: InventoryAlert[];
  orderStats: OrderStats;
  paymentBreakdown: PaymentBreakdown[];
  recentTransactions: RecentTransaction[];
}

export interface SalesSummary {
  totalRevenue: number;       // Suma de Order.total
  totalOrders: number;        // Cantidad de órdenes COMPLETED
  averageTicket: number;      // totalRevenue / totalOrders
  totalItemsSold: number;     // Suma de OrderItem.quantity
  date: string;               // Fecha consultada (ISO)
}

export interface TopProduct {
  productId: number;
  name: string;
  quantitySold: number;       // Suma de OrderItem.quantity
  revenue: number;            // Suma de OrderItem.quantity * OrderItem.price
}

export interface InventoryAlert {
  productId: number;
  name: string;
  available: boolean;
  status: 'out';
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

export interface DashboardFilters {
  date?: string;        // ISO date (YYYY-MM-DD), default: hoy
  startDate?: string;   // Para rango de fechas
  endDate?: string;     // Para rango de fechas
}