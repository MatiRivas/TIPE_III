import { useEffect } from 'react';
import { useDiscountStore } from '../store/useDiscountStore';
import { discountsApi } from '../api/discounts.api';

export const useDiscounts = () => {
  const { discounts, setDiscounts, addDiscount, updateDiscount, removeDiscount } =
    useDiscountStore();

  const fetchDiscounts = async () => {
    try {
      const data = await discountsApi.getAll();
      setDiscounts(data);
    } catch (err) {
      console.error('Error cargando descuentos:', err);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const createDiscount = async (
    name: string,
    percentage: number,
    applyToAll: boolean,
    productIds: number[]
  ) => {
    const newDiscount = await discountsApi.create({ name, percentage, applyToAll, productIds });
    addDiscount(newDiscount);
    return newDiscount;
  };

  const toggleDiscount = async (id: number) => {
    const updated = await discountsApi.toggle(id);
    updateDiscount(updated);
    return updated;
  };

  const deleteDiscount = async (id: number) => {
    await discountsApi.delete(id);
    removeDiscount(id);
  };

  return { discounts, fetchDiscounts, createDiscount, toggleDiscount, deleteDiscount };
};