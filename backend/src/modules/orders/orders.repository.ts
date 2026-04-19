import prisma from '../../core/database';

export const createOrder = async (userId: number, total: number, paymentMethod: any, items: { productId: number; quantity: number; price: number }[]) => {
  return prisma.order.create({
    data: {
      userId,
      total,
      paymentMethod,
      items: { create: items },
    },
    include: { items: { include: { product: true } } },
  });
};

export const getOrdersByDate = async (date: string) => {
  const start = new Date(date);
  const end = new Date(date);
  end.setDate(end.getDate() + 1);
  return prisma.order.findMany({
    where: { createdAt: { gte: start, lt: end } },
    include: { items: { include: { product: true } }, user: true },
  });
};

export const getAllOrders = async () =>
  prisma.order.findMany({ include: { items: { include: { product: true } }, user: true }, orderBy: { createdAt: 'desc' } });
