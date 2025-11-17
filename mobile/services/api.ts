import Axios from 'axios';
import { authTokenRef } from '@/contexts/AuthContext';

export const api = Axios.create({
  baseURL: 'http://192.168.100.83:5001/api',
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