import axios from 'axios';
import type {
  DashboardSummary,
  SalesSummary,
  TopProduct,
  InventoryAlert,
  OrderStats,
  PaymentBreakdown,
  RecentTransaction,
  DashboardFilters,
} from '../types/dashboard.types';
import { useAuthStore } from '../store/useAuthStore';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

function buildParams(filters: DashboardFilters) {
  const params: Record<string, string> = {};
  if (filters.date)      params.date      = filters.date;
  if (filters.startDate) params.startDate = filters.startDate;
  if (filters.endDate)   params.endDate   = filters.endDate;
  return params;
}

function authHeader() {
  // ✅ Lee el token desde Zustand (no desde localStorage directamente)
  const token = useAuthStore.getState().token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const client = axios.create({ baseURL: `${API_URL}/dashboard` });
client.interceptors.request.use((config) => {
  config.headers = { ...config.headers, ...authHeader() } as any;
  return config;
});

export const dashboardApi = {
  getSummary: async (filters: DashboardFilters = {}): Promise<DashboardSummary> => {
    const { data } = await client.get('/', { params: buildParams(filters) });
    return data.data;
  },

  getSales: async (filters: DashboardFilters = {}): Promise<SalesSummary> => {
    const { data } = await client.get('/sales', { params: buildParams(filters) });
    return data.data;
  },

  getTopProducts: async (filters: DashboardFilters = {}, limit = 5): Promise<TopProduct[]> => {
    const { data } = await client.get('/top-products', {
      params: { ...buildParams(filters), limit },
    });
    return data.data;
  },

  getInventoryAlerts: async (): Promise<InventoryAlert[]> => {
    const { data } = await client.get('/inventory-alerts');
    return data.data;
  },

  getOrderStats: async (filters: DashboardFilters = {}): Promise<OrderStats> => {
    const { data } = await client.get('/order-stats', { params: buildParams(filters) });
    return data.data;
  },

  getPaymentBreakdown: async (filters: DashboardFilters = {}): Promise<PaymentBreakdown[]> => {
    const { data } = await client.get('/payment-breakdown', { params: buildParams(filters) });
    return data.data;
  },

  getRecentTransactions: async (
    filters: DashboardFilters = {},
    limit = 10
  ): Promise<RecentTransaction[]> => {
    const { data } = await client.get('/recent-transactions', {
      params: { ...buildParams(filters), limit },
    });
    return data.data;
  },
};