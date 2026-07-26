const API_BASE = '/api';

const getHeaders = () => {
  const user = JSON.parse(localStorage.getItem('userInfo') || 'null');
  const headers = { 'Content-Type': 'application/json' };
  if (user && user.token) {
    headers['Authorization'] = `Bearer ${user.token}`;
  }
  return headers;
};

export const api = {
  // Products
  async getProducts(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/products?${query}`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  },

  async getProductById(id) {
    const res = await fetch(`${API_BASE}/products/${id}`);
    if (!res.ok) throw new Error('Product not found');
    return res.json();
  },

  async createProduct(productData) {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(productData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create product');
    return data;
  },

  async updateProduct(id, productData) {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(productData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update product');
    return data;
  },

  async deleteProduct(id) {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete product');
    return data;
  },

  // Categories
  async getCategories() {
    const res = await fetch(`${API_BASE}/categories`);
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },

  async createCategory(categoryData) {
    const res = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(categoryData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create category');
    return data;
  },

  async deleteCategory(id) {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete category');
    return data;
  },

  // Auth & User
  async login(emailOrPhone, password) {
    const res = await fetch(`${API_BASE}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailOrPhone, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    return data;
  },

  async register(name, email, password, phone = '', address = {}) {
    const res = await fetch(`${API_BASE}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, password, address }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    return data;
  },

  async sendOtp(email, phone = '') {
    const res = await fetch(`${API_BASE}/users/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, phone }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to send OTP email');
    return data;
  },

  async verifyOtp(email, otp, name = '') {
    const res = await fetch(`${API_BASE}/users/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, name }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'OTP Verification failed');
    return data;
  },

  async getProfile() {
    const res = await fetch(`${API_BASE}/users/profile`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to load profile');
    return data;
  },

  async getUsers() {
    const res = await fetch(`${API_BASE}/users`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch users');
    return data;
  },

  // Orders
  async createOrder(orderData) {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(orderData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to place order');
    return data;
  },

  async getOrderById(id) {
    const res = await fetch(`${API_BASE}/orders/${id}`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Order not found');
    return data;
  },

  async getMyOrders() {
    const res = await fetch(`${API_BASE}/orders/myorders`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch orders');
    return data;
  },

  async getAllOrders() {
    const res = await fetch(`${API_BASE}/orders`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch all orders');
    return data;
  },

  async updateOrderStatus(id, status) {
    const res = await fetch(`${API_BASE}/orders/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update order status');
    return data;
  },

  async getAdminStats() {
    const res = await fetch(`${API_BASE}/orders/stats`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch admin stats');
    return data;
  },
};
