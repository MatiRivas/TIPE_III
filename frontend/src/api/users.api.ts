import axios from 'axios';
import type { User, CreateUserPayload, UpdateUserPayload } from '../types/user.types';
import { useAuthStore } from '../store/useAuthStore';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

const client = axios.create({ baseURL: `${API_URL}/users` });
client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const usersApi = {
  getAll: async (): Promise<User[]> => {
    const { data } = await client.get('/');
    return data.data ?? data;
  },

  getById: async (id: number): Promise<User> => {
    const { data } = await client.get(`/${id}`);
    return data.data ?? data;
  },

  create: async (payload: CreateUserPayload): Promise<User> => {
    const { data } = await client.post('/', payload);
    return data.data ?? data;
  },

  update: async (id: number, payload: UpdateUserPayload): Promise<User> => {
    const { data } = await client.put(`/${id}`, payload);
    return data.data ?? data;
  },

  remove: async (id: number): Promise<void> => {
    await client.delete(`/${id}`);
  },
};