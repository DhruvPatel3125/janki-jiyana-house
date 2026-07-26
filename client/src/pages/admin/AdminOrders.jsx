import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, Eye, CheckCircle, Truck, Clock, XCircle, MapPin, Phone } from 'lucide-react';
import { api } from '../../services/api';

export const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const statuses = ['All', 'Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await api.getAllOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const updated = await api.updateOrderStatus(orderId, newStatus);
      setOrders(orders.map((o) => (o._id === orderId ? updated : o)));
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(updated);
      }
    } catch (err) {
      alert(err.message || 'Failed to update order status');
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
    const nameMatch = (o.user?.name || o.guestInfo?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const idMatch = o._id.toLowerCase().includes(searchQuery.toLowerCase());
    const phoneMatch = (o.shippingAddress?.phone || '').includes(searchQuery);
    return matchesStatus && (nameMatch || idMatch || phoneMatch);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">Manage Customer Orders</h1>
        <p className="text-xs text-slate-500 mt-1">
          Track customer orders, review delivery addresses, and update fulfillment status.
        </p>
      </div>

      {/* Status Filter Tabs & Search */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search order by ID, customer name, or phone number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-brand-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs">Loading orders...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Order ID & Date</th>
                  <th className="py-3.5 px-4">Customer Details</th>
                  <th className="py-3.5 px-4">Total & Payment</th>
                  <th className="py-3.5 px-4">Current Status</th>
                  <th className="py-3.5 px-4">Update Status</th>
                  <th className="py-3.5 px-4 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-slate-900 block">
                          #{order._id.substring(order._id.length - 8)}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(order.createdAt).toLocaleString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-800 block">
                          {order.user?.name || order.guestInfo?.name || 'Guest Customer'}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          📞 {order.shippingAddress?.phone || order.guestInfo?.phone}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-black text-slate-900 text-sm block">₹{order.totalAmount}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{order.paymentMethod}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-extrabold ${
                            order.status === 'Delivered'
                              ? 'bg-emerald-50 text-emerald-700'
                              : order.status === 'Shipped'
                              ? 'bg-sky-50 text-sky-700'
                              : order.status === 'Cancelled'
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-brand-500"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-1.5 text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                          title="View Full Order Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No matching orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 space-y-5 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-base">Order Details</h3>
                <span className="font-mono text-xs text-slate-400">ID: {selectedOrder._id}</span>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-1 text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            {/* Delivery address */}
            <div className="bg-slate-50 p-4 rounded-2xl space-y-1 text-xs">
              <span className="font-bold text-slate-800 block flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-brand-600" /> Delivery Address
              </span>
              <p className="text-slate-600 leading-relaxed">
                {selectedOrder.shippingAddress?.street}, {selectedOrder.shippingAddress?.city},{' '}
                {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.zipCode}
              </p>
              <p className="text-slate-800 font-semibold pt-1">
                Phone: {selectedOrder.shippingAddress?.phone}
              </p>
            </div>

            {/* Items */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-slate-800 block">Ordered Items ({selectedOrder.items?.length})</span>
              {selectedOrder.items?.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                  <div className="flex items-center gap-2">
                    <img src={item.image} alt={item.name} className="w-8 h-8 object-cover rounded-lg" />
                    <span className="font-semibold text-slate-800 line-clamp-1 max-w-[180px]">{item.name}</span>
                  </div>
                  <span className="font-bold">
                    {item.quantity} x ₹{item.price}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-sm">
              <span className="font-bold text-slate-800">Total Paid/Payable</span>
              <span className="font-black text-slate-900 text-lg">₹{selectedOrder.totalAmount}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
