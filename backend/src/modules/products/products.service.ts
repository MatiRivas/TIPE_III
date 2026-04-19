import {
  findAllProducts,
  findProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from './products.repository';
import * as repo from './products.repository';
import { CreateProductDTO, UpdateProductDTO} from './products.types';
import prisma from '../../core/database';
import { getIO } from '../../core/socket';

export const listProducts = () => findAllProducts();

export const getProduct = async (id: number) => {
  const product = await findProductById(id);
  if (!product) throw { status: 404, message: 'Producto no encontrado' };
  return product;
};

const emitProductsUpdated = () => {
  getIO().emit('products:updated');
  getIO().emit('dashboard:updated');
};

export const addProduct = async (dto: CreateProductDTO) => {
  const product = await createProduct(dto);
  emitProductsUpdated();
  return product;
};

export const editProduct = async (id: number, dto: UpdateProductDTO) => {
  await getProduct(id);
  const product = await updateProduct(id, dto);
  emitProductsUpdated();
  return product;
};

export const removeProduct = async (id: number) => {
  await getProduct(id);
  const product = await deleteProduct(id);
  emitProductsUpdated();
  return product;
};
