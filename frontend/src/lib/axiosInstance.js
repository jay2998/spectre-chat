import axios from 'axios';

const apiBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').trim();

export const axiosInstance = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true, 
});
