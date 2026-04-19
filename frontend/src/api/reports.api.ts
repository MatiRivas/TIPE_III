import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

const client = axios.create({ baseURL: `${API_URL}/reports` });
client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
}

export interface SalesReportItem {
  orderId: number;
  createdAt: string;
  total: number;
  paymentMethod: 'CASH' | 'CARD';
  itemCount: number;
  sellerName: string;
  products: { name: string; quantity: number; price: number }[];
}

export interface SalesReportSummary {
  totalRevenue: number;
  totalOrders: number;
  totalItems: number;
  averageTicket: number;
  byCash: number;
  byCard: number;
  topProduct: string;
  orders: SalesReportItem[];
}

export const reportsApi = {
  getSalesReport: async (filters: ReportFilters = {}): Promise<SalesReportSummary> => {
    const { data } = await client.get('/sales', { params: filters });
    return data.data ?? data;
  },

  downloadPDF: async (filters: ReportFilters = {}): Promise<void> => {
    const response = await client.get('/export/pdf', {
      params: filters,
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-ventas-${filters.startDate ?? 'hoy'}.pdf`;
    a.click();
    window.URL.revokeObjectURL(url);
  },

  downloadExcel: async (filters: ReportFilters = {}): Promise<void> => {
    const response = await client.get('/export/excel', {
      params: filters,
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-ventas-${filters.startDate ?? 'hoy'}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  },
};
