import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ShoppingBag, Search, Eye, CheckCircle, Truck, Clock, XCircle, MapPin, Phone } from 'lucide-react';
import { api } from '../../services/api';
import { useConfirm } from '../../context/ConfirmContext';
import { showErrorToast } from '../../utils/toast';

export const AdminOrders = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialStatus = queryParams.get('status') || 'All';

  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { confirm } = useConfirm();

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  const statuses = ['All', 'Pending', 'Verification Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled', 'Return Requested', 'Rejected'];

  useEffect(() => {
    fetchOrders(1, statusFilter, searchQuery);
  }, [statusFilter, searchQuery]);

  const fetchOrders = async (page = 1, currentStatus = statusFilter, currentSearch = searchQuery) => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (currentStatus !== 'All') params.status = currentStatus;
      if (currentSearch.trim()) params.search = currentSearch.trim();
      
      const data = await api.getAllOrders(params);
      setOrders(data.orders || []);
      setTotalPages(data.totalPages || 1);
      setTotalOrders(data.totalOrders || 0);
      setCurrentPage(page);
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    if (newStatus === 'Cancelled') {
      const isConfirmed = await confirm({
        title: 'Cancel Order',
        message: 'Are you sure you want to mark this order as Cancelled?',
        confirmText: 'Yes, Cancel Order',
        isDanger: true
      });
      if (!isConfirmed) {
        fetchOrders(); // Refresh to reset dropdown
        return;
      }
    }

    try {
      const updated = await api.updateOrderStatus(orderId, newStatus);
      setOrders(orders.map((o) => (o._id === orderId ? updated : o)));
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(updated);
      }
    } catch (err) {
      showErrorToast(err.message || 'Failed to update order status');
    }
  };

  // Client-side filtering as a reliable fallback in case server-side params are dropped
  const filteredOrders = orders.filter((order) => {
    let match = true;
    if (statusFilter !== 'All' && order.status !== statusFilter) {
      match = false;
    }
    if (searchQuery.trim()) {
      const search = searchQuery.toLowerCase();
      const idStr = order._id.toLowerCase();
      const custName = (order.user?.name || order.guestInfo?.name || '').toLowerCase();
      const custPhone = (order.shippingAddress?.phone || order.guestInfo?.phone || '').toLowerCase();
      if (!idStr.includes(search) && !custName.includes(search) && !custPhone.includes(search)) {
        match = false;
      }
    }
    return match;
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
              onClick={() => { setStatusFilter(st); setCurrentPage(1); }}
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
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
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
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : order.status === 'Shipped'
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : order.status === 'Cancelled'
                                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                                    : order.status === 'Return Requested'
                                      ? 'bg-orange-50 text-orange-700 border-orange-200'
                                      : 'bg-amber-50 text-amber-700 border-amber-200'
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
                            <option value="Return Requested">Return Requested</option>
                            <option value="Rejected">Rejected</option>
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

            {/* Mobile Cards View */}
            <div className="grid grid-cols-1 gap-4 p-4 md:hidden">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <div key={order._id} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col gap-3 relative">
                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                      <div>
                        <span className="font-mono font-bold text-slate-900 text-sm block">#{order._id.substring(order._id.length - 8)}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                          order.status === 'Delivered'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : order.status === 'Shipped'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : order.status === 'Cancelled'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : order.status === 'Return Requested'
                                  ? 'bg-orange-50 text-orange-700 border-orange-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-slate-400 font-semibold text-[10px] uppercase">Customer</p>
                        <p className="font-bold text-slate-900 truncate">{order.user?.name || order.guestInfo?.name || 'Guest'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-slate-400 font-semibold text-[10px] uppercase">Phone</p>
                        <p className="font-medium text-slate-700">{order.shippingAddress?.phone || order.guestInfo?.phone}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 font-semibold text-[10px] uppercase">Total</p>
                        <p className="font-black text-slate-900">₹{order.totalAmount} ({order.paymentMethod})</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-slate-200/60 mt-1">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-brand-500 min-h-[44px]"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Return Requested">Return Requested</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-3 bg-brand-50 text-brand-700 border border-brand-100 rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors hover:bg-brand-100"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs">No matching orders found.</div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-4 sm:p-6 space-y-5 shadow-2xl border border-slate-100 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
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
                <div key={idx} className={`flex items-start justify-between p-2.5 rounded-xl ${item.status === 'Cancelled' ? 'bg-rose-50 opacity-60' : 'bg-slate-50'}`}>
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-lg shrink-0" />
                    <div className="flex flex-col flex-1 min-w-0 pr-2">
                      <span className="font-semibold text-slate-800 break-words leading-tight mt-0.5">{item.name}</span>
                      {item.variant && (
                        <span className="text-[10px] font-bold text-brand-600 mt-1">
                          {item.variant.name}: {item.variant.value}
                        </span>
                      )}
                      {item.status === 'Cancelled' && <span className="text-[9px] font-bold text-rose-600 uppercase mt-0.5">Cancelled</span>}
                    </div>
                  </div>
                  <span className={`font-bold shrink-0 mt-0.5 ${item.status === 'Cancelled' ? 'line-through text-slate-400' : ''}`}>
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
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">{totalOrders} total · Page {currentPage} of {totalPages}</span>
          <div className="flex gap-2">
            <button
              onClick={() => fetchOrders(currentPage - 1)}
              disabled={currentPage <= 1 || loading}
              className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ← Prev
            </button>
            <button
              onClick={() => fetchOrders(currentPage + 1)}
              disabled={currentPage >= totalPages || loading}
              className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
