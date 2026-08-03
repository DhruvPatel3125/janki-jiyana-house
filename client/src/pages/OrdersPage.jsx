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
  
  // Custom Modal State for Partial Cancellation
  const [cancelModal, setCancelModal] = useState({ isOpen: false, order: null, item: null, maxQty: 1, selectedQty: 1 });

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

  const getWhatsAppActionUrl = (order, item = null, cancelQuantity = null) => {
    const isShipped = order.status === 'Shipped' || order.status === 'Delivered';
    const actionType = isShipped ? 'Report Defective Product' : 'Cancellation';
    const qty = cancelQuantity || (item ? item.quantity : 0);
    const itemsList = item ? `${item.name} (x${qty})` : order.items.map((i) => `${i.name} (x${i.quantity})`).join(', ');
    
    let text = '';
    if (isShipped) {
      text = `Hello Janki Jiyana House,%0A%0AI want to report a *defective/damaged product* from my order.%0A%0A*Order ID:* ${order._id}%0A*Items:* ${itemsList}%0A%0A[Please attach unboxing video/photos here]`;
    } else {
      text = `Hello Janki Jiyana House,%0A%0AI want to request a *${actionType}* for a specific item in my order.%0A%0A*Order ID:* ${order._id}%0A*Item:* ${itemsList}%0A%0APlease assist me with the ${actionType.toLowerCase()}.`;
    }
    return `https://wa.me/919737474672?text=${text}`;
  };

  const openCancelModal = (order, item) => {
    const isShipped = order.status === 'Shipped' || order.status === 'Delivered';
    if (!isShipped && item.quantity > 1) {
      setCancelModal({
        isOpen: true,
        order,
        item,
        maxQty: item.quantity,
        selectedQty: item.quantity
      });
    } else {
      // Proceed directly to confirmation for single items or shipped items
      processCancellation(order, item, item.quantity);
    }
  };

  const processCancellation = async (order, item, cancelQuantity) => {
    const isShipped = order.status === 'Shipped' || order.status === 'Delivered';

    const isConfirmed = await confirm({
      title: isShipped ? 'Report Defective Product' : 'Cancel Item',
      message: isShipped 
        ? `Are you sure you want to report ${item.name} as defective? You will be redirected to WhatsApp to share unboxing photos/videos.`
        : `Are you sure you want to cancel ${cancelQuantity} x ${item.name} from this order?`,
      confirmText: isShipped ? 'Yes, Report Defect' : 'Yes, Cancel Item',
      isDanger: true
    });
    
    if (!isConfirmed) return;

    try {
      // Open WhatsApp first so the browser doesn't block the popup during async await
      const url = getWhatsAppActionUrl(order, item, cancelQuantity);
      window.open(url, '_blank');
      
      // Update DB if not shipped yet
      if (!isShipped) {
        const updatedOrder = await api.cancelItem(order._id, item._id, cancelQuantity);
        setOrders(orders.map((o) => (o._id === order._id ? updatedOrder : o)));
      }
    } catch (err) {
      console.error('Failed to cancel item', err);
      alert('Failed to cancel item. Please try again.');
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
                            onClick={() => openCancelModal(order, item)}
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

      {/* Custom Quantity Cancellation Modal */}
      {cancelModal.isOpen && cancelModal.item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black text-slate-900 mb-2">Cancel Item</h3>
            <p className="text-slate-500 text-sm mb-6">
              You ordered {cancelModal.maxQty} pieces of this item. How many would you like to cancel?
            </p>
            
            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-2xl p-2 mb-8">
              <button
                onClick={() => setCancelModal(prev => ({ ...prev, selectedQty: Math.max(1, prev.selectedQty - 1) }))}
                className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm text-slate-600 font-bold hover:bg-slate-100 disabled:opacity-50"
                disabled={cancelModal.selectedQty <= 1}
              >
                -
              </button>
              <span className="text-xl font-black text-slate-900 w-12 text-center">
                {cancelModal.selectedQty}
              </span>
              <button
                onClick={() => setCancelModal(prev => ({ ...prev, selectedQty: Math.min(prev.maxQty, prev.selectedQty + 1) }))}
                className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm text-slate-600 font-bold hover:bg-slate-100 disabled:opacity-50"
                disabled={cancelModal.selectedQty >= cancelModal.maxQty}
              >
                +
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setCancelModal({ isOpen: false, order: null, item: null, maxQty: 1, selectedQty: 1 })}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setCancelModal(prev => ({ ...prev, isOpen: false }));
                  processCancellation(cancelModal.order, cancelModal.item, cancelModal.selectedQty);
                }}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-sm text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-lg shadow-rose-500/25"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
