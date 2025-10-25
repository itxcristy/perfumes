/**
 * API Client for communicating with the backend
 * Replaces Supabase client with direct API calls
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: {
    status: number;
    code: string;
    message: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    // Initialize token from localStorage on startup
    this.token = localStorage.getItem('auth_token');
  }

  /**
   * Set authentication token
   */
  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  /**
   * Get stored token
   */
  getToken(): string | null {
    // Always check localStorage in case it was updated by another tab
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      this.token = storedToken;
    }
    return this.token;
  }

  /**
   * Make API request
   */
  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_URL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add auth token if available
    const token = this.getToken();
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'API request failed');
      }

      return data;
    } catch (error) {
      // Silently handle expected 401 errors for /auth/me when no token exists
      const isAuthMeEndpoint = endpoint === '/auth/me';
      const is401Error = error instanceof Error && error.message.includes('401');
      const hasNoToken = !this.getToken();

      if (isAuthMeEndpoint && is401Error && hasNoToken) {
        // Expected behavior - user is not logged in, don't log error
        throw error;
      }

      // Log all other errors
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  /**
   * GET request
   */
  async get<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T = any>(endpoint: string, body: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  /**
   * PUT request
   */
  async put<T = any>(endpoint: string, body: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  /**
   * DELETE request
   */
  async delete<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // ==========================================
  // Authentication
  // ==========================================

  async register(email: string, password: string, fullName: string) {
    const response = await this.post('/auth/register', {
      email,
      password,
      fullName,
    });
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async login(email: string, password: string) {
    const response = await this.post('/auth/login', { email, password });
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async logout() {
    this.setToken(null);
  }

  async getCurrentUser() {
    return this.get('/auth/me');
  }

  async updateProfile(data: any) {
    return this.put('/auth/profile', data);
  }

  // ==========================================
  // Products
  // ==========================================

  async getProducts(params?: {
    page?: number;
    limit?: number;
    categoryId?: string;
    search?: string;
    featured?: boolean;
    bestSellers?: boolean;
    latest?: boolean;
    sellerId?: string;
  }): Promise<PaginatedResponse<any>> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.categoryId) query.append('categoryId', params.categoryId);
    if (params?.search) query.append('search', params.search);
    if (params?.featured) query.append('featured', 'true');
    if (params?.bestSellers) query.append('bestSellers', 'true');
    if (params?.latest) query.append('latest', 'true');
    if (params?.sellerId) query.append('sellerId', params.sellerId);

    const queryString = query.toString();
    return this.get(`/products${queryString ? '?' + queryString : ''}`);
  }

  async getProduct(id: string) {
    return this.get(`/products/${id}`);
  }

  async createProduct(data: any) {
    return this.post('/products', data);
  }

  async updateProduct(id: string, data: any) {
    return this.put(`/products/${id}`, data);
  }

  async deleteProduct(id: string) {
    return this.delete(`/products/${id}`);
  }

  // ==========================================
  // Categories
  // ==========================================

  async getCategories() {
    return this.get('/categories');
  }

  async getCategory(id: string) {
    return this.get(`/categories/${id}`);
  }

  async createCategory(data: any) {
    return this.post('/categories', data);
  }

  async updateCategory(id: string, data: any) {
    return this.put(`/categories/${id}`, data);
  }

  async deleteCategory(id: string) {
    return this.delete(`/categories/${id}`);
  }

  // ==========================================
  // Cart
  // ==========================================

  async getCart() {
    return this.get('/cart');
  }

  async addToCart(productId: string, quantity: number, variantId?: string) {
    return this.post('/cart', { productId, quantity, variantId });
  }

  async updateCartItem(itemId: string, quantity: number) {
    return this.put(`/cart/${itemId}`, { quantity });
  }

  async removeFromCart(itemId: string) {
    return this.delete(`/cart/${itemId}`);
  }

  async clearCart() {
    return this.delete('/cart');
  }

  // ==========================================
  // Wishlist
  // ==========================================

  async getWishlist() {
    return this.get('/wishlist');
  }

  async addToWishlist(productId: string) {
    return this.post('/wishlist', { productId });
  }

  async removeFromWishlist(productId: string) {
    return this.delete(`/wishlist/${productId}`);
  }

  // ==========================================
  // Addresses
  // ==========================================

  async getAddresses() {
    return this.get('/addresses');
  }

  async getAddress(id: string) {
    return this.get(`/addresses/${id}`);
  }

  async createAddress(data: any) {
    return this.post('/addresses', data);
  }

  async updateAddress(id: string, data: any) {
    return this.put(`/addresses/${id}`, data);
  }

  async deleteAddress(id: string) {
    return this.delete(`/addresses/${id}`);
  }

  // ==========================================
  // Orders
  // ==========================================

  async getOrders() {
    return this.get('/orders');
  }

  async getOrder(id: string) {
    return this.get(`/orders/${id}`);
  }

  // ==========================================
  // Payment Methods
  // ==========================================

  async getPaymentMethods() {
    return this.get('/payment-methods');
  }

  async getPaymentMethod(id: string) {
    return this.get(`/payment-methods/${id}`);
  }

  async createPaymentMethod(data: any) {
    return this.post('/payment-methods', data);
  }

  async updatePaymentMethod(id: string, data: any) {
    return this.put(`/payment-methods/${id}`, data);
  }

  async deletePaymentMethod(id: string) {
    return this.delete(`/payment-methods/${id}`);
  }

  async setDefaultPaymentMethod(id: string) {
    return this.put(`/payment-methods/${id}/set-default`, {});
  }

  // ==========================================
  // Notification Preferences
  // ==========================================

  async getNotificationPreferences() {
    return this.get('/notification-preferences');
  }

  async createNotificationPreferences(data: any) {
    return this.post('/notification-preferences', data);
  }

  async updateNotificationPreferences(data: any) {
    return this.put('/notification-preferences', data);
  }
}

export const apiClient = new ApiClient();

// Restore token from localStorage on app load
const storedToken = localStorage.getItem('auth_token');
if (storedToken) {
  apiClient.setToken(storedToken);
}

