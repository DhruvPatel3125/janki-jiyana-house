import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Package, MapPin, Truck, ShoppingBag, PhoneCall, MessageCircle, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

export const OrderSuccessPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await api.getOrderById(id);
        setOrder(data);
      } catch (err) {
        console.error('Failed to load order', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-slate-500 text-sm">Generating your order invoice...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-100 shadow-lg text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-extrabold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full">
            Order Placed Successfully
          </span>
          <h1 className="text-3xl font-black text-slate-900">Thank You for Your Order!</h1>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Your order has been recorded and is being prepared with 100% plain, discreet packaging.
          </p>
        </div>

        {/* Order ID banner */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 inline-block">
          <span className="text-xs text-slate-400 block font-medium">Order Confirmation ID</span>
          <span className="text-lg font-mono font-bold text-slate-800">{order?._id || id}</span>
        </div>

        {/* Details Grid */}
        {order && (
          <div className="text-left bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4 text-xs">
            <h4 className="font-extrabold text-slate-800 text-sm border-b border-slate-200 pb-2">
              Order Details & Summary
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 block">Payment Method</span>
                <span className="font-bold text-slate-800">{order.paymentMethod}</span>
              </div>

              <div>
                <span className="text-slate-400 block">Order Status</span>
                <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  {order.status}
                </span>
              </div>

              <div className="sm:col-span-2">
                <span className="text-slate-400 block">Shipping Address</span>
                <span className="font-semibold text-slate-800">
                  {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} -{' '}
                  {order.shippingAddress.zipCode} (Phone: {order.shippingAddress.phone})
                </span>
              </div>
            </div>

            {/* Items */}
            <div className="pt-2 border-t border-slate-200 space-y-2">
              <span className="text-slate-400 block font-semibold">Ordered Items</span>
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-slate-700">
                  <span>
                    {item.name} (x{item.quantity})
                  </span>
                  <span className="font-bold">₹{item.price * item.quantity}</span>
                </div>
              ))}
              <div className="flex justify-between items-center text-slate-900 font-extrabold text-sm pt-2 border-t border-slate-200">
                <span>Total Amount Paid/Payable</span>
                <span className="text-base text-brand-600">₹{order.totalAmount}</span>
              </div>
            </div>
          </div>
        )}

        {/* Order Actions */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs text-slate-600 space-y-1">
            <p className="font-bold text-slate-800 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Need to Cancel or Change Order?
            </p>
            <p className="text-[11px] text-slate-500">
              If you placed this order by mistake or want to change your items/address, click WhatsApp below to inform us instantly.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/shop"
              className="w-full sm:w-auto bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" /> Continue Shopping
            </Link>

            <a
              href={`https://wa.me/919824934361?text=Hello%20Janki%20Jiyana%20House,%20I%20want%20to%20track/manage%20my%20Order%20%23${order?._id || id}`}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" /> Track / Cancel on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
