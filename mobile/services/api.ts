import Axios from 'axios';
import { authTokenRef } from '@/contexts/AuthContext';

export const api = Axios.create({
  baseURL: 'https://8eb76cc96d31.ngrok-free.app/api',
  timeout: 10000,
});

// add token to every request
api.interceptors.request.use((config) => {
  const token = authTokenRef?.current;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});