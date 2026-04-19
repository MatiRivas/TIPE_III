import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import type { Discount, CreateDiscountDto, UpdateDiscountDto } from '../types/discount.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const discountsApi = {
  getAll: async (): Promise<Discount[]> => {
    const { data } = await api.get('/discounts');
    return data;
  },

  create: async (dto: CreateDiscountDto): Promise<Discount> => {
    const { data } = await api.post('/discounts', dto);
    return data;
  },

  toggle: async (id: number): Promise<Discount> => {
    const { data } = await api.patch(`/discounts/${id}/toggle`);
    return data;
  },

  update: async (id: number, dto: UpdateDiscountDto): Promise<Discount> => {
    const { data } = await api.put(`/discounts/${id}`, dto);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/discounts/${id}`);
  },
};