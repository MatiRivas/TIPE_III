import prisma from '../../core/database';
import { CreateOrderDTO } from './orders.types';
import { createOrder, getAllOrders, getOrdersByDate } from './orders.repository';
import { getIO } from '../../core/socket';

export const placeOrder = async (userId: number, dto: CreateOrderDTO) => {
  let total = 0;
  const items: { productId: number; quantity: number; price: number }[] = [];

  // Busca descuentos activos una sola vez
  const activeDiscounts = await prisma.discount.findMany({
    where: { active: true },
    include: {
      products: { select: { productId: true } },
    },
  });

  for (const item of dto.items) {
    const product = await prisma.product.findUnique({ where: { id: item.productId } });
    if (!product) throw { status: 404, message: `Producto ${item.productId} no encontrado` };
    if (!product.available) throw { status: 400, message: `${product.name} no está disponible` };

    // Busca si hay un descuento activo que aplique a este producto
    const applicable = activeDiscounts.find(
      (d) =>
        d.applyToAll ||
        d.products.some((p) => p.productId === item.productId)
    );

    const finalPrice = applicable
      ? Math.round(product.price * (1 - applicable.percentage / 100))
      : product.price;

    total += finalPrice * item.quantity;
    items.push({ productId: item.productId, quantity: item.quantity, price: finalPrice });
  }

  const order = await createOrder(userId, total, dto.paymentMethod, items);
  getIO().emit('orders:updated');
  getIO().emit('dashboard:updated');
  return order;
};

export const listOrders = () => getAllOrders();
export const ordersByDate = (date: string) => getOrdersByDate(date);