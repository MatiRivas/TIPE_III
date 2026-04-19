import { discountsRepository } from './discounts.repository';
import { CreateDiscountDto, UpdateDiscountDto } from './discounts.types';
import { getIO } from '../../core/socket';

export const discountsService = {
  getAll: () => discountsRepository.findAll(),

  create: async (dto: CreateDiscountDto) => {
    if (dto.percentage <= 0 || dto.percentage > 100)
      throw new Error('El porcentaje debe estar entre 1 y 100.');
    if (!dto.applyToAll && dto.productIds.length === 0)
      throw new Error('Debes indicar al menos un producto si no aplica a todos.');
    const discount = await discountsRepository.create(dto);
    getIO().emit('discounts:updated'); // ← notifica a todos
    return discount;
  },

  toggle: async (id: number) => {
    const discount = await discountsRepository.toggle(id);
    getIO().emit('discounts:updated'); // ← notifica a todos
    return discount;
  },

  update: async (id: number, dto: UpdateDiscountDto) => {
    const discount = await discountsRepository.update(id, dto);
    getIO().emit('discounts:updated');
    return discount;
  },

  delete: async (id: number) => {
    await discountsRepository.delete(id);
    getIO().emit('discounts:updated'); // ← notifica a todos
  },
};