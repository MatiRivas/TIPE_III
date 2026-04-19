import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const API = import.meta.env.VITE_API_URL;

const authHeader = () => ({ headers: { Authorization: `Bearer ${useAuthStore.getState().token}` } });

export const createOrder = async (data: any) => (await axios.post(`${API}/orders`, data, authHeader())).data;
export const getOrders = async () => (await axios.get(`${API}/orders`, authHeader())).data;
