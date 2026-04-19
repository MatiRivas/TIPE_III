import { PrismaClient, OrderStatus } from '@prisma/client';
import {
  SalesSummary,
  TopProduct,
  InventoryAlert,
  OrderStats,
  PaymentBreakdown,
  RecentTransaction,
  DashboardFilters,
} from './dashboard.types';

export class DashboardRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private getDateRange(filters: DashboardFilters): { gte: Date; lte: Date } {
    if (filters.startDate && filters.endDate) {
      const start = new Date(filters.startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999);
      return { gte: start, lte: end };
    }
    const day = filters.date ? new Date(filters.date) : new Date();
    const start = new Date(day); start.setHours(0, 0, 0, 0);
    const end   = new Date(day); end.setHours(23, 59, 59, 999);
    return { gte: start, lte: end };
  }

  async getSalesSummary(filters: DashboardFilters): Promise<SalesSummary> {
    const range = this.getDateRange(filters);
    const aggregate = await this.prisma.order.aggregate({
      where: { createdAt: range, status: OrderStatus.COMPLETED },
      _sum: { total: true },
      _count: { id: true },
    });
    const itemsAggregate = await this.prisma.orderItem.aggregate({
      where: { order: { createdAt: range, status: OrderStatus.COMPLETED } },
      _sum: { quantity: true },
    });
    const totalRevenue  = aggregate._sum.total ?? 0;
    const totalOrders   = aggregate._count.id ?? 0;
    const totalItemsSold = itemsAggregate._sum.quantity ?? 0;
    const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    return {
      totalRevenue,
      totalOrders,
      averageTicket: Math.round(averageTicket * 100) / 100,
      totalItemsSold,
      date: filters.date ?? new Date().toISOString().split('T')[0],
    };
  }

  async getTopProducts(filters: DashboardFilters, limit: number): Promise<TopProduct[]> {
    const range = this.getDateRange(filters);
    const grouped = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      where: { order: { createdAt: range, status: OrderStatus.COMPLETED } },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: limit,
    });
    if (grouped.length === 0) return [];
    const productIds = grouped.map((g) => g.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, price: true },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));
    return grouped.map((g) => {
      const product = productMap.get(g.productId);
      const quantitySold = g._sum.quantity ?? 0;
      return {
        productId: g.productId,
        name: product?.name ?? 'Desconocido',
        quantitySold,
        revenue: Math.round(quantitySold * (product?.price ?? 0) * 100) / 100,
      };
    });
  }

  // ✅ Corregido — solo productos no disponibles, sin stock ni minStock
  async getInventoryAlerts(): Promise<InventoryAlert[]> {
    const products = await this.prisma.product.findMany({
      where: { available: false },
      select: { id: true, name: true, available: true },
    });
    return products.map((p) => ({
      productId: p.id,
      name: p.name,
      available: p.available,
      status: 'out' as const,
    }));
  }

  async getOrderStats(filters: DashboardFilters): Promise<OrderStats> {
    const range = this.getDateRange(filters);
    const [total, completed, pending, cancelled] = await Promise.all([
      this.prisma.order.count({ where: { createdAt: range } }),
      this.prisma.order.count({ where: { createdAt: range, status: OrderStatus.COMPLETED } }),
      this.prisma.order.count({ where: { createdAt: range, status: OrderStatus.PENDING } }),
      this.prisma.order.count({ where: { createdAt: range, status: OrderStatus.CANCELLED } }),
    ]);
    return { totalOrders: total, completedOrders: completed, pendingOrders: pending, cancelledOrders: cancelled };
  }

  async getPaymentBreakdown(filters: DashboardFilters): Promise<PaymentBreakdown[]> {
    const range = this.getDateRange(filters);
    const grouped = await this.prisma.order.groupBy({
      by: ['paymentMethod'],
      where: { createdAt: range, status: OrderStatus.COMPLETED },
      _sum: { total: true },
      _count: { id: true },
    });
    return grouped.map((g) => ({
      method: g.paymentMethod as 'CASH' | 'CARD',
      totalAmount: Math.round((g._sum.total ?? 0) * 100) / 100,
      orderCount: g._count.id,
    }));
  }

  async getRecentTransactions(filters: DashboardFilters, limit: number): Promise<RecentTransaction[]> {
    const range = this.getDateRange(filters);
    const orders = await this.prisma.order.findMany({
      where: { createdAt: range, status: OrderStatus.COMPLETED },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: { select: { name: true } },
        items: { select: { quantity: true } },
      },
    });
    return orders.map((o) => ({
      orderId: o.id,
      createdAt: o.createdAt.toISOString(),
      total: o.total,
      paymentMethod: o.paymentMethod as 'CASH' | 'CARD',
      status: o.status,
      itemCount: o.items.reduce((sum, i) => sum + i.quantity, 0),
      sellerName: o.user?.name ?? 'N/A',
    }));
  }
}