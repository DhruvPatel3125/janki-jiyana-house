const API_BASE = import.meta.env.VITE_API_URL || '/api';

const getHeaders = () => {
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('userInfo') || 'null');
  } catch (e) {
    // Corrupted localStorage — clear it
    localStorage.removeItem('userInfo');
  }
  const headers = { 'Content-Type': 'application/json' };
  if (user && user.token) {
    headers['Authorization'] = `Bearer ${user.token}`;
  }
  return headers;
};

let cachedCategories = null;
let categoriesPromise = null;

// Safe Response Parser to prevent "Unexpected end of JSON input" errors
const handleResponse = async (res, defaultError = 'Request failed') => {
  const text = await res.text();
  let data = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = { message: text };
    }
  }
  if (!res.ok) {
    throw new Error(data.message || defaultError || `Server returned error status ${res.status}`);
  }
  return data;
};

export const api = {
  // Products
  async getProducts(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/products?${query}`);
    return handleResponse(res, 'Failed to fetch products');
    // Returns: { products, totalProducts, totalPages, currentPage, hasNextPage, hasPrevPage }
  },

  async getProductById(id) {
    const res = await fetch(`${API_BASE}/products/${id}`);
    return handleResponse(res, 'Product not found');
  },

  async createProduct(productData) {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(productData),
    });
    return handleResponse(res, 'Failed to create product');
  },

  async updateProduct(id, productData) {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(productData),
    });
    return handleResponse(res, 'Failed to update product');
  },

  async deleteProduct(id) {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res, 'Failed to delete product');
  },

  async importProducts(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const user = JSON.parse(localStorage.getItem('userInfo') || 'null');
    const headers = {};
    if (user && user.token) {
      headers['Authorization'] = `Bearer ${user.token}`;
    }

    const res = await fetch(`${API_BASE}/products/import`, {
      method: 'POST',
      headers,
      body: formData,
    });
    return handleResponse(res, 'Failed to import products');
  },

  // Categories
  async getCategories() {
    if (cachedCategories) return cachedCategories;
    if (categoriesPromise) return categoriesPromise;
    categoriesPromise = fetch(`${API_BASE}/categories`).then(res => handleResponse(res, 'Failed to fetch categories')).then(data => {
      cachedCategories = data;
      categoriesPromise = null;
      return data;
    }).catch(err => {
      categoriesPromise = null;
      throw err;
    });
    return categoriesPromise;
  },

  async createCategory(categoryData) {
    const res = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(categoryData),
    });
    cachedCategories = null; // Invalidate cache
    return handleResponse(res, 'Failed to create category');
  },

  async updateCategory(id, categoryData) {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(categoryData),
    });
    cachedCategories = null; // Invalidate cache
    return handleResponse(res, 'Failed to update category');
  },

  async deleteCategory(id) {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    cachedCategories = null; // Invalidate cache
    return handleResponse(res, 'Failed to delete category');
  },

  // Auth & User
  async login(emailOrPhone, password) {
    const res = await fetch(`${API_BASE}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailOrPhone, password }),
    });
    return handleResponse(res, 'Login failed');
  },

  async googleLogin(token) {
    const res = await fetch(`${API_BASE}/users/google-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    return handleResponse(res, 'Google login failed');
  },

  async register(name, email, password, phone = '', address = {}) {
    const res = await fetch(`${API_BASE}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, password, address }),
    });
    return handleResponse(res, 'Registration failed');
  },

  async sendOtp(email, phone = '') {
    const res = await fetch(`${API_BASE}/users/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, phone }),
    });
    return handleResponse(res, 'Failed to send OTP email');
  },

  async verifyOtp(email, otp, name = '') {
    const res = await fetch(`${API_BASE}/users/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, name }),
    });
    return handleResponse(res, 'OTP Verification failed');
  },

  async getProfile() {
    const res = await fetch(`${API_BASE}/users/profile`, {
      headers: getHeaders(),
    });
    return handleResponse(res, 'Failed to load profile');
  },

  async changePassword(oldPassword, newPassword) {
    const res = await fetch(`${API_BASE}/users/change-password`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ oldPassword, newPassword }),
    });
    return handleResponse(res, 'Failed to change password');
  },

  async getUsers() {
    const res = await fetch(`${API_BASE}/users`, {
      headers: getHeaders(),
    });
    return handleResponse(res, 'Failed to fetch users');
  },

  async toggleBlockUser(id) {
    const res = await fetch(`${API_BASE}/users/${id}/block`, {
      method: 'PUT',
      headers: getHeaders(),
    });
    return handleResponse(res, 'Failed to toggle block status');
  },

  async deleteUser(id) {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res, 'Failed to delete user');
  },

  // Orders
  async createOrder(orderData, idempotencyKey) {
    const headers = getHeaders();
    if (idempotencyKey) {
      headers['X-Idempotency-Key'] = idempotencyKey;
    }
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers,
      body: JSON.stringify(orderData),
    });
    return handleResponse(res, 'Failed to place order');
  },

  async getOrderById(id) {
    const res = await fetch(`${API_BASE}/orders/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse(res, 'Order not found');
  },

  async getMyOrders(page = 1, limit = 10) {
    const res = await fetch(`${API_BASE}/orders/myorders?page=${page}&limit=${limit}`, {
      headers: getHeaders(),
    });
    return handleResponse(res, 'Failed to fetch orders');
    // Returns: { orders, totalOrders, totalPages, currentPage }
  },

  async getAllOrders(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/orders?${query}`, {
      headers: getHeaders(),
    });
    return handleResponse(res, 'Failed to fetch all orders');
    // Returns: { orders, totalOrders, totalPages, currentPage }
  },

  async updateOrderStatus(id, status) {
    const res = await fetch(`${API_BASE}/orders/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    return handleResponse(res, 'Failed to update order status');
  },

  async requestCancelOrReturn(orderId) {
    const res = await fetch(`${API_BASE}/orders/${orderId}/cancel`, {
      method: 'PUT',
      headers: getHeaders(),
    });
    return handleResponse(res, 'Failed to cancel/return order');
  },

  async cancelItem(orderId, itemId, quantity = undefined) {
    const res = await fetch(`${API_BASE}/orders/${orderId}/cancel-item/${itemId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: quantity !== undefined ? JSON.stringify({ quantity }) : undefined,
    });
    return handleResponse(res, 'Failed to cancel item');
  },

  async getAdminStats() {
    const res = await fetch(`${API_BASE}/orders/stats`, {
      headers: getHeaders(),
    });
    return handleResponse(res, 'Failed to fetch admin stats');
  },

  async submitPaymentProof(id, proofData) {
    const res = await fetch(`${API_BASE}/orders/${id}/submit-payment`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(proofData),
    });
    return handleResponse(res, 'Failed to submit payment proof');
  },

  async verifyPayment(id, isApproved) {
    const res = await fetch(`${API_BASE}/orders/${id}/verify-payment`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ isApproved }),
    });
    return handleResponse(res, 'Failed to verify payment');
  },

  // Wishlist
  async getWishlist() {
    const res = await fetch(`${API_BASE}/wishlist`, {
      headers: getHeaders(),
    });
    return handleResponse(res, 'Failed to fetch wishlist');
  },

  async toggleWishlist(productId) {
    const res = await fetch(`${API_BASE}/wishlist/toggle/${productId}`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse(res, 'Failed to update wishlist');
  },

  async removeFromWishlist(productId) {
    const res = await fetch(`${API_BASE}/wishlist/${productId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res, 'Failed to remove item from wishlist');
  },

  // Videos & Shorts
  async getVideos() {
    const res = await fetch(`${API_BASE}/videos`);
    return handleResponse(res, 'Failed to fetch trending videos');
  },

  async getAllVideosAdmin() {
    const res = await fetch(`${API_BASE}/videos/admin`, {
      headers: getHeaders(),
    });
    return handleResponse(res, 'Failed to fetch admin videos');
  },

  async createVideo(videoData) {
    const res = await fetch(`${API_BASE}/videos`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(videoData),
    });
    return handleResponse(res, 'Failed to add video');
  },

  async updateVideo(id, videoData) {
    const res = await fetch(`${API_BASE}/videos/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(videoData),
    });
    return handleResponse(res, 'Failed to update video');
  },

  async deleteVideo(id) {
    const res = await fetch(`${API_BASE}/videos/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res, 'Failed to delete video');
  },

  // Upload
  async uploadFile(file) {
    const formData = new FormData();
    formData.append('image', file);
    
    // Cannot use getHeaders() directly because we shouldn't set Content-Type to application/json for FormData
    const user = JSON.parse(localStorage.getItem('userInfo') || 'null');
    const headers = {};
    if (user && user.token) {
      headers['Authorization'] = `Bearer ${user.token}`;
    }

    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });
    return handleResponse(res, 'Failed to upload image');
  },

  async uploadPaymentProof(file) {
    const formData = new FormData();
    formData.append('image', file);
    
    const res = await fetch(`${API_BASE}/upload/payment-proof`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(res, 'Failed to upload payment proof');
  },

  // Settings
  async getSettings() {
    const res = await fetch(`${API_BASE}/settings`);
    return handleResponse(res, 'Failed to fetch settings');
  },

  async updateSettings(settingsData) {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(settingsData),
    });
    return handleResponse(res, 'Failed to update settings');
  },
};
