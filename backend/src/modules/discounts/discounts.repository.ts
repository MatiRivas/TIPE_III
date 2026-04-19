import prisma from '../../core/database';
import { CreateDiscountDto, UpdateDiscountDto } from './discounts.types';

const include = {
  products: {
    include: {
      product: { select: { id: true, name: true } },
    },
  },
};

const formatDiscount = (d: any) => ({
  ...d,
  products: d.products.map((pd: any) => pd.product),
  productIds: d.products.map((pd: any) => pd.product.id),
});

export const discountsRepository = {
  findAll: async () => {
    const discounts = await prisma.discount.findMany({
      include,
      orderBy: { createdAt: 'desc' },
    });
    return discounts.map(formatDiscount);
  },

  create: async (dto: CreateDiscountDto) => {
    const d = await prisma.discount.create({
      data: {
        name: dto.name,
        percentage: dto.percentage,
        applyToAll: dto.applyToAll,
        products: dto.applyToAll
          ? undefined
          : { create: dto.productIds.map((productId) => ({ productId })) },
      },
      include,
    });
    return formatDiscount(d);
  },

  toggle: async (id: number) => {
    const current = await prisma.discount.findUnique({ where: { id } });
    if (!current) throw new Error('Descuento no encontrado');
    const d = await prisma.discount.update({
      where: { id },
      data: { active: !current.active },
      include,
    });
    return formatDiscount(d);
  },

  update: async (id: number, dto: UpdateDiscountDto) => {
    const d = await prisma.$transaction(async (tx) => {
      if (dto.productIds !== undefined) {
        await tx.productDiscount.deleteMany({ where: { discountId: id } });
      }
      return tx.discount.update({
        where: { id },
        data: {
          ...(dto.name && { name: dto.name }),
          ...(dto.percentage !== undefined && { percentage: dto.percentage }),
          ...(dto.applyToAll !== undefined && { applyToAll: dto.applyToAll }),
          ...(dto.productIds !== undefined && !dto.applyToAll
            ? { products: { create: dto.productIds.map((productId) => ({ productId })) } }
            : {}),
        },
        include,
      });
    });
    return formatDiscount(d);
  },

  delete: async (id: number) => {
    await prisma.discount.delete({ where: { id } });
  },
};