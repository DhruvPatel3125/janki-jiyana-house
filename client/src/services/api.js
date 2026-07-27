const API_BASE = '/api';

const getHeaders = () => {
  const user = JSON.parse(localStorage.getItem('userInfo') || 'null');
  const headers = { 'Content-Type': 'application/json' };
  if (user && user.token) {
    headers['Authorization'] = `Bearer ${user.token}`;
  }
  return headers;
};

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

  // Categories
  async getCategories() {
    const res = await fetch(`${API_BASE}/categories`);
    return handleResponse(res, 'Failed to fetch categories');
  },

  async createCategory(categoryData) {
    const res = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(categoryData),
    });
    return handleResponse(res, 'Failed to create category');
  },

  async deleteCategory(id) {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
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
  async createOrder(orderData) {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: getHeaders(),
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

  async getMyOrders() {
    const res = await fetch(`${API_BASE}/orders/myorders`, {
      headers: getHeaders(),
    });
    return handleResponse(res, 'Failed to fetch orders');
  },

  async getAllOrders() {
    const res = await fetch(`${API_BASE}/orders`, {
      headers: getHeaders(),
    });
    return handleResponse(res, 'Failed to fetch all orders');
  },

  async updateOrderStatus(id, status) {
    const res = await fetch(`${API_BASE}/orders/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    return handleResponse(res, 'Failed to update order status');
  },

  async getAdminStats() {
    const res = await fetch(`${API_BASE}/orders/stats`, {
      headers: getHeaders(),
    });
    return handleResponse(res, 'Failed to fetch admin stats');
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
};
