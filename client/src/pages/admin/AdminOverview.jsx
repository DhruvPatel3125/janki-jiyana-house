import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  IndianRupee,
  ShoppingBag,
  Clock,
  AlertTriangle,
  Users,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { api } from '../../services/api';

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

  if (loading) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-slate-500 text-sm">Loading admin dashboard statistics...</p>
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

  const metricCards = [
    {
      label: 'Total Revenue',
      value: `₹${stats?.totalRevenue?.toLocaleString('en-IN') || 0}`,
      icon: IndianRupee,
      bg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    },
    {
      label: 'Total Orders',
      value: stats?.totalOrdersCount || 0,
      icon: ShoppingBag,
      bg: 'bg-brand-50 text-brand-600 border-brand-100',
    },
    {
      label: 'Pending Orders',
      value: stats?.pendingOrdersCount || 0,
      icon: Clock,
      bg: 'bg-amber-50 text-amber-600 border-amber-100',
    },
    {
      label: 'Low Stock Products',
      value: stats?.lowStockProductsCount || 0,
      icon: AlertTriangle,
      bg: 'bg-rose-50 text-rose-600 border-rose-100',
    },
    {
      label: 'Registered Customers',
      value: stats?.usersCount || 0,
      icon: Users,
      bg: 'bg-sky-50 text-sky-600 border-sky-100',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">Dashboard Overview</h1>
        <p className="text-xs text-slate-500 mt-1">
          Real-time summary of sales revenue, order fulfillment, inventory stock, and customer metrics.
        </p>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        {metricCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-3`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{card.label}</span>
                <div className={`p-2.5 rounded-2xl ${card.bg} border`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg">Recent Customer Orders</h3>
            <p className="text-xs text-slate-500">Latest orders placed on Janki Jiyana House shop.</p>
          </div>
          <Link
            to="/admin/orders"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            Manage All Orders <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3 px-3">Order ID</th>
                <th className="pb-3 px-3">Customer / Guest</th>
                <th className="pb-3 px-3">Items Count</th>
                <th className="pb-3 px-3">Total Amount</th>
                <th className="pb-3 px-3">Payment</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                stats.recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-3 font-mono font-bold text-slate-900">
                      {order._id.substring(order._id.length - 8)}
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-800">
                      {order.user?.name || order.guestInfo?.name || 'Guest Customer'}
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
      </div>
    </div>
  );
};

export default AdminOverview;
