import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import type { Product } from '../types/product.types';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const client = axios.create({ baseURL: `${API}/products` });

client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const productsApi = {
  getAll: async (): Promise<Product[]> => {
    const { data } = await client.get('/');
    return data.data ?? data;
  },

  create: async (payload: Omit<Product, 'id' | 'createdAt'>): Promise<Product> => {
    const { data } = await client.post('/', payload);
    return data.data ?? data;
  },

  update: async (id: number, payload: Partial<Omit<Product, 'id' | 'createdAt'>>): Promise<Product> => {
    const { data } = await client.put(`/${id}`, payload);
    return data.data ?? data;
  },

  toggleAvailable: async (id: number, available: boolean): Promise<Product> => {
    const { data } = await client.put(`/${id}`, { available });
    return data.data ?? data;
  },

  remove: async (id: number): Promise<void> => {
    await client.delete(`/${id}`);
  },
};