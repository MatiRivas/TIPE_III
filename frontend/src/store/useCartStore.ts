import { create } from 'zustand';
import type { Product } from '../types/product.types';


interface CartItem extends Product { quantity: number; }

interface CartState {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
  total: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: (product) => {
    const items = get().items;
    const existing = items.find((i) => i.id === product.id);
    if (existing) {
      set({ items: items.map((i) => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i) });
    } else {
      set({ items: [...items, { ...product, quantity: 1 }] });
    }
  },
  removeItem: (productId) => {
    const items = get().items;
    const existing = items.find((i) => i.id === productId);
    if (existing && existing.quantity > 1) {
      set({ items: items.map((i) => i.id === productId ? { ...i, quantity: i.quantity - 1 } : i) });
    } else {
      set({ items: items.filter((i) => i.id !== productId) });
    }
  },
  clearCart: () => set({ items: [] }),
  total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
}));
