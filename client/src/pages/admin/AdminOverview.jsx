import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  IndianRupee,
  ShoppingBag,
  Clock,
  AlertTriangle,
  Users,
  TrendingUp,
  ArrowRight,
  PieChart as PieIcon,
  BarChart3,
  Package,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { api } from '../../services/api';

const DEFAULT_MONTHLY_DATA = [
  { month: 'Jan', revenue: 12400, orders: 42 },
  { month: 'Feb', revenue: 18900, orders: 58 },
  { month: 'Mar', revenue: 24500, orders: 74 },
  { month: 'Apr', revenue: 21000, orders: 65 },
  { month: 'May', revenue: 32800, orders: 98 },
  { month: 'Jun', revenue: 41200, orders: 120 },
  { month: 'Jul', revenue: 49500, orders: 145 },
];

const DEFAULT_CATEGORY_DATA = [
  { name: 'Sanitary Pads', value: 45, color: '#0d9488' },
  { name: 'Baby Diapers', value: 30, color: '#f97316' },
  { name: 'Adult Diapers', value: 15, color: '#0284c7' },
  { name: 'Wipes & Hygiene', value: 10, color: '#8b5cf6' },
];

export const AdminOverview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await api.getAdminStats();
      setStats(data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  const getCustomerDisplayName = (order) => {
    if (!order) return 'Customer';
    if (typeof order.user === 'object' && order.user !== null && order.user.name) {
      return order.user.name;
    }
    if (order.guestInfo && order.guestInfo.name) {
      return order.guestInfo.name;
    }
    if (order.shippingAddress && order.shippingAddress.name) {
      return order.shippingAddress.name;
    }
    return 'Customer';
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-slate-500 text-sm font-semibold">Loading admin analytics & interactive graphs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl text-sm font-semibold">
        {error}
      </div>
    );
  }

  const monthlySalesData = stats?.monthlySalesData || [];
  const categoryDistributionData = stats?.categoryDistributionData || [];

  const metricCards = [
    {
      label: 'Total Revenue',
      value: `₹${stats?.totalRevenue?.toLocaleString('en-IN') || 0}`,
      icon: IndianRupee,
      bg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      link: '/admin/orders',
    },
    {
      label: 'Total Orders',
      value: stats?.totalOrdersCount || 0,
      icon: ShoppingBag,
      bg: 'bg-brand-50 text-brand-600 border-brand-100',
      link: '/admin/orders',
    },
    {
      label: 'Pending Orders',
      value: stats?.pendingOrdersCount || 0,
      icon: Clock,
      bg: 'bg-amber-50 text-amber-600 border-amber-100',
      link: '/admin/orders',
    },
    {
      label: 'Low Stock Items',
      value: stats?.lowStockProductsCount || 0,
      icon: AlertTriangle,
      bg: 'bg-rose-50 text-rose-600 border-rose-100',
      link: '/admin/products',
    },
    {
      label: 'Total Customers',
      value: stats?.usersCount || 0,
      icon: Users,
      bg: 'bg-sky-50 text-sky-600 border-sky-100',
      link: '/admin/users',
    },
  ];

  const orderStatusData = [
    { name: 'Pending', count: stats?.pendingOrdersCount || 0, fill: '#f59e0b' },
    { name: 'Confirmed', count: stats?.confirmedOrdersCount || 0, fill: '#3b82f6' },
    { name: 'Shipped', count: stats?.shippedOrdersCount || 0, fill: '#06b6d4' },
    { name: 'Delivered', count: stats?.deliveredOrdersCount || 0, fill: '#10b981' },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">Dashboard Overview & Analytics</h1>
        <p className="text-xs text-slate-500 mt-1">
          Real-time summary of sales revenue, order fulfillment, inventory stock, and customer analytics.
        </p>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        {metricCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link
              to={card.link}
              key={idx}
              className={`p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-3 hover:shadow-md transition-shadow group`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-brand-600 transition-colors">
                  {card.label}
                </span>
                <div className={`p-2.5 rounded-2xl ${card.bg} border`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900">{card.value}</p>
            </Link>
          );
        })}
      </div>

      {/* GRAPHS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. Revenue Growth Area Chart (Spans 2 Columns) */}
        <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" /> Revenue Growth Trend
              </h3>
              <p className="text-xs text-slate-500">Monthly gross revenue (₹) performance curve</p>
            </div>
            <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-100">
              Live Real-Time
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlySalesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val >= 1000 ? `${val / 1000}k` : val}`}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                  formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#0d9488" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Category Distribution Donut Chart */}
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between min-w-0">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-brand-600" /> Category Breakdown
            </h3>
            <p className="text-xs text-slate-500">Products distribution by category</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#0d9488'} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} items`, 'Count']} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bar Chart & Order Fulfillment Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Status Bar Chart */}
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 lg:col-span-1 min-w-0">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-sky-600" /> Order Status Distribution
            </h3>
            <p className="text-xs text-slate-500">Total orders grouped by status</p>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={orderStatusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="count" radius={[10, 10, 0, 0]}>
                  {orderStatusData.map((entry, idx) => (
                    <Cell key={`bar-${idx}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Customer Orders Section */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-6 lg:col-span-2 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Recent Customer Orders</h3>
              <p className="text-xs text-slate-500">Latest orders placed on Janki Jiyana House shop.</p>
            </div>
            <Link
              to="/admin/orders"
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              Manage All Orders <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-3 px-3">Order ID</th>
                  <th className="pb-3 px-3">Customer Name</th>
                  <th className="pb-3 px-3">Items Count</th>
                  <th className="pb-3 px-3">Total Amount</th>
                  <th className="pb-3 px-3">Payment</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                  stats.recentOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-3 font-mono font-bold text-slate-900">
                        {order._id.substring(order._id.length - 8)}
                      </td>
                      <td className="py-3.5 px-3 font-extrabold text-slate-900 truncate max-w-[120px]">
                        {getCustomerDisplayName(order)}
                      </td>
                      <td className="py-3.5 px-3 font-medium">{order.items?.length || 0} items</td>
                      <td className="py-3.5 px-3 font-bold text-slate-900">₹{order.totalAmount}</td>
                      <td className="py-3.5 px-3">{order.paymentMethod}</td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            order.status === 'Delivered'
                              ? 'bg-emerald-50 text-emerald-700'
                              : order.status === 'Shipped'
                              ? 'bg-sky-50 text-sky-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right text-slate-400">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No orders recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {stats?.recentOrders && stats.recentOrders.length > 0 ? (
              stats.recentOrders.map((order) => (
                <div key={order._id} className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col gap-3">
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                    <span className="font-mono font-bold text-slate-900 text-xs">#{order._id.substring(order._id.length - 8)}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        order.status === 'Delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.status === 'Shipped'
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-slate-400 font-semibold text-[10px] uppercase">Customer</p>
                      <p className="font-extrabold text-slate-900 truncate">{getCustomerDisplayName(order)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-400 font-semibold text-[10px] uppercase">Date</p>
                      <p className="font-medium text-slate-700">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-semibold text-[10px] uppercase">Items</p>
                      <p className="font-medium text-slate-700">{order.items?.length || 0} items</p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-400 font-semibold text-[10px] uppercase">Amount</p>
                      <p className="font-bold text-slate-900">₹{order.totalAmount} ({order.paymentMethod})</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-slate-400 text-xs font-semibold">
                No orders recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
