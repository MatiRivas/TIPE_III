import axios from 'axios';

const API = import.meta.env.VITE_API_URL;

export const loginApi = async (email: string, password: string) => {
  const res = await axios.post(`${API}/auth/login`, { email, password });
  return res.data;
};
