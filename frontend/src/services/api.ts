import axios from 'axios';

const API_BASE_URL = '/api';

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
    // Don't add token for public auth endpoints
    const publicEndpoints = [
      '/auth/login',
      '/auth/accept-invite',
      '/auth/forgot-password',
      '/auth/reset-password',
      '/auth/refresh'
    ];
    
    const isPublicEndpoint = publicEndpoints.some(endpoint => 
      config.url?.includes(endpoint)
    );
    
    if (!isPublicEndpoint) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
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

    // Don't try to refresh tokens for public endpoints
    const publicEndpoints = [
      '/auth/login',
      '/auth/register', 
      '/auth/forgot-password',
      '/auth/reset-password',
      '/auth/verify-email',
      '/auth/refresh'
    ];
    
    const isPublicEndpoint = publicEndpoints.some(endpoint => 
      originalRequest.url?.includes(endpoint)
    );

    if (error.response?.status === 401 && !originalRequest._retry && !isPublicEndpoint) {
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
  acceptInvite: (data: {
    token: string;
    firstName: string;
    lastName: string;
    password: string;
  }) => api.post('/auth/accept-invite', data),

  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, newPassword: string) =>
    api.post('/auth/reset-password', { token, newPassword }),

  refreshToken: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),
};

// Admin API
export const adminAPI = {
  inviteUser: (data: { email: string; role: string }) =>
    api.post('/admin/invite', data),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  
  getAllUsers: () => api.get('/user'),
  
  getUserById: (id: number) => api.get(`/user/${id}`),
  
  updateUser: (id: number, data: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    status: string;
  }) => api.put(`/user/${id}`, data),
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