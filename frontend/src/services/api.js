import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const getHealthcheck = async () => {
  const response = await api.get('/healthcheck');
  return response.data;
};

export const getAllProducts = async () => {
  const response = await api.get('/api/products');
  return response.data;
};

export const searchProducts = async (name) => {
  const response = await api.get(`/api/products/search?name=${encodeURIComponent(name)}`);
  return response.data;
};

export const createProduct = async (productData) => {
  const response = await api.post('/api/products', productData);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await api.delete(`/api/products/${id}`);
  return response.data;
};

export default api;
