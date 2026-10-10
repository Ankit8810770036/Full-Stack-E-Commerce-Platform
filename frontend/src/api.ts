import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8085',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Lightweight Client-Side In-Memory Cache (60s TTL)
interface CacheEntry {
  data: unknown;
  timestamp: number;
}
const apiCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60 * 1000;

export const clearApiCache = () => {
  apiCache.clear();
};

// Transparent caching wrapper on GET requests
const originalGet = api.get.bind(api);
api.get = (async function <T = unknown, R = AxiosResponse<T>, D = unknown>(
  url: string,
  config?: AxiosRequestConfig<D>
): Promise<R> {
  const cacheKey = `${url}_${JSON.stringify(config?.params || {})}`;
  const cached = apiCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return Promise.resolve({
      data: cached.data as T,
      status: 200,
      statusText: 'OK (cached)',
      headers: {},
      config: (config || {}) as AxiosRequestConfig<D>,
    } as unknown as R);
  }

  const response = await originalGet<T, R, D>(url, config);
  const respData = (response as unknown as AxiosResponse<T>).data;
  apiCache.set(cacheKey, { data: respData, timestamp: Date.now() });
  return response;
}) as typeof api.get;

// Invalidate in-memory cache on write operations
api.interceptors.response.use(
  (response) => {
    const method = response.config.method?.toLowerCase();
    if (method === 'post' || method === 'put' || method === 'delete' || method === 'patch') {
      apiCache.clear();
    }
    return response;
  },
  (error) => Promise.reject(error)
);

export default api;
