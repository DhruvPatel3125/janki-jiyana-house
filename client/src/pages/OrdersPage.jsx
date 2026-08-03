import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, CheckCircle2, ChevronRight, ShoppingBag, MessageCircle, XCircle } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useConfirm } from '../context/ConfirmContext';

export const OrdersPage = () => {
  const { user } = useAuth();
  const { confirm } = useConfirm();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await api.getMyOrders(1, 10);
        setOrders(data.orders || []);
        setTotalPages(data.totalPages || 1);
        setTotalOrders(data.totalOrders || 0);
        setCurrentPage(1);
      } catch (err) {
        console.error('Failed to load user orders', err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchOrders();
  }, [user]);

  const handleLoadMoreOrders = async () => {
    const nextPage = currentPage + 1;
    setLoadingMore(true);
    try {
      const data = await api.getMyOrders(nextPage, 10);
      setOrders(prev => [...prev, ...(data.orders || [])]);
      setCurrentPage(nextPage);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('Failed to load more orders', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const getWhatsAppActionUrl = (order, item = null) => {
    const isShipped = order.status === 'Shipped' || order.status === 'Delivered';
    const actionType = isShipped ? 'Report Defective Product' : 'Cancellation';
    const itemsList = item ? `${item.name} (x${item.quantity})` : order.items.map((i) => `${i.name} (x${i.quantity})`).join(', ');
    
    let text = '';
    if (isShipped) {
      text = `Hello Janki Jiyana House,%0A%0AI want to report a *defective/damaged product* from my order.%0A%0A*Order ID:* ${order._id}%0A*Items:* ${itemsList}%0A%0A[Please attach unboxing video/photos here]`;
    } else {
      text = `Hello Janki Jiyana House,%0A%0AI want to request a *${actionType}* for a specific item in my order.%0A%0A*Order ID:* ${order._id}%0A*Item:* ${itemsList}%0A%0APlease assist me with the ${actionType.toLowerCase()}.`;
    }
    return `https://wa.me/919737474672?text=${text}`;
  };

  const handleCancelItem = async (order, item) => {
    const isShipped = order.status === 'Shipped' || order.status === 'Delivered';
    
    const isConfirmed = await confirm({
      title: isShipped ? 'Report Defective Product' : 'Cancel Item',
      message: isShipped 
        ? `Are you sure you want to report ${item.name} as defective? You will be redirected to WhatsApp to share unboxing photos/videos.`
        : `Are you sure you want to cancel ${item.name} from this order?`,
      confirmText: isShipped ? 'Yes, Report Defect' : 'Yes, Cancel Item',
      isDanger: true
    });
    
    if (!isConfirmed) return;

    try {
      // Open WhatsApp first so the browser doesn't block the popup during async await
      const url = getWhatsAppActionUrl(order, item);
      window.open(url, '_blank');
      
      // Update DB if not shipped yet
      if (!isShipped) {
        const updatedOrder = await api.cancelItem(order._id, item._id);
        setOrders(orders.map((o) => (o._id === order._id ? updatedOrder : o)));
      }
    } catch (err) {
      console.error('Failed to cancel item', err);
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
        <span className="text-xs font-semibold text-slate-500">Total Orders: {totalOrders}</span>
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
              <div className="space-y-3">
                {order.items.map((item, idx) => (
                  <div key={idx} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs p-3 rounded-2xl border ${item.status === 'Cancelled' ? 'bg-rose-50 border-rose-100 opacity-70' : 'bg-slate-50 border-slate-100'}`}>
                    <div className="flex items-center gap-3">
                      <img src={item.image} alt={item.name} loading="lazy" className="w-12 h-12 object-cover rounded-lg bg-white shadow-sm" />
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">{item.name}</span>
                        {item.variant && (
                          <span className="text-[10px] text-brand-600 font-bold mb-0.5">
                            {item.variant.name}: {item.variant.value}
                          </span>
                        )}
                        <span className="text-slate-500">
                          {item.quantity} x ₹{item.price}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                      {item.status === 'Cancelled' ? (
                        <span className="text-[10px] font-black text-rose-600 bg-rose-100 px-2 py-1 rounded-md uppercase tracking-wider">Cancelled</span>
                      ) : (
                        order.status !== 'Cancelled' && order.status !== 'Return Requested' && (
                          <button
                            onClick={() => handleCancelItem(order, item)}
                            className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold px-3 py-2 rounded-xl transition-colors shadow-sm w-full sm:w-auto justify-center"
                            title={order.status === 'Shipped' || order.status === 'Delivered' ? 'Report Defective Product' : 'Cancel Item'}
                          >
                            {order.status === 'Shipped' || order.status === 'Delivered' ? (
                              <><MessageCircle className="w-3.5 h-3.5 text-orange-500" /> Report Defect</>
                            ) : (
                              <><XCircle className="w-3.5 h-3.5 text-rose-500" /> Cancel Item</>
                            )}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <span className="text-xs text-slate-500 font-medium">Payment Method: {order.paymentMethod}</span>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-extrabold text-slate-900 text-sm mr-2">Total: ₹{order.totalAmount}</span>

                  {/* Payment Alert for UPI QR */}
                  {(order.paymentStatus === 'pending' || order.paymentStatus === 'rejected') && order.paymentMethod === 'UPI_QR' && (
                    <Link
                      to={`/payment/${order._id}`}
                      className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-colors ${
                        order.paymentStatus === 'rejected' 
                          ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200' 
                          : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {order.paymentStatus === 'rejected' ? 'Re-verify Payment' : 'Complete Payment'}
                    </Link>
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

      {/* Load More for Orders */}
      {currentPage < totalPages && (
        <div className="flex justify-center pt-2">
          <button
            onClick={handleLoadMoreOrders}
            disabled={loadingMore}
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-8 py-3 rounded-2xl shadow-md transition-all active:scale-95 disabled:opacity-60"
          >
            {loadingMore ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Loading...</>
            ) : (
              'Load More Orders'
            )}
          </button>
        </div>
      )}
    </div>
  );
};
