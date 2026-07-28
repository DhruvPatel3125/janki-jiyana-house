import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, CheckCircle2, ChevronRight, ShoppingBag, MessageCircle, XCircle } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const OrdersPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await api.getMyOrders();
        setOrders(data);
      } catch (err) {
        console.error('Failed to load user orders', err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchOrders();
  }, [user]);

  const getWhatsAppActionUrl = (order) => {
    const isShipped = order.status === 'Shipped' || order.status === 'Delivered';
    const actionType = isShipped ? 'Return' : 'Cancellation';
    const itemsList = order.items.map((i) => `${i.name} (x${i.quantity})`).join(', ');
    const text = `Hello Janki Jiyana House,%0A%0AI want to request a *${actionType}* for my order.%0A%0A*Order ID:* ${order._id}%0A*Items:* ${itemsList}%0A*Total Amount:* ₹${order.totalAmount}%0A*Payment:* ${order.paymentMethod}%0A%0APlease assist me with the ${actionType.toLowerCase()}.`;
    return `https://wa.me/919824934361?text=${text}`;
  };

  const handleCancelOrReturn = async (order) => {
    try {
      // Open WhatsApp first so the browser doesn't block the popup during async await
      const url = getWhatsAppActionUrl(order);
      window.open(url, '_blank');
      
      // Update DB
      const updatedOrder = await api.requestCancelOrReturn(order._id);
      
      // Update local state
      setOrders(orders.map((o) => (o._id === order._id ? updatedOrder : o)));
    } catch (err) {
      console.error('Failed to update order status', err);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4 px-4">
        <h2 className="text-xl font-bold text-slate-800">Please Sign In</h2>
        <p className="text-slate-500 text-sm">You need to log in to view your order history.</p>
        <Link to="/login" className="inline-block bg-brand-600 text-white font-bold text-sm px-6 py-2.5 rounded-xl">
          Login Now
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-slate-500 text-sm mt-4">Loading your past orders...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-slate-900">My Orders</h1>
        <span className="text-xs font-semibold text-slate-500">Total Orders: {orders.length}</span>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center space-y-4 shadow-sm">
          <Package className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No Orders Placed Yet</h3>
          <p className="text-slate-500 text-sm">When you place orders, they will appear here with live status tracking.</p>
          <Link
            to="/shop"
            className="inline-block bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs px-6 py-3 rounded-xl transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 hover:border-slate-200 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3 text-xs">
                <div>
                  <span className="text-slate-400">Order ID: </span>
                  <span className="font-mono font-bold text-slate-800">{order._id}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                  <span
                    className={`font-bold px-2.5 py-0.5 rounded-full ${order.status === 'Cancelled'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Items summary */}
              <div className="space-y-2">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-lg bg-slate-50" />
                      <span className="font-bold text-slate-800">{item.name}</span>
                    </div>
                    <span className="text-slate-500">
                      {item.quantity} x ₹{item.price}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <span className="text-xs text-slate-500 font-medium">Payment Method: {order.paymentMethod}</span>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-extrabold text-slate-900 text-sm mr-2">Total: ₹{order.totalAmount}</span>

                  {/* WhatsApp Order Cancel / Return Request Button */}
                  {order.status !== 'Cancelled' && order.status !== 'Return Requested' && (
                    <button
                      onClick={() => handleCancelOrReturn(order)}
                      className="inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold px-3 py-1.5 rounded-xl transition-colors"
                      title={order.status === 'Shipped' || order.status === 'Delivered' ? 'Request Return on WhatsApp' : 'Cancel Order on WhatsApp'}
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{order.status === 'Shipped' || order.status === 'Delivered' ? 'Return Order' : 'Cancel Order'}</span>
                    </button>
                  )}

                  <Link
                    to={`/order-success/${order._id}`}
                    className="inline-flex items-center text-xs font-bold text-brand-600 hover:underline"
                  >
                    Details <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
