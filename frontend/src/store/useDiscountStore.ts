import { create } from 'zustand';
import type { Discount } from '../types/discount.types';

interface DiscountStore {
  discounts: Discount[];
  setDiscounts: (discounts: Discount[]) => void;
  addDiscount: (discount: Discount) => void;
  updateDiscount: (discount: Discount) => void;
  removeDiscount: (id: number) => void;
  getDiscountedPrice: (productId: number, originalPrice: number) => {
    finalPrice: number;
    discountPercentage: number;
    discountName: string | null;
  };
}

export const useDiscountStore = create<DiscountStore>((set, get) => ({
  discounts: [],

  setDiscounts: (discounts) => set({ discounts }),

  addDiscount: (discount) =>
    set((state) => ({ discounts: [...state.discounts, discount] })),

  updateDiscount: (discount) =>
    set((state) => ({
      discounts: state.discounts.map((d) => (d.id === discount.id ? discount : d)),
    })),

  removeDiscount: (id) =>
    set((state) => ({ discounts: state.discounts.filter((d) => d.id !== id) })),

  getDiscountedPrice: (productId, originalPrice) => {
    const { discounts } = get();
    const applicable = discounts.find(
      (d) => d.active && (d.applyToAll || d.productIds.includes(productId))
    );
    if (!applicable) {
      return { finalPrice: originalPrice, discountPercentage: 0, discountName: null };
    }
    const finalPrice = originalPrice * (1 - applicable.percentage / 100);
    return {
      finalPrice: Math.round(finalPrice),
      discountPercentage: applicable.percentage,
      discountName: applicable.name,
    };
  },
}));