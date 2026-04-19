import prisma from '../../core/database';
import { CreateProductDTO, UpdateProductDTO} from './products.types';

export const findAllProducts = async () => {
  return prisma.product.findMany({ orderBy: { name: 'asc' } });
};

export const findProductById = async (id: number) => {
  return prisma.product.findUnique({ where: { id } });
};

export const createProduct = async (data: CreateProductDTO) => {
  return prisma.product.create({ data });
};

export const updateProduct = async (id: number, data: UpdateProductDTO) => {
  return prisma.product.update({ where: { id }, data });
};

export const deleteProduct = async (id: number) => {
  return prisma.product.delete({ where: { id } });
};
