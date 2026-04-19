import prisma from '../../core/database';
import type { ReportFilters, SalesReportRow } from './reports.types';

export const normalizeRange = (filters: ReportFilters) => {
  if (filters.startDate && filters.endDate) {
    const start = new Date(filters.startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(filters.endDate);
    end.setHours(23, 59, 59, 999);
    return { from: start, to: end };
  }

  const base = filters.date ? new Date(filters.date) : new Date();
  const from = new Date(base);
  from.setHours(0, 0, 0, 0);
  const to = new Date(base);
  to.setHours(23, 59, 59, 999);
  return { from, to };
};

export const getSalesRows = async (from: Date, to: Date): Promise<SalesReportRow[]> => {
  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: from, lte: to }, status: 'COMPLETED' },
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true } },
      items: { include: { product: { select: { name: true } } } },
    },
  });

  return orders.map((order) => ({
    orderId: order.id,
    createdAt: order.createdAt,
    total: order.total,
    paymentMethod: order.paymentMethod,
    status: order.status,
    user: order.user,
    items: order.items,
  }));
};

export const getOrdersCount = async (from: Date, to: Date) => {
  return prisma.order.count({ where: { createdAt: { gte: from, lte: to }, status: 'COMPLETED' } });
};
