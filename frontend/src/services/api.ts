import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await api.post('/auth/refresh', null, {
            params: { refreshToken }
          });

          const { token, refreshToken: newRefreshToken } = response.data;
          localStorage.setItem('token', token);
          localStorage.setItem('refreshToken', newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh token failed, redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => api.post('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', null, { params: { email } }),

  resetPassword: (token: string, newPassword: string) =>
    api.post('/auth/reset-password', null, { params: { token, newPassword } }),

  verifyEmail: (token: string) =>
    api.get('/auth/verify-email', { params: { token } }),

  refreshToken: (refreshToken: string) =>
    api.post('/auth/refresh', null, { params: { refreshToken } }),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  getUserById: (id: number) => api.get(`/user/${id}`),
};

// Product API
export const productAPI = {
  // Get all products (accessible by all authenticated users)
  getAllProducts: () => api.get('/products'),
  
  // Get product by ID with full recipe data
  getProductById: (id: number) => api.get(`/products/${id}`),
  
  // Search products by name
  searchProducts: (name: string) => api.get('/products/search', { params: { name } }),

  // Advanced search with filters
  searchProductsAdvanced: (filters: {
    name?: string;
    description?: string;
    componentName?: string;
    ingredientName?: string;
    productType?: string;
  }) => api.get('/products/search/advanced', { params: filters }),

  // Search by component
  searchByComponent: (componentName: string) => 
    api.get('/products/search/component', { params: { componentName } }),

  // Search by ingredient
  searchByIngredient: (ingredientName: string) => 
    api.get('/products/search/ingredient', { params: { ingredientName } }),

  // Search by product type
  searchByProductType: (productType: string) => 
    api.get('/products/search/type', { params: { productType } }),

  // Get filter options
  getFilterOptions: () => api.get('/products/filter-options'),
  
  // Create new product (MANAGER and ADMIN only)
  createProduct: (data: {
    name: string;
    description?: string;
    productType: string;
    compositions?: Array<{
      componentName: string;
      percentage: number;
      notes?: string;
    }>;
    additionalIngredients?: Array<{
      ingredientName: string;
      quantity: number;
      unit: string;
      notes?: string;
    }>;
  }) => api.post('/products', data),
  
  // Update existing product (MANAGER and ADMIN only)
  updateProduct: (id: number, data: {
    name: string;
    description?: string;
    productType: string;
    compositions?: Array<{
      componentName: string;
      percentage: number;
      notes?: string;
    }>;
    additionalIngredients?: Array<{
      ingredientName: string;
      quantity: number;
      unit: string;
      notes?: string;
    }>;
  }) => api.put(`/products/${id}`, data),
  
  // Delete product (ADMIN only)
  deleteProduct: (id: number) => api.delete(`/products/${id}`),
  
  // Get products by current user
  getMyProducts: () => api.get('/products/my-products'),
};

// Test API
export const testAPI = {
  test: () => api.get('/test'),
  health: () => api.get('/health'),
};

export default api; 