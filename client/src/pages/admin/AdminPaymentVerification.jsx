import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { CheckCircle, XCircle, Search, Clock, Eye, AlertCircle, RefreshCw } from 'lucide-react';
import { showSuccessToast, showErrorToast } from '../../utils/toast';
import { useConfirm } from '../../context/ConfirmContext';

export const AdminPaymentVerification = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const { confirm } = useConfirm();

  useEffect(() => {
    fetchPendingVerifications();
  }, []);

  const fetchPendingVerifications = async () => {
    setLoading(true);
    try {
      const data = await api.getAllOrders({ limit: 500 });
      // API returns { orders, totalOrders, totalPages, currentPage }
      const allOrders = Array.isArray(data) ? data : (data.orders || []);
      // Filter orders that need verification or were recently rejected
      const filtered = allOrders.filter(o => 
        o.paymentStatus === 'verification_pending' || 
        o.paymentStatus === 'rejected'
      );
      setOrders(filtered);
    } catch (error) {
      showErrorToast(error.message || 'Failed to fetch verifications');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (orderId, isApproved) => {
    const actionText = isApproved ? 'Approve' : 'Reject';
    const isConfirmed = await confirm({
      title: `${actionText} Payment`,
      message: `Are you sure you want to ${actionText.toLowerCase()} this payment?`,
      confirmText: `Yes, ${actionText}`,
      isDanger: !isApproved
    });

    if (!isConfirmed) return;

    try {
      await api.verifyPayment(orderId, isApproved);
      showSuccessToast(`Payment ${isApproved ? 'approved' : 'rejected'} successfully`);
      fetchPendingVerifications();
    } catch (error) {
      showErrorToast(error.message || `Failed to ${actionText.toLowerCase()} payment`);
    }
  };

  const filteredOrders = orders.filter((order) =>
    order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.paymentProof?.utrNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Payment Verification</h2>
          <p className="text-sm text-slate-500 mt-1">Review and approve manual UPI QR payments.</p>
        </div>
        <button 
          onClick={fetchPendingVerifications}
          className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Order ID, Customer, or UTR..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 focus:bg-white transition-colors"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">All Caught Up!</h3>
            <p className="text-slate-500 mt-1">No pending payment verifications.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-4 py-3 rounded-tl-xl rounded-bl-xl">Order & Customer</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">UTR Details</th>
                  <th className="px-4 py-3">Screenshot</th>
                  <th className="px-4 py-3 text-right rounded-tr-xl rounded-br-xl">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="font-bold text-brand-600">#{order._id.slice(-6)}</div>
                      <div className="text-slate-900 font-semibold mt-0.5">{order.user?.name || order.guestInfo?.name || 'Guest'}</div>
                      <div className="text-xs text-slate-500">{new Date(order.paymentProof?.submittedAt).toLocaleString()}</div>
                      {order.paymentStatus === 'rejected' && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-bold rounded-md uppercase tracking-wider">
                          Rejected
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-bold text-slate-900">₹{order.totalAmount}</div>
                      <div className="text-xs text-slate-500">{order.items.length} items</div>
                    </td>
                    <td className="px-4 py-4">
                      {order.paymentProof ? (
                        <>
                          <div className="font-bold text-slate-800 flex items-center gap-1.5">
                            <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-xs">{order.paymentProof.utrNumber}</span>
                          </div>
                          <div className="text-xs font-semibold text-slate-500 mt-1 flex items-center gap-1">
                            Via {order.paymentProof.paymentApp}
                          </div>
                        </>
                      ) : (
                        <span className="text-slate-400 italic">No proof submitted</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {order.paymentProof?.screenshotUrl ? (
                        <button 
                          onClick={() => setPreviewImage(order.paymentProof.screenshotUrl)}
                          className="relative group block w-16 h-16 rounded-lg overflow-hidden border border-slate-200"
                        >
                          <img 
                            src={order.paymentProof.screenshotUrl} 
                            alt="Payment Proof" 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Eye className="w-5 h-5 text-white" />
                          </div>
                        </button>
                      ) : (
                        <span className="text-slate-400 italic">No screenshot</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right">
                      {order.paymentStatus === 'verification_pending' && (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleVerify(order._id, true)}
                            className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl transition-colors"
                            title="Approve Payment"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleVerify(order._id, false)}
                            className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl transition-colors"
                            title="Reject Payment"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                      {order.paymentStatus === 'rejected' && (
                        <div className="text-xs font-semibold text-slate-500 flex items-center justify-end gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          Waiting for re-upload
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setPreviewImage(null)}
        >
          <div 
            className="bg-white p-2 rounded-2xl relative max-w-2xl max-h-[90vh] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition-colors z-10"
            >
              <XCircle className="w-6 h-6" />
            </button>
            <img 
              src={previewImage} 
              alt="Preview" 
              className="w-full max-h-[85vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
